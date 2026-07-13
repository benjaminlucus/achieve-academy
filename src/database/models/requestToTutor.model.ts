import mongoose, { Schema, models } from "mongoose";
import { ITutorRequest } from "../../../types";

const TutorRequestSchema = new Schema<ITutorRequest>({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  classLevel: {
    type: String,
    required: true,
  },
  budget: {
    type: String,
    required: true,
  },
  preferredLanguage: {
    type: [String],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  preferredSchedule: String,
  preferredGender: String,
  additionalNotes: String,
  status: {
    type: String,
    enum: ["Pending", "Reviewing", "Tutor Found", "Contacted", "Connected", "Closed"],
    default: "Pending",
  },
  assignedTutor: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  internalNotes: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

const TutorRequest = models.TutorRequest || mongoose.model<ITutorRequest>("TutorRequest", TutorRequestSchema);

export default TutorRequest;
