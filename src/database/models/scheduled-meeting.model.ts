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
  duration: {
    type: Number,
    required: true,
    enum: [20, 30, 40],
  },
  notes: String,
  roomId: String,
  status: {
    type: String,
    enum: ["upcoming", "live", "completed", "expired"],
    default: "upcoming",
  },
  startedAt: Date,
  endedAt: Date,
}, { timestamps: true });

ScheduledMeetingSchema.index({ connection: 1 });
ScheduledMeetingSchema.index({ studentId: 1 });
ScheduledMeetingSchema.index({ tutorId: 1 });
ScheduledMeetingSchema.index({ scheduledStart: 1 });

const ScheduledMeeting = models.ScheduledMeeting || mongoose.model<IScheduledMeeting>("ScheduledMeeting", ScheduledMeetingSchema);

export default ScheduledMeeting;
