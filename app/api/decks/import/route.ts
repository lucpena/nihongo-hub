import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import Deck from "@/models/deck.model";
import Card from "@/models/card.model";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // auth
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    // parsing the JSON
    const data = await request.json();
    const { deck_name, cards } = data;

    if (!deck_name || !cards || !Array.isArray(cards)) {
      return NextResponse.json({ error: "Invalid JSON format." }, { status: 400 });
    }

    // check if decks already exists
    const existingDeck = await Deck.findOne({ name: deck_name, userId });
    
    if (existingDeck) {
      return NextResponse.json(
        { error: `A deck named "${deck_name}" already exists.` },
        { status: 409 } // 409 -> Conflict
      );
    }

    // create the deck
    const newDeck = await Deck.create({
      name: deck_name,
      userId: userId,
      isPublic: false, // Default to private
    });

    // format card for MongoDB
    const cardsToInsert = cards.map((card: any) => ({
      deckId: newDeck._id,
      userId: userId,
      type: card.type || "type", // fallback type
      content: card, // Store all flexible Anki data here
      face: card.kanji || card.grammar || card.face || "Unknown Front",
      interval: 1,
      repetition: 0,
      stepIndex: 0,
      dueDate: new Date(),
    }));

    // bulk insert all cards
    await Card.insertMany(cardsToInsert);

    return NextResponse.json(
      { message: "Deck imported successfully!", deckId: newDeck._id },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("⛔ Import error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}