import mongoose, { Schema, models } from "mongoose";
import { IScheduledMeeting } from "../../../types";

const ScheduledMeetingSchema = new Schema<IScheduledMeeting>({
  connection: {
    type: Schema.Types.ObjectId,
    ref: "Connection",
    required: true
  },
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
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 60
  },
  notes: String,
  meetingId: {
    type: String,
    required: true
  },
  joinUrl: {
    type: String,
    required: true
  },
  hostUrl: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    enum: ["zoom"],
    default: "zoom"
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled"
  }
}, { timestamps: true });

ScheduledMeetingSchema.index({ connection: 1 });
ScheduledMeetingSchema.index({ student: 1 });
ScheduledMeetingSchema.index({ tutor: 1 });
ScheduledMeetingSchema.index({ date: 1 });

const ScheduledMeeting = models.ScheduledMeeting || mongoose.model<IScheduledMeeting>("ScheduledMeeting", ScheduledMeetingSchema);

export default ScheduledMeeting;
