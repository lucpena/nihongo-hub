import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import dbConnect from "@/database/mongodb";
import User from "@/models/user.model";
import ReviewLog from "@/models/review-log.model";
import Progress from "@/models/progress.model";
import DashboardClient from "@/components/dashboard-client";
import { ACCOUNT_LEVEL_UP } from "@/lib/system";

export default async function DashboardPage() {
  // 1. Authenticate User
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

  // fetch User Data
  const user = await User.findById(decoded.userId).lean();
  if (!user) redirect("/login");

  // time Calculations (Today vs Last 7 Days)
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 14);

  // fetch Due Cards (Cards waiting for review today)
  const dueCardsCount = await Progress.countDocuments({
    userId: user._id,
    dueDate: { $lte: now },
  });

  // fetch today's stats (Accuracy and Total Reviews)
  const todaysLogs = await ReviewLog.find({
    userId: user._id,
    createdAt: { $gte: startOfToday },
  }).lean();

  const reviewsToday = todaysLogs.length;
  const correctReviewsToday = todaysLogs.filter((log) => log.isCorrect).length;
  const accuracyToday = reviewsToday > 0 ? Math.round((correctReviewsToday / reviewsToday) * 100) : 0;

  // fetch 7-Day Chart Data (Aggregation Pipeline)
  const weeklyDataRaw = await ReviewLog.aggregate([
    {
      $match: {
        userId: user._id,
        reviewedAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: { 
          $dateToString: { 
            format: "%Y-%m-%d", 
            date: "$reviewedAt",
            // Força o MongoDB a agrupar usando o seu fuso horário (ajuste se necessário)
            timezone: "America/Sao_Paulo" 
          } 
        },
        totalStudied: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill empty days for the chart to look continuous
  const weeklyData = [];
  for (let i = 14; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    
    // Constrói a string YYYY-MM-DD usando a data LOCAL, evitando o timezone shift do toISOString()
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;
    
    const found = weeklyDataRaw.find((item) => item._id === dateString);
    weeklyData.push({
      date: dateString,
      studied: found ? found.totalStudied : 0,
    });
  }

  // Format Total Study Time (Seconds to HH:MM)
  const totalSeconds = user.totalStudyTime || 0;
  const studyHours = Math.floor(totalSeconds / 3600);
  const studyMinutes = Math.floor((totalSeconds % 3600) / 60);
  const formattedStudyTime = `${studyHours}h ${studyMinutes}m`;

  // Calculate XP percentage for the progress bar
  const xpForNextLevel = ACCOUNT_LEVEL_UP;
  const xpPercentage = Math.min(100, Math.round((user.experience / xpForNextLevel) * 100));

  return (
    <DashboardClient 
      user={{
        name: user.name,
        level: user.level,
        experience: user.experience,
        xpPercentage,
        formattedStudyTime
      }}
      stats={{
        reviewsToday,
        accuracyToday,
        dueCardsCount
      }}
      chartData={weeklyData}
    />
  );
}