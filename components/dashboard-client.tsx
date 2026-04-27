"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, Clock, Target, Flame } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DashboardProps {
  user: {
    name: string;
    level: number;
    experience: number;
    xpPercentage: number;
    formattedStudyTime: string;
  };
  stats: {
    reviewsToday: number;
    accuracyToday: number;
    dueCardsCount: number;
  };
  chartData: {
    date: string;
    studied: number;
  }[];
}

export default function DashboardClient({ user, stats, chartData }: DashboardProps) {
  return (
    <div className="flex flex-col h-full space-y-6 p-8 overflow-hidden">
      
      {/* 1. Hero / Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">Here is your study progress on NihongoHub.</p>
        </div>
        
        {/* Gamification Badge */}
        <div className="bg-card border rounded-xl p-4 min-w-[250px] shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-sm flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              Level {user.level}
            </span>
            <span className="text-xs text-muted-foreground">{user.experience} XP</span>
          </div>
          <Progress value={user.xpPercentage} className="h-2" />
        </div>
      </div>

      {/* 2. Quick Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Due Cards</CardTitle>
            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.dueCardsCount}</div>
            <p className="text-xs text-muted-foreground">Cards waiting for your review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accuracyToday}%</div>
            <p className="text-xs text-muted-foreground">Based on {stats.reviewsToday} reviews today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.formattedStudyTime}</div>
            <p className="text-xs text-muted-foreground">Time well spent learning Japanese</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Chart Area */}
      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader>
          <CardTitle>Study Activity</CardTitle>
          <CardDescription>Cards reviewed over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="date" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}`} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar 
                dataKey="studied" 
                fill="currentColor" 
                radius={[4, 4, 0, 0]} 
                className="fill-primary"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
    </div>
  );
}



