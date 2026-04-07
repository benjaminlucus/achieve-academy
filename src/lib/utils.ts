import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import { currentUser } from "@clerk/nextjs/server";


export async function getCurrentUser() {
  try {
    await connectDB();

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return null;
    }

    const databaseUser = await User.findOne({
      clerkId: clerkUser.id
    }).lean();

    if (!databaseUser) {
      return null;
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(databaseUser)),
      status: 200
    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return {
      success: false,
      status: 500
    };
  }
}