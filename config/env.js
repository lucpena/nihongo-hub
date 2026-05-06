import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const {
    PORT, SERVER_URL,
    MONGO_URI,
    JWT_SECRET, JWT_EXPIRES_IN,
    OLLAMA_API_URL, OLLAMA_API_URL_LOCAL, GEMINI_API_KEY
} = process.env;