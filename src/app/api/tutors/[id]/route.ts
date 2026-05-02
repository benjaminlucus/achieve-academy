import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import TutorProfile from "@/database/models/tutor.model";
import Session from "@/database/models/session.model";
import React from "react";

export async function GET(req: any, { params }: any) {
    try {
        await connectDB();

        const { id: tutorId } = await params;

        const tutor = await TutorProfile.findOne({ user: tutorId })
            .populate("user");

        if (!tutor) {
            return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
        }

        const sessions = await Session.find({ tutor: tutorId })
            .populate("student", "name")
            .sort({ createdAt: -1 });

        const completedSessions = sessions.filter(s => s.status === "completed");

        const hoursTaught = completedSessions.reduce((total, s: any) => {
            const hours = (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) / 3600000;
            return total + hours;
        }, 0);

        const activeStudents = [...new Set(sessions.map(s => s.student?._id.toString()))].length;

        const history = sessions.map(s => ({
            id: s._id,
            student: s.student?.name,
            subject: s.subject,
            date: s.startDate,
            status: s.status
        }));

        const tutorData = {
            clerkId: tutor.user.clerkId,
            name: tutor.user.name,
            email: tutor.user.email,
            status: tutor.user.status,
            subjects: tutor.subjects,
            experienceYears: tutor.experienceYears,
            education: tutor.education,
            hourlyRate: tutor.hourlyRate,
            bio: tutor.bio,
            isVerified: tutor.isVerified,
            location: tutor.user.country || "Not specified",
            profileImage: tutor.user.profileImage,

            stats: {
                hoursTaught: Math.round(hoursTaught),
                totalStudents: activeStudents,
                rating: tutor.rating || 0
            },

            availability: tutor.availability || [],
            history
        };

        return NextResponse.json(tutorData);
    } catch (error) {
        console.error("Error fetching tutor:", error);
        return NextResponse.json({ error: "Failed to fetch tutor" }, { status: 500 });
    }
};
