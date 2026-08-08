import mongoose, { Schema } from "mongoose";
import type { IAIRiskProfile, AIFlagLevel, AIFlagCategory } from "../../../types";

const CATEGORIES: AIFlagCategory[] = [
  "contact_sharing", "payment_bypass", "profanity", "spam", "toxicity",
  "harassment", "scam", "grooming", "fraud", "suspicious",
  "tutor_extra_fee", "student_abuse", "unknown"
];

const AIRiskProfileSchema = new Schema<IAIRiskProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    overallRiskScore: { type: Number, required: true, default: 0, min: 0, max: 100 },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"] as AIFlagLevel[],
      required: true,
      default: "low",
    },
    flagsCount: { type: Number, default: 0 },
    criticalFlagsCount: { type: Number, default: 0 },
    recentCategories: [{ type: String, enum: CATEGORIES }],
    lastAnalyzedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.AIRiskProfile ||
  mongoose.model<IAIRiskProfile>("AIRiskProfile", AIRiskProfileSchema);
