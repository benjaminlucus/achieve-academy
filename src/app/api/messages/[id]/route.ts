import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Message from "@/database/models/message.model";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const messages = await Message.find({ conversation: params.id })
      .sort({ createdAt: 1 })
      .limit(50); // Initial load

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Fetch Messages API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
