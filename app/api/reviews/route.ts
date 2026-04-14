import { NextResponse } from "next/server";
import connectToDatabase from "@/database/mongodb";
import connectToDatabaseDry from "@/database/mongodb-dry";
import Progress from "@/models/progress.model"
import User from "@/models/user.model";
import { calculateNextReview } from "@/lib/srs";
import { XP_VALUES, getXpForNextLevel } from "@/lib/system";

export async function POST(request: Request){
    try {
        // Lets try to connect to the data bank
        await connectToDatabase();
        // await connectToDatabaseDry();    // connection withou the lerolero

        // Extraction the data sent from the front end
        const body = await request.json();
        const { userId, cardId, isCorrect } = body;

        if( !userId || !cardId || typeof isCorrect !== 'boolean' ) {
            return NextResponse.json({ error: "⛔ Missing required fields."}, { status: 400 });
        }

        // Get progress from data base
        const progress = await Progress.findOne({userId, cardId});
        const user = await User.findById(userId);

        if( !progress || !user ) {
            return NextResponse.json({ error: "⛔ Progress or User not found" }, { status: 404 });
        }

        // Begin the SRS
        const srsResult = calculateNextReview(
            isCorrect,
            progress.stepIndex,
            progress.interval,
            {
                learningSteps: user.settings.learningSteps,
                graduatingMultiplier: user.settings.graduatingMultiplier
            }
        );

        // Check if card is graduating
        const cardGraduated = isCorrect && progress.stepIndex < user.settings.learningSteps.length - 1 && srsResult.stepIndex === user.settings.learningSteps.length -1;

        progress.setIndex   = srsResult.stepIndex;
        progress.interval   = srsResult.interval;
        progress.dueDate    = srsResult.dueDate;
        progress.repetition = isCorrect ? progress.repetition + 1 : 0;

        // Experience handle
        let leveledUp = false;
        let xpEarned = 0;

        if( isCorrect ) {
            xpEarned = XP_VALUES.CARD_CORRECT_ANSWER;
            if (cardGraduated) xpEarned += XP_VALUES.CARD_GRADUATION;

            user.experience += xpEarned;

            // Check if level up
            const xpNeeded = getXpForNextLevel(user.level);
            if( user.experience >= xpNeeded ) {
                user.level += 1;
                leveledUp   = true;
            }
        }

        // Saving everything to db
        await Promise.all([progress.save(), user.save()]);

        // Response
        return NextResponse.json({
            success: true,
            xpEarned,
            leveledUp,
            newLevel: user.level,
            nexrReview: progress.dueDate
        }, { status: 200 });

    } catch (error) {
        console.error("Error processing review:", error);
        return NextResponse.json({error: "Internal Server Error"}, { status: 500 });
    }
}