import mongoose, { Schema, models } from "mongoose";
import { IUserAchievement } from "../../../types";

const UserAchievementSchema = new Schema<IUserAchievement>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    achievement: {
      type: Schema.Types.ObjectId,
      ref: "Achievement",
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    criteriaMet: Schema.Types.Mixed,
    notes: String,
  },
  { timestamps: true }
);

UserAchievementSchema.index({ user: 1 });
UserAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });
UserAchievementSchema.index({ earnedAt: -1 });

const UserAchievement = models.UserAchievement || mongoose.model<IUserAchievement>("UserAchievement", UserAchievementSchema);

export default UserAchievement;
