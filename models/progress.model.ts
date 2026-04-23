import mongoose, { Document, Schema } from "mongoose";

export interface IProgress extends Document {
    userId: mongoose.Types.ObjectId;
    cardId: mongoose.Types.ObjectId;
    deckId: mongoose.Types.ObjectId;
    stepIndex: number;
    interval: number;
    repetition: number;
    dueDate: Date;
}

const ProgressSchema = new mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    cardId: { type: Schema.Types.ObjectId, ref: "Card", required: true },
    deckId: { type: Schema.Types.ObjectId, ref: "Deck", required: true },
    stepIndex: { type: Number, default: 0 }, 
    interval: { type: Number, default: 5 }, 
    repetition: { type: Number, default: 0 },
    dueDate: { type: Date, default: Date.now },
}, { timestamps: true });

// Make sure that each user can only have one progress entry per card
ProgressSchema.index({ userId: 1, cardId: 1 }, { unique: true });
ProgressSchema.index({ userId: 1, deckId: 1 });

// In Next.js, we need to check if the model already exists before creating it
// to avoid compilation errors during development
export default mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema);