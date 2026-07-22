import mongoose, { Schema, models } from "mongoose";
import { IEducationLevel } from "../../../types";

const EducationLevelSchema = new Schema<IEducationLevel>(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

EducationLevelSchema.index({ isActive: 1, sortOrder: 1 });
EducationLevelSchema.index({ name: 1 });

const EducationLevel =
  models.EducationLevel ||
  mongoose.model<IEducationLevel>("EducationLevel", EducationLevelSchema);

export default EducationLevel;
