import { NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import Deck from "@/models/deck.model";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await dbConnect();

    // auth check
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    const currentUserId = decoded.userId;

    console.log("  >Fetching decks for user ID: ", currentUserId);

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, message: "⛔ Unauthorized: User ID is missing" },
        { status: 401 },
      );
    }

    const availableDecks = await Deck.find({
      $or: [
        { userId: currentUserId }, // User's own decks
        { isPublic: true }, // Public decks
      ]
    }).select("name description isPublic createdAt updatedAt");

    return NextResponse.json(
      { success: true, count: availableDecks.length, decks: availableDecks },
      { status: 200 },
    );
  } catch (error) {
    console.error("⛔ Error fetching decks:", error);

    return NextResponse.json(
      { success: false, message: "⛔ Server Error: Failed to fetch decks" },
      { status: 500 },
    );
  }
}
