import User from "@/database/models/user.model";

export async function POST(req: Request) {
  const { userId, interviewLink, interviewDate } = await req.json();

  await User.findByIdAndUpdate(userId, {
    interviewLink,
    interviewDate,
    status: "interview_scheduled",
  });

  return Response.json({ success: true });
}