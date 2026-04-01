import mongoose, { Schema, models } from "mongoose";
import { ITutorRequest } from "../../../types";

const TutorRequestSchema = new Schema<ITutorRequest>({
  student: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  subject: String,
  budget: Number,

  assignedTutor: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  status: {
    type: String,
    enum: ["pending", "assigned", "rejected"],
    default: "pending"
  },

  createdAt: { type: Date, default: Date.now }
});

const TutorRequest = models.TutorRequest || mongoose.model<ITutorRequest>("TutorRequest", TutorRequestSchema);

export default TutorRequest;
