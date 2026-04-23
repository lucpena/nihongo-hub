import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/database/mongodb';
import User from '@/models/user.model';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    // get the session time from request
    const body = await request.json();
    const { sessionSeconds } = body;

    if (!sessionSeconds || sessionSeconds <= 0) {
      return NextResponse.json({ message: "Invalid time" }, { status: 400 });
    }

    // validate the user token
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // find user and increment the study time
    // The $inc operator is highly optimized for adding numbers in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { $inc: { totalStudyTime: sessionSeconds } },
      { new: true }
    );

    return NextResponse.json({ 
      success: true, 
      totalStudyTime: updatedUser.totalStudyTime 
    });

  } catch (error) {
    console.error("Error saving time:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}