import mongoose, { Schema, models } from "mongoose";
import { IExpertiseSubject } from "../../../types";

const ExpertiseSubjectSchema = new Schema<IExpertiseSubject>(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: "ExpertiseCategory",
      required: true,
    },
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

ExpertiseSubjectSchema.index({ category: 1, isActive: 1, sortOrder: 1 });
ExpertiseSubjectSchema.index({ name: 1 });

const ExpertiseSubject =
  models.ExpertiseSubject ||
  mongoose.model<IExpertiseSubject>("ExpertiseSubject", ExpertiseSubjectSchema);

export default ExpertiseSubject;
