import mongoose, { Schema, models } from "mongoose";
import { ICourseEnrollment } from "../../../types";

const CourseEnrollmentSchema = new Schema<ICourseEnrollment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tutor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    learningContract: {
      type: Schema.Types.ObjectId,
      ref: "LearningContract",
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "ExpertiseSubject",
      required: true,
    },
    teachingLevel: {
      type: Schema.Types.ObjectId,
      ref: "EducationLevel",
      required: true,
    },
    currentProgress: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    estimatedCompletionDate: Date,
    completedLessons: {
      type: Number,
      default: 0,
    },
    remainingLessons: {
      type: Number,
      default: 0,
    },
    attendance: {
      type: Number,
      default: 0,
    },
    completionPercentage: {
      type: Number,
      default: 0,
    },
    averageSessionDuration: {
      type: Number,
      default: 0,
    },
    homeworkCompleted: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["enrolled", "active", "paused", "completed", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

CourseEnrollmentSchema.index({ student: 1, tutor: 1 });
CourseEnrollmentSchema.index({ learningContract: 1 });
CourseEnrollmentSchema.index({ status: 1 });

const CourseEnrollment =
  models.CourseEnrollment ||
  mongoose.model<ICourseEnrollment>("CourseEnrollment", CourseEnrollmentSchema);

export default CourseEnrollment;
