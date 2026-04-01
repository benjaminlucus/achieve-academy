const TutorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  subjects: [String],
  skills: [String],

  experienceYears: Number,
  education: String,

  hourlyRate: Number,
  monthlyRate: Number,

  bio: String,

  languages: [String],

  rating: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },

  availability: [
    {
      day: String,
      slots: [String]
    }
  ],

  isVerified: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});