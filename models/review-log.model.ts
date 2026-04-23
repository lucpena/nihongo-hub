import mongoose, { Document, Schema } from "mongoose";

export interface IReviewLog extends Document {
  userId: mongoose.Types.ObjectId;
  cardId: mongoose.Types.ObjectId;
  deckId: mongoose.Types.ObjectId; // Saving deckId here makes dashboard queries much faster!
  isCorrect: boolean;
  reviewedAt: Date;
}

const ReviewLogSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    cardId: { type: Schema.Types.ObjectId, ref: "Card", required: true },
    deckId: { type: Schema.Types.ObjectId, ref: "Deck", required: true },
    isCorrect: { type: Boolean, required: true },
    reviewedAt: { type: Date, default: Date.now },
  },
  { 
    // We don't necessarily need 'createdAt' and 'updatedAt' here since it's a log,
    // but timestamps: true is fine. Using a specific 'reviewedAt' makes the intent clearer.
    timestamps: false, 
  }
);

// Indexing for faster dashboard queries
ReviewLogSchema.index({ userId: 1, reviewedAt: -1 });
ReviewLogSchema.index({ userId: 1, deckId: 1 });

export default mongoose.models.ReviewLog ||
  mongoose.model<IReviewLog>("ReviewLog", ReviewLogSchema);