import connectToDatabase from "@/database/mongodb";
import User from "@/models/user.model";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { OverviewCharts } from "@/components/overview-charts";

export default async function DashboardPage() {
  // 1. Get the user from the token to display "Welcome, {user}"
  await connectToDatabase();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  let userName = "Student";

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await User.findById(decoded.userId).select("name");
      if (user) userName = user.name;
    } catch (error) {
      console.error("Error decoding token for dashboard:", error);
    }
  }

  // NOTE: Here you will eventually fetch the real aggregated data from the Progress model.
  // For now, we pass placeholder data to build the strict layout.

  return (
    <main className="flex flex-col h-screen max-h-screen overflow-hidden p-6 bg-background">
      {/* Header Section */}
      <header className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {userName}!
        </h1>
        <p className="text-muted-foreground">
          Here is your study progress at a glance.
        </p>
      </header>

      {/* Charts and Stats Section - Takes up the remaining height */}
      <section className="flex-1 overflow-hidden">
        <OverviewCharts />
      </section>
    </main>
  );
}