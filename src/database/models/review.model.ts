import mongoose, { Schema, models, Document } from "mongoose";

export interface IReview extends Document {
  student: mongoose.Types.ObjectId;
  tutor: mongoose.Types.ObjectId;
  session: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  student: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  tutor: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  session: {
    type: Schema.Types.ObjectId,
    ref: "Session",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Review = models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
