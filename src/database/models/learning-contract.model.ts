import mongoose, { Schema, models } from "mongoose";
import { ILearningContract } from "../../../types";

const LearningContractSchema = new Schema<ILearningContract>(
  {
    tutor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expertise: {
      type: Schema.Types.ObjectId,
      ref: "Expertise",
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "ExpertiseSubject",
    },
    subjectName: String,
    teachingLevel: {
      type: Schema.Types.ObjectId,
      ref: "EducationLevel",
    },
    teachingLevelName: String,
    courseName: String,
    hourlyRate: {
      type: Number,
      required: true,
    },
    monthlyRate: Number,
    billingType: {
      type: String,
      enum: ["hourly", "monthly", "custom_package"],
      required: true,
    },
    weeklySchedule: [
      {
        day: String,
        startTime: String,
        endTime: String,
        active: { type: Boolean, default: true },
        slots: [String],
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    expectedDuration: String,
    sessionsPerWeek: Number,
    estimatedMonthlyHours: Number,
    cancellationPolicy: String,
    status: {
      type: String,
      enum: ["draft", "pending_acceptance", "active", "paused", "completed", "cancelled", "expired"],
      default: "draft",
    },
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    acceptedAt: Date,
    totalHoursPurchased: Number,
    hoursUsed: {
      type: Number,
      default: 0,
    },
    hoursRemaining: {
      type: Number,
      default: 0,
    },
    totalClasses: Number,
    classesCompleted: {
      type: Number,
      default: 0,
    },
    classesMissed: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "unpaid", "overdue"],
      default: "pending",
    },
    nextBillingDate: Date,
    notes: String,
    learningGoal: String,
    timezone: String,
  },
  { timestamps: true }
);

LearningContractSchema.index({ tutor: 1, student: 1 });
LearningContractSchema.index({ status: 1 });
LearningContractSchema.index({ subject: 1, teachingLevel: 1 });
LearningContractSchema.index({ nextBillingDate: 1 });

const LearningContract =
  models.LearningContract ||
  mongoose.model<ILearningContract>("LearningContract", LearningContractSchema);

export default LearningContract;
