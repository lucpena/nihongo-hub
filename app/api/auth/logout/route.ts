import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ message: "Logout successfully." })

    // sets the token to invalid date 
    response.cookies.set('token', '', {
       httpOnly: true,
       expires: new Date(0),
       path: '/' 
    });

    return response;
}