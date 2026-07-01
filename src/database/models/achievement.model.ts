import mongoose, { Schema, models } from "mongoose";
import { IAchievement } from "../../../types";

const AchievementSchema = new Schema<IAchievement>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["badge", "certificate", "milestone", "achievement"],
      default: "achievement",
      required: true,
    },
    image: String,
    icon: String,
    category: String,
    criteria: [
      {
        type: {
          type: String,
          enum: ["sessions", "hours", "courses", "streak", "custom"],
          required: true,
        },
        value: {
          type: Number,
          required: true,
        },
        config: Schema.Types.Mixed,
      }
    ],
    points: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

AchievementSchema.index({ isActive: 1 });
AchievementSchema.index({ category: 1 });

const Achievement = models.Achievement || mongoose.model<IAchievement>("Achievement", AchievementSchema);

export default Achievement;
