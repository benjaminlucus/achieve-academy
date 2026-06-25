import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn("MONGODB_URI is not defined in environment variables");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend global type
declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env");
  }

  // If we already have a connection, return it
  if (cached.conn) {
    console.log("[MongoDB] Reusing existing connection");
    return cached.conn;
  }

  // If we don't have a promise yet, create a new one
  if (!cached.promise) {
    console.log("[MongoDB] Creating new connection");
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      .then((m) => {
        console.log("[MongoDB] Successfully connected");
        return m;
      })
      .catch((err) => {
        console.error("[MongoDB] Connection failed:", err);
        // Reset the promise so that next attempt can try again (prevents getting stuck in failed state)
        cached.promise = null;
        if (
          err.message.includes("ETIMEOUT") ||
          err.message.includes("ServerSelectionError")
        ) {
          console.error(
            "[MongoDB] This is likely an IP whitelisting issue! Please go to MongoDB Atlas > Network Access and add your current IP address."
          );
        }
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset promise on failure
    throw error;
  }
}
