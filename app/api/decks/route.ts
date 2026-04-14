import { NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import Deck from "@/models/deck.model";

export async function GET() {
    try {
        await dbConnect();

        const currentUserId = "64b8c9e5f1a2c9b1d2e3f4a"; // Replace with actual user ID from auth context
        const availableDecks = await Deck.find({
            $or: [
                { userId: currentUserId }, // User's own decks
                { isPublic: true }         // Public decks
            ]
        }).select("name description isPublic createdAt updatedAt");

        return NextResponse.json(
            { success: true, count: availableDecks.length, decks: availableDecks },
            { status: 200 });
    } catch (error) {
        console.error("⛔ Error fetching decks:", error);

        return NextResponse.json(
            { success: false, message: "⛔ Server Error: Failed to fetch decks" },
            { status: 500 });
    }       
}