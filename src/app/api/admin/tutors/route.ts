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

        const users = await TutorProfile.find({})
            .select("name email status subjects timezone country experience education createdAt")
            .sort({ createdAt: -1 });

        const formattedUsers = users.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            subjects: u.subjects,
            country: u.country,
            timezone: u.timezone,
            experience: u.experience,
            education: u.education,
            status: u.status
        }));

        return NextResponse.json(formattedUsers);

    } catch (error) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}