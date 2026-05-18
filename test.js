import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
console.log("URI:", process.env.MONGODB_URI);

async function connectDB() {
  try {
    console.log("Attempting MongoDB connection...");

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("SUCCESS: MongoDB Connected");
    process.exit(0);
  } catch (error) {
    console.error("FAILED:");
    console.error(error);
    process.exit(1);
  }
}

connectDB();