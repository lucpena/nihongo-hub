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

  // 2. Fetch User Data
  const user = await User.findById(decoded.userId).lean();
  if (!user) redirect("/login");

  // 3. Time Calculations (Today vs Last 7 Days)
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  // 4. Fetch Due Cards (Cards waiting for review today)
  const dueCardsCount = await Progress.countDocuments({
    userId: user._id,
    dueDate: { $lte: now },
  });

  // 5. Fetch Today's Stats (Accuracy and Total Reviews)
  const todaysLogs = await ReviewLog.find({
    userId: user._id,
    createdAt: { $gte: startOfToday },
  }).lean();

  const reviewsToday = todaysLogs.length;
  const correctReviewsToday = todaysLogs.filter((log) => log.isCorrect).length;
  const accuracyToday = reviewsToday > 0 ? Math.round((correctReviewsToday / reviewsToday) * 100) : 0;

  // 6. Fetch 7-Day Chart Data (Aggregation Pipeline)
  const weeklyDataRaw = await ReviewLog.aggregate([
    {
      $match: {
        userId: user._id,
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalStudied: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill empty days for the chart to look continuous
  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split("T")[0];
    
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
  const xpForNextLevel = ACCOUNT_LEVEL_UP; // Adjust this if your logic in lib/system is different
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