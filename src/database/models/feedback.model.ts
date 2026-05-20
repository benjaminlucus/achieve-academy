import mongoose, { Schema, models, Document } from "mongoose";

export interface IFeedback extends Document {
  userName: string;
  userRole: string; // e.g., "Student", "Tutor", "Parent"
  rating: number;
  text: string;
  screenshotUrl?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  userName: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  text: {
    type: String,
    required: true,
  },
  screenshotUrl: {
    type: String,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const Feedback = models.Feedback || mongoose.model<IFeedback>("Feedback", FeedbackSchema);

export default Feedback;
