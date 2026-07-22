import mongoose, { Schema, models } from "mongoose";
import { IMeetingAttendance } from "../../../types";

const MeetingAttendanceSchema = new Schema<IMeetingAttendance>(
  {
    meeting: {
      type: Schema.Types.ObjectId,
      ref: "ScheduledMeeting",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["tutor", "student"],
      required: true,
    },
    joinedAt: Date,
    leftAt: Date,
    isPresent: {
      type: Boolean,
      default: false,
    },
    attendancePercentage: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

MeetingAttendanceSchema.index({ meeting: 1, user: 1 });
MeetingAttendanceSchema.index({ user: 1 });
MeetingAttendanceSchema.index({ meeting: 1 });

const MeetingAttendance =
  models.MeetingAttendance ||
  mongoose.model<IMeetingAttendance>("MeetingAttendance", MeetingAttendanceSchema);

export default MeetingAttendance;
