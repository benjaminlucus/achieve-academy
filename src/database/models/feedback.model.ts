import mongoose, { Schema, models, Document } from "mongoose";

export interface IFeedback extends Document {
  userId?: mongoose.Types.ObjectId; // Reference to User model
  userName: string;
  userRole: string; // e.g., "Student", "Tutor", "Parent"
  rating: number;
  text: string;
  attachments?: string[]; // Multiple attachments (PDF, images, etc.)
  screenshotUrl?: string; // Legacy support
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
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
  attachments: [{
    type: String,
  }],
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
