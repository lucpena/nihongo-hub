import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/database/mongodb';
// import dbConnect from '@/database/mongodb-dry';
import User from '@/models/user.model';

// import { JWT_SECRET } from '@/config/env.js';

export async function POST(request: Request) {
    try {
        // Connect to the database
        await dbConnect();

        // Wait the response and get the result
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Please, fill all fields.' }, { status: 400 });
        }

        // Search user in the data
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'Invalid Credentials.' }, { status: 401 });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid Credentials.' }, { status: 401 });
        }

        // Create the JWT token
        const secret = process.env.JWT_SECRET || 'chave_super_secreta_fallback';
        // const secret = process.env.JWT_SECRET;
        const token = jwt.sign(
            { userId: user._id }, 
            secret, 
            { expiresIn: '7d' } // Token expira em 7 dias
        );

        // Create the response and send the token in a cookie
        const response = NextResponse.json({ message: 'Login success.' }, { status: 200 });
        
        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true, // XSS attack protection
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 dias em segundos
        });

        return response;

    } catch (error) {
        console.error('Erro no login:', error);
        return NextResponse.json({ error: 'Internal Sercer Error.' }, { status: 500 });
    }
}