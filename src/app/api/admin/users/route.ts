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

    const users = await User.find({})
      .select("name email role status createdAt")
      .sort({ createdAt: -1 });

    const formattedUsers = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      joined: u.createdAt
    }));

    return NextResponse.json(formattedUsers);

  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}