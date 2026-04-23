"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Dummy data to test the layout
const studyPerDayData = [
  { date: "Mon", cards: 40 },
  { date: "Tue", cards: 65 },
  { date: "Wed", cards: 35 },
  { date: "Thu", cards: 90 },
  { date: "Fri", cards: 55 },
  { date: "Sat", cards: 20 },
  { date: "Sun", cards: 110 },
];

const studyPerDeckData = [
  { deck: "N4 Vocab", count: 150 },
  { deck: "N4 Grammar", count: 85 },
  { deck: "Kanji 1k", count: 230 },
];

export function OverviewCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-full pb-4">
      
      {/* Total Stats Column */}
      <div className="flex flex-col gap-4 col-span-1 h-full">
        <Card className="flex-1 flex flex-col justify-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cards Studied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">415</div>
            <p className="text-xs text-muted-foreground mt-1">
              +20% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1 flex flex-col justify-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Decks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">
              Keep up the good work!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart: Study per Day */}
      <Card className="col-span-1 md:col-span-9 flex flex-col h-full">
        <CardHeader className="shrink-0">
          <CardTitle>Cards Studied per Day</CardTitle>
          <CardDescription>Your activity over the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 pb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={studyPerDayData}>
              <XAxis 
                dataKey="date" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="cards" 
                stroke="currentColor" 
                strokeWidth={2} 
                className="stroke-primary"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart: Study per Deck */}
      <Card className="col-span-1 md:col-span-10 flex flex-col h-full mt-2">
        <CardHeader className="shrink-0">
          <CardTitle>Distribution by Deck</CardTitle>
          <CardDescription>Which decks you are focusing on.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 pb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={studyPerDeckData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="deck" 
                type="category" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar 
                dataKey="count" 
                fill="currentColor" 
                radius={[0, 4, 4, 0]} 
                className="fill-primary"
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
}