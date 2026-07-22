import mongoose, { Schema, models } from "mongoose";
import { IExpertiseCategory } from "../../../types";

const ExpertiseCategorySchema = new Schema<IExpertiseCategory>(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    icon: String,
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

ExpertiseCategorySchema.index({ isActive: 1, sortOrder: 1 });
ExpertiseCategorySchema.index({ name: 1 });

const ExpertiseCategory =
  models.ExpertiseCategory ||
  mongoose.model<IExpertiseCategory>("ExpertiseCategory", ExpertiseCategorySchema);

export default ExpertiseCategory;
