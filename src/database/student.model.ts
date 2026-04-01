const StudentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  gradeLevel: String,
  interests: [String],

  preferredSubjects: [String],

  learningGoals: String,

  createdAt: { type: Date, default: Date.now }
});