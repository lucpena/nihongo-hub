import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;
const NODE_ENV = process.env.NODE_ENV || "development";

if( !MONGO_URI ) {
    throw new Error("Database URI is not defined in environment variables.");
}

// Ready to connect to MongoDB
const connectToDatabase = async () => {
    try {

        await mongoose.connect(MONGO_URI);
        console.log(`✅ Connected to MongoDB successfully in ${NODE_ENV} environment.`);

    } catch (error) {
        console.error("⛔ Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process with failure
    }
}

export default connectToDatabase;