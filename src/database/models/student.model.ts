import mongoose, { Schema, models } from "mongoose";
import { IStudentProfile } from "../../../types";

const StudentProfileSchema = new Schema<IStudentProfile>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  gradeLevel: String,
  interests: [String],

  preferredSubjects: [String],

  learningGoals: String,

  createdAt: { type: Date, default: Date.now }
});

const StudentProfile = models.StudentProfile || mongoose.model<IStudentProfile>("StudentProfile", StudentProfileSchema);

export default StudentProfile;
