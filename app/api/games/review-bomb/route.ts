import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/database/mongodb";
import User from "@/models/user.model";
import { XP_VALUES_MINIGAMES, getXpForNextLevel } from "@/lib/system";

export async function POST(request: Request) {
  try {
    // vibe and auth check
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    
    // db connection
    await dbConnect();
    
    // getting data
    const body = await request.json();
    const { isCorrect } = body;

    // user check
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let xpAdded = 0;
    let leveledUp = false;

    // xp for right anwser
    if (isCorrect) {
      xpAdded = XP_VALUES_MINIGAMES?.BOMB_CORRECT_ANSWER || 20;
      user.experience += xpAdded;

      const xpNeeded = getXpForNextLevel(user.level);
      if (user.experience >= xpNeeded) {
        user.level += 1;
        leveledUp = true;
        user.experience = 0;
      }
    }

    await user.save();

    return NextResponse.json({ success: true, xpAdded, leveledUp, newLevel: user.level });

  } catch (error) {
    console.error("Review Bomb API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}