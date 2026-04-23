// app/study/[deckId]/page.tsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import dbConnect from "@/database/mongodb";
import User from "@/models/user.model";
import Card from "@/models/card.model";
import Progress from "@/models/progress.model";
import StudySession from "@/components/study-session";

export default async function StudyPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = await params;
  
  // auth and stuff
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
  await dbConnect();

  const user = await User.findById(decoded.userId).lean();
  if (!user) redirect("/login");

  // fetch all cards belonging to this deck
  const allDeckCards = await Card.find({ deckId }).lean();
  const cardIds = allDeckCards.map(c => c._id);

  // fetch current progress for these cards
const userProgress = await Progress.find({
    userId: user._id,
    deckId: deckId // <-- Busca direta, sem precisar do array de cartas!
}).lean();

  //separate review cards from new cards
  const now = new Date();
  
  // Review Cards: Already started (stepIndex != 0) and Due Date <= now
  const reviewCards = userProgress
    .filter(p => p.stepIndex !== 0 && new Date(p.dueDate) <= now)
    .map(p => {
      const cardData = allDeckCards.find(c => c._id.toString() === p.cardId.toString());
      return { ...cardData, progress: p };
    });

  // New Cards: stepIndex is 0 (New) OR no progress record exists yet
  const cardsWithProgressIds = userProgress.map(p => p.cardId.toString());
  const newCardsPotential = allDeckCards.filter(c => 
    !cardsWithProgressIds.includes(c._id.toString()) || 
    userProgress.find(p => p.cardId.toString() === c._id.toString())?.stepIndex === 0
  );

  // Apply User Limit for New Cards (e.g., 20 per day)
  const newCardsLimit = user.settings?.newCardsPerDay || 20;
  const newCards = newCardsPotential.slice(0, newCardsLimit).map(c => {
    const p = userProgress.find(up => up.cardId.toString() === c._id.toString());
    return { ...c, progress: p || null };
  });

  // Combined Queue
  const sessionQueue = [...reviewCards, ...newCards].map(item => ({
    id: item._id.toString(),
    face: item.face,
    content: item.content, // Make sure your Card model has this
    type: item.type,
    progressId: item.progress?._id?.toString() || null,
  }));

  if (sessionQueue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <h1 className="text-3xl font-bold text-primary">All done! 🎉</h1>
        <p className="text-muted-foreground">You have reviewed all cards for today in this deck.</p>
      </div>
    );
  }

  return (
    <div className="container w-4xl py-6 pl-36 h-full flex flex-col items-center">
      <StudySession 
        initialCards={sessionQueue} 
        deckId={deckId}
        userId={user._id.toString()}
      />
    </div>
  );
}