import mongoose, { Schema, models } from "mongoose";
import { IExpertise } from "../../../types";

const ExpertiseSchema = new Schema<IExpertise>(
  {
    tutor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "ExpertiseCategory",
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "ExpertiseSubject",
      required: true,
    },
    teachingLevels: [
      {
        type: Schema.Types.ObjectId,
        ref: "EducationLevel",
      },
    ],
    teachingLanguages: [String],
    experience: {
      type: Number,
      default: 0,
    },
    hourlyRate: Number,
    certificates: [
      {
        id: String,
        name: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: Date,
        status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
      },
    ],
    specialNotes: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "connections"],
      default: "public",
    },
  },
  { timestamps: true }
);

ExpertiseSchema.index({ tutor: 1, isActive: 1 });
ExpertiseSchema.index({ category: 1, subject: 1, teachingLevels: 1 });
ExpertiseSchema.index({ visibility: 1 });

const Expertise =
  models.Expertise ||
  mongoose.model<IExpertise>("Expertise", ExpertiseSchema);

export default Expertise;
