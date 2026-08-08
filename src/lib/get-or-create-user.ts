import { currentUser } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";

export async function getOrCreateUserRecord(clerkId: string): Promise<{ _id: mongoose.Types.ObjectId }> {
  await connectDB();
  const existing = await User.findOne({ clerkId }, { _id: 1 }).lean();
  if (existing) return { _id: existing._id as mongoose.Types.ObjectId };

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";
  const name =
    `${clerkUser?.firstName ?? ""} ${clerkUser?.lastName ?? ""}`.trim() ||
    (email ? email.split("@")[0] : "User");

  const _id = new mongoose.Types.ObjectId();
  await User.findOneAndUpdate(
    { clerkId },
    {
      _id,
      clerkId,
      name,
      email,
      role: "student",
      profileImage: clerkUser?.imageUrl ?? "",
      isOnboarded: false,
      status: "applied",
      country: "",
      timezone: "",
    },
    { upsert: true, new: true, runValidators: false, setDefaultsOnInsert: true }
  );
  return { _id };
}
