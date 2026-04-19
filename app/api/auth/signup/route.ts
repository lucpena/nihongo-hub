import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/database/mongodb';
// import dbConnect from '@/database/mongodb-dry';
import User from '@/models/user.model';

export async function POST(request: Request) {
    try {
        // Connect to database
        await dbConnect();

        // Extract data from the request
        const body = await request.json();
        const { name, email, password } = body;

        // Basic validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Fill all fields.' },
                { status: 400 }
            );
        }

        // Verify email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already in use.' },
                { status: 400 }
            );
        }

        // Hashing the password. 10 is a good number for salt. Goog performance and safety
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user on MongoDB
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
           // user profile image goes here
        });

        // Success
        return NextResponse.json(
            { message: 'User created.', userId: newUser._id },
            { status: 201 }
        );

    } catch (error) {
        console.error('⛔ Sign up error:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor.' },
            { status: 500 }
        );
    }
}