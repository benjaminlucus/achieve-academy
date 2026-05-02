import mongoose, { Schema, models } from "mongoose";
import { IStudentProfile } from "../../../types";

const StudentProfileSchema = new Schema<IStudentProfile>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  description: String,
  whichClass: String,

  subjects: [String],
  learningGoals: String,

  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

const StudentProfile = models.StudentProfile || mongoose.model<IStudentProfile>("StudentProfile", StudentProfileSchema);

export default StudentProfile;
