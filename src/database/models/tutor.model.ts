import mongoose, { Schema, models } from "mongoose";
import { ITutorProfile } from "../../../types";
import { time } from "node:console";

const TutorProfileSchema = new Schema<ITutorProfile>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  subjects: [String],
  skills: [String],

  experienceYears: Number,
  education: String,

  hourlyRate: Number,
  monthlyRate: Number,

  description: String,

  languages: [String],

  rating: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },

  availability: [
    {
      day: String,
      time: [String]
    }
  ], // { day: "Monday", time: ["10AM", "2PM"] }

  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

const TutorProfile = models.TutorProfile || mongoose.model<ITutorProfile>("TutorProfile", TutorProfileSchema);

export default TutorProfile;
