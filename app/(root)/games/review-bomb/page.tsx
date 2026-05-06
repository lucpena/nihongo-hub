import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import dbConnect from "@/database/mongodb";
import User from "@/models/user.model";
import Card from "@/models/card.model";
import Progress from "@/models/progress.model";
import BombSession from "@/components/bomb-session";
import Deck from "@/models/deck.model";


export default async function ReviewBombPage() {
  // fetching data
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // not logged
  if (!token) redirect("/login");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
  } catch (error) {
    redirect("/login");
  }

  await dbConnect();

  // all cards already studied by the user
  const userProgress = await Progress.find({ userId: decoded.userId }, 'cardId').lean();
  
  if (userProgress.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <h2 className="text-xl">Você precisa estudar algumas cartas no modo normal primeiro!</h2>
      </div>
    );
  }

  const cardIds = userProgress.map(p => p.cardId);

  // get card data
  const cards = await Card.find({ _id: { $in: cardIds } })
    .populate("deckId", "deck_name") // gets the name been referenced in the card
    .lean();

  // data to be passed forward
  const sessionQueue = cards.map((card: any) => ({
    _id: card._id.toString(),
    type: card.type,
    face: card.face,
    content: card.content,
    // Extrai o nome do deck do objeto populado, ou usa um texto padrão
    deck_name: card.deckId?.deck_name || "Unknown Deck", 
  }));

  return (
    <div className="container w-4xl pt-6 pl-40 h-full flex flex-col items-center ">
      <h1 className="text-3xl mb-6 text-center text-red-500 animate-pulse">Review Bomb</h1>
      <BombSession initialCards={sessionQueue} />
    </div>
  );
}