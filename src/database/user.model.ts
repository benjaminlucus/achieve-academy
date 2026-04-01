const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["student", "tutor", "admin"],
    required: true
  },

  status: {
    type: String,
    enum: ["active", "blocked"],
    default: "active"
  },

  profileImage: String,
  country: String,
  timezone: String,

  lastLogin: Date,

  createdAt: { type: Date, default: Date.now }
});