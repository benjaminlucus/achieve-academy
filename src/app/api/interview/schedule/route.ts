import { connectDB } from "@/database/connect";
import interviewModel from "@/database/models/interview.model";
import User from "@/database/models/user.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await connectDB();
    
        const { userId, scheduledAt, zoomLink } = await req.json();
    
        const interview = await interviewModel.create({
            userId,
            scheduledAt,
            zoomLink,
        });
    
        await User.findByIdAndUpdate(userId, {
            status: "interview_scheduled",
        });
    
        return NextResponse.json(interview);
    } catch (error) {
        console.error("Error while schedulling the interview:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 400 });
    }
}