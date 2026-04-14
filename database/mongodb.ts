import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if( !MONGO_URI ) {
    throw new Error("Database URI is not defined in environment variables.");
}

// Global cached connection to prevent multiple connections in development
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

let cached = (global as { mongoose?: MongooseCache }).mongoose;
if (!cached) {
    (global as { mongoose?: MongooseCache }).mongoose = { conn: null, promise: null };
    cached = (global as { mongoose?: MongooseCache }).mongoose;
}

// Ready to connect to MongoDB
const connectToDatabase = async () => {
    // If there's a cached connection, use it
    if (cached?.conn) {
        console.log('✅ Using cached MongoDB connection.');
        return cached.conn;
    }

    //
    if (!cached?.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached!.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
            console.log('✅ Connected to MongoDB successfully.');
            return mongoose;
        });
    }

    // Await the connection promise and cache the connection
    try {
        cached!.conn = await cached!.promise;
    } catch (error) {
        cached!.promise = null; // Reset the promise on failure
        console.error("⛔ Error connecting to MongoDB:", error);
    }

    return cached?.conn;
}

export default connectToDatabase;