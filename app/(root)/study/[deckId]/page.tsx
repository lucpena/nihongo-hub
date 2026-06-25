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

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
  } catch (error) {
    redirect("/login");
  }

  await dbConnect();
  const user = await User.findById(decoded.userId).lean();
  if (!user) redirect("/login");

  // fetch all cards belonging to this deck
  const allDeckCards = await Card.find({ deckId }).lean();
  const cardIds = allDeckCards.map(c => c._id);

  // fetch current progress for these cards
  const userProgress = await Progress.find({
    userId: user._id,
    cardId: { $in: cardIds },
    deckId: deckId
  }).lean();

  //separate review cards from new cards
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Review Cards: Already started (stepIndex != 0) and Due Date <= now
  const reviewCards = userProgress
    .filter(p => p.stepIndex !== 0 && new Date(p.dueDate) <= now)
    .map(p => {
      const cardData = allDeckCards.find(c => c._id.toString() === p.cardId.toString());
      return { ...cardData, progress: p };
    });

  // new cards: stepIndex is 0 (New) OR no progress record exists yet
  const cardsWithProgressIds = userProgress.map(p => p.cardId.toString());
  const newCardsPotential = allDeckCards.filter(c => 
    !cardsWithProgressIds.includes(c._id.toString()) || 
    userProgress.find(p => p.cardId.toString() === c._id.toString())?.stepIndex === 0
  );

  // Count how many Progress documents were CREATED today (meaning first time studied)
  const newCardsStudiedToday = await Progress.countDocuments({
    userId: user._id,
    deckId: deckId,
    createdAt: { $gte: startOfToday } 
  });

  // Get user limit and calculate the remaining allowance
  const dailyLimit = user.settings?.newCardsPerDay || 20;
  const remainingNewCardsLimit = Math.max(0, dailyLimit - newCardsStudiedToday);

  // Slice the potential array using ONLY the remaining allowance
  const newCards = newCardsPotential
    .slice(0, remainingNewCardsLimit)
    .map(c => {
      const p = userProgress.find(up => up.cardId.toString() === c._id.toString());
      return { ...c, progress: p || null };
    });

  //------------------------
  // Debug: Print out the counts for review and new cards
  console.log(`Review Cards: ${reviewCards.length}, New Cards: ${newCards.length}, Remaining New Card Limit: ${remainingNewCardsLimit}`);
  // Debug: Print new cards faces
  console.log("New Cards for Session:", newCards.map(c => c.face));
  //------------------------

  // Shuffle both arrays to ensure randomness in the session
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const shuffledReviewCards = shuffleArray(reviewCards);
  const shuffledNewCards = shuffleArray(newCards);

  // Debug: Print out the shuffled cards
  console.log("Shuffled Review Cards:", shuffledReviewCards.map(c => c.face));
  console.log("Shuffled New Cards:", shuffledNewCards.map(c => c.face));

  // Combine Queue
  const sessionQueue = [...shuffledReviewCards, ...shuffledNewCards].map(item => ({
    id: item._id.toString(),
    face: item.face,
    content: item.content,
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