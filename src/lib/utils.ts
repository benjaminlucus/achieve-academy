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

    return JSON.parse(JSON.stringify(databaseUser))
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

export async function getTotalUserCount() {
  try {
    await connectDB();
    const count = await User.countDocuments();
    return count;
  } catch (error) {
    console.error("Error fetching total user count:", error);
    return 0;
  }

}

export async function getTotalUsers() {
  try {

    const data = await fetch(`${process.env.NEXT_URL}/api/admin/users`, {
      cache: "no-store"
    }).then(res => res.json());

    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export async function getAllTutors() {
  try {

    const data = await fetch(`${process.env.NEXT_URL}/api/admin/tutors`, {
      cache: "no-store"
    }).then(res => res.json());

    return data;
  } catch (error) {
    console.error("Error fetching tutor data:", error);
    return null;
  }
}

export async function getTotalPayments() {
  try {

    const data = await fetch(`${process.env.NEXT_URL}/api/admin/payments`, {
      cache: "no-store"
    }).then(res => res.json());

    return data;
  } catch (error) {
    console.error("Error fetching payments data:", error);
    return null;
  }
}

