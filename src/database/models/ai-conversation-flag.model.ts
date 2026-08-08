import mongoose, { Schema } from "mongoose";
import type { IAIConversationFlag, AIFlagLevel, AIFlagCategory } from "../../../types";

const CATEGORIES: AIFlagCategory[] = [
  "contact_sharing", "payment_bypass", "profanity", "spam", "toxicity",
  "harassment", "scam", "grooming", "fraud", "suspicious",
  "tutor_extra_fee", "student_abuse", "unknown"
];

const AIConversationFlagSchema = new Schema<IAIConversationFlag>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    messageId: { type: Schema.Types.ObjectId, ref: "Message" },
    flaggedBy: {
      type: String,
      enum: ["rule_engine", "ai_analysis", "user_report", "admin"],
      required: true,
    },
    ruleMatched: { type: String },
    summary: { type: String },
    sentiment: { type: String },
    riskScore: { type: Number, required: true, min: 0, max: 100, index: true },
    confidenceScore: { type: Number, min: 0, max: 100 },
    level: {
      type: String,
      enum: ["low", "medium", "high", "critical"] as AIFlagLevel[],
      required: true,
      index: true,
    },
    category: { type: String, enum: CATEGORIES, required: true },
    categories: [{ type: String, enum: CATEGORIES }],
    recommendedAction: { type: String },
    explanation: { type: String },
    flaggedContent: { type: String },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    handled: { type: Boolean, default: false, index: true },
    handledAt: { type: Date },
    handledBy: { type: Schema.Types.ObjectId, ref: "User" },
    adminNote: { type: String },
  },
  { timestamps: true }
);

AIConversationFlagSchema.index({ createdAt: -1, level: 1, handled: 1 });

export default mongoose.models.AIConversationFlag ||
  mongoose.model<IAIConversationFlag>("AIConversationFlag", AIConversationFlagSchema);
