import { NextResponse } from "next/server";
import connectToDatabase from "@/database/mongodb";
import Progress from "@/models/progress.model";
import User from "@/models/user.model";
import Card from "@/models/card.model";
import ReviewLog from "@/models/review-log.model";
import { calculateNextReview } from "@/lib/srs";
import { XP_VALUES, getXpForNextLevel } from "@/lib/system";

export async function POST(request: Request){
    try {
        // connect to the database
        await connectToDatabase();

        // extraction the data sent from the front end
        const body = await request.json();
        const { userId, cardId, isCorrect } = body;

        if( !userId || !cardId || typeof isCorrect !== 'boolean' ) {
            return NextResponse.json({ error: "⛔ Missing required fields."}, { status: 400 });
        }

        // Get progress, user, and card from database
        let progress = await Progress.findOne({userId, cardId});
        const user = await User.findById(userId);
        const card = await Card.findById(cardId).select("deckId"); // fetching only the deckId to save memory

        // console.log("=== DEBUG MONGODB ===");
        // console.log("UserID recebido:", userId);
        // console.log("CardID recebido:", cardId);
        // console.log("Achou User?", !!user);
        // console.log("Achou Card?", !!card);
        // console.log("Achou Progress?", !!progress);

        if( !user || !card ) {
            return NextResponse.json({ error: "⛔ Progress, User, or Card not found" }, { status: 404 });
        }

        // new progress for new cards
        if (!progress) {
            progress = new Progress({
                userId: userId,
                cardId: cardId,
                deckId: card.deckId,
                stepIndex: 0,
                interval: 0,
                repetition: 0,
                dueDate: new Date(),
            });
        }

        // begin the SRS
        const srsResult = calculateNextReview(
            isCorrect,
            progress.stepIndex,
            progress.interval,
            {
                learningSteps: user.settings.learningSteps,
                graduatingMultiplier: user.settings.graduatingMultiplier
            }
        );

        // check if card is graduating
        const cardGraduated = 
            isCorrect && 
            progress.stepIndex < user.settings.learningSteps.length - 1 &&
            srsResult.stepIndex === user.settings.learningSteps.length -1;

        progress.stepIndex  = srsResult.stepIndex; 
        progress.interval   = srsResult.interval;
        progress.dueDate    = srsResult.dueDate;
        progress.repetition = isCorrect ? progress.repetition + 1 : 0;

        // experience handle
        let leveledUp = false;
        let xpEarned = 0;

        if( isCorrect ) {
            xpEarned = XP_VALUES.CARD_CORRECT_ANSWER;
            if (cardGraduated) xpEarned += XP_VALUES.CARD_GRADUATION;

            user.experience += xpEarned;

            // check if level up
            const xpNeeded = getXpForNextLevel(user.level);
            if( user.experience >= xpNeeded ) {
                user.level      += 1;
                leveledUp       = true;
                user.experience = 0;
            }
        }

        const newReviewLog = new ReviewLog({
            userId: userId,
            cardId: cardId,
            deckId: card.deckId, // for dashboard
            isCorrect: isCorrect,
            reviewedAt: new Date()
        });

        // saving everything to db concurrently
        await Promise.all([
            progress.save(), 
            user.save(),
            newReviewLog.save()
        ]);

        // Response
        return NextResponse.json({
            success: true,
            xpEarned,
            leveledUp,
            newLevel: user.level,
            nextReview: progress.dueDate
        }, { status: 200 });

    } catch (error) {
        console.error("Error processing review:", error);
        return NextResponse.json({error: "Internal Server Error"}, { status: 500 });
    }
}