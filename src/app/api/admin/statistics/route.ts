import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import StudentProfile from "@/database/models/student.model";
import Session from "@/database/models/session.model";
import React from "react";
import TutorProfile from "@/database/models/tutor.model";
import User from "@/database/models/user.model";

export async function GET(req: any) {
    try {
        await connectDB();


        const totalStudents = (await StudentProfile.find({})).length;
        const totalTutors = (await TutorProfile.find({})).length;
        const totalUsers = (await User.find({})).length;
        const sessions = await Session.find({});

        const totalSessions = sessions.filter(s => s.status === "completed").length;
        const totalRevenue = sessions.reduce((total, s: any) => {
            if (s.status === "completed") {
                return total + s.rate;
            }
            return total;
        }, 0)

        const stats = {
            totalStudents,
            totalTutors,
            totalSessions,
            totalRevenue,
            totalUsers
        };


        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching statistics:", error);
        return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
    }
};