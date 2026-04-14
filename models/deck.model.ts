import mongoose, { Document, Schema } from "mongoose";

export interface IDeck extends Document {
    deck_name: string;
    userId: mongoose.Types.ObjectId; // User reference
    description: string;
    isPublic: boolean; // Indicates if the deck is public or private
}

const DeckSchema = new mongoose.Schema({
    deck_name: { type: String, required: true },
    description: { type: String, default: "" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isPublic: { type: Boolean, default: false },
}, {
    timestamps: true,
});

// In Next.js, we need to check if the model already exists before creating it
// to avoid compilation errors during development
export default mongoose.models.Deck || mongoose.model<IDeck>('Deck', DeckSchema);