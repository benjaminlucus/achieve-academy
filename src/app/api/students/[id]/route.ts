import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import StudentProfile from "@/database/models/student.model";
import Session from "@/database/models/session.model";
import React from "react";

export async function GET(req: any, { params }: any) {
  try {
    await connectDB();

    const studentId = React.use(params.id); // Extract student ID from URL parameters

    const student = await StudentProfile.findOne({ user: studentId })
      .populate("user");
    const sessions = await Session.find({ student: studentId })
      .populate("tutor", "name")
      .sort({ createdAt: -1 }); // // Find al students from database with matching id. It replaces the tutor ID with actual tutor data (only name here). Latest sessions come first


    const completedSessions = sessions.filter(s => s.status === "completed"); // Keep only sessions where status = "completed"

    // Reduces through each value in the array of completed sessions and sums up the hours learned. It calculates hours by taking the difference between endDate and startDate, converting from milliseconds to hours, and adding it to the total (Time taken for previous sessions). The final result is the total hours learned across all completed sessions.
    const hoursLearned = completedSessions.reduce((total, s: any) => {
      // (endDate - startDate) / 3600000
      const hours = (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) / 3600000; // miliseconds to hours
      return total + hours;
    }, 0);

    const activeCourses = [...new Set(sessions.map(s => s.subject))].length; // Creates a new Set (which only keeps unique values) from the array of subjects extracted from all sessions. Then it converts that Set back to an array and gets its length, which represents the number of unique subjects (active courses) the student has had sessions in.

    // 4. Format history
    const history = sessions.map(s => ({
      id: s._id,
      tutor: s.tutor?.name,
      subject: s.subject,
      date: s.startDate,
      status: s.status
    }));

    const studentData = {
      name: student.user.name,
      email: student.user.email,
      status: student.user.status,
      whichClass: student.whichClass,
      learningGoals: student.learningGoals,
      subjects: student.subjects,
      location: `${student.user.country}`,

      stats: {
        hoursLearned: Math.round(hoursLearned),
        activeCourses,
        completedSessions: completedSessions.length
      },

      history
    };

    return NextResponse.json(studentData);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
};