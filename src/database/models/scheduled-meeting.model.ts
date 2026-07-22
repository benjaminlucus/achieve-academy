import mongoose, { Schema, models } from "mongoose";
import { IScheduledMeeting } from "../../../types";

const ScheduledMeetingSchema = new Schema<IScheduledMeeting>({
  connection: {
    type: Schema.Types.ObjectId,
    ref: "Connection",
    required: true,
  },
  hostId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tutorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  learningContract: {
    type: Schema.Types.ObjectId,
    ref: "LearningContract",
  },
  courseEnrollment: {
    type: Schema.Types.ObjectId,
    ref: "CourseEnrollment",
  },
  title: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  scheduledStart: {
    type: Date,
    required: true,
  },
  expectedDuration: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    enum: [20, 30, 40],
  },
  notes: String,
  roomId: String,
  status: {
    type: String,
    enum: ["draft", "scheduled", "starting", "in_progress", "completed", "cancelled", "expired", "no_show"],
    default: "scheduled",
  },
  startedAt: Date,
  endedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  actualDuration: Number,
  groupId: String,
  partNumber: Number,
  totalParts: Number,
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "unpaid"],
    default: "pending",
  },
  cancellationReason: String,
  noShowReason: String,
  attendance: [
    {
      meeting: { type: Schema.Types.ObjectId, ref: "ScheduledMeeting" },
      user: { type: Schema.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["tutor", "student"] },
      joinedAt: Date,
      leftAt: Date,
      isPresent: { type: Boolean, default: false },
      attendancePercentage: { type: Number, default: 0 },
    },
  ],
}, { timestamps: true });

ScheduledMeetingSchema.index({ connection: 1 });
ScheduledMeetingSchema.index({ studentId: 1 });
ScheduledMeetingSchema.index({ tutorId: 1 });
ScheduledMeetingSchema.index({ scheduledStart: 1 });
ScheduledMeetingSchema.index({ groupId: 1 });
ScheduledMeetingSchema.index({ status: 1 });
ScheduledMeetingSchema.index({ learningContract: 1 });

const ScheduledMeeting = models.ScheduledMeeting || mongoose.model<IScheduledMeeting>("ScheduledMeeting", ScheduledMeetingSchema);

export default ScheduledMeeting;
