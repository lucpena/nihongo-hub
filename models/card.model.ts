import mongoose, { Document, Schema } from "mongoose";

export interface ICard extends Document {
    deckId: mongoose.Types.ObjectId;                 // Deck reference
    userId: mongoose.Types.ObjectId;                 // User reference
    type: 'grammar' | 'vocabulary' | 'kanji';   // Type of card (grammar or vocabulary)
    content: Record<string, any>;                    //Flexible object to hold ANY structure
    face: string;                                    // Face fields
}

const CardSchema = new mongoose.Schema({
    deckId: { type: Schema.Types.ObjectId, ref: "Deck", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ['grammar', 'vocabulary', 'kanji'], required: true },
    content: { type: Schema.Types.Mixed, required: true },
    face: { type: String, required: true },
}, {
    timestamps: true,
});


// In Next.js, we need to check if the model already exists before creating it
// to avoid compilation errors during development
export default mongoose.models.Card || mongoose.model<ICard>('Card', CardSchema);