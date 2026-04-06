import { connectDB } from "@/database/connect";
import StudentProfile from "@/database/models/student.model";
import TutorProfile from "@/database/models/tutor.model";
import User from "@/database/models/user.model";
import { auth } from "@clerk/nextjs/server";


export async function POST(req) {
  const { userId } = auth();
  const body = await req.json();

  await connectDB();

  const user = await User.create({
    clerkId: userId,
    role: body.role,
  });

  if (body.role === "tutor") {
    await TutorProfile.create({
      user: user._id,
      subjects: [body.data],
    });
  }

  if (body.role === "student") {
    await StudentProfile.create({
      user: user._id,
      goals: body.data,
    });
  }

  return new Response("Success");
}