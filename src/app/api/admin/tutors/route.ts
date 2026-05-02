import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import TutorProfile from "@/database/models/tutor.model";

export async function GET() {
    try {
        await connectDB();

        const tutors = await TutorProfile.find({})
            .populate("user", "name email status profileImage")
            .sort({ createdAt: -1 });

        const formattedTutors = tutors.map(t => ({
            id: t._id,
            userId: t.user?._id,
            name: t.user?.name,
            email: t.user?.email,
            status: t.user?.status,
            profileImage: t.user?.profileImage,
            subjects: t.subjects,
            experience: t.experienceYears,
            education: t.education,
            isVerified: t.isVerified,
            createdAt: t.createdAt
        }));

        return NextResponse.json(formattedTutors);

    } catch (error) {
        console.error("Admin Fetch Tutors Error:", error);
        return NextResponse.json({ error: "Failed to fetch tutors" }, { status: 500 });
    }
}
