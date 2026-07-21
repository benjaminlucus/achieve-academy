import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import StudentProfile from "@/database/models/student.model";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StudentProfileClient } from "./StudentProfileClient";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getStudentData(studentId: string) {
  await connectDB();

  const studentProfile = await StudentProfile.findOne({ user: studentId }).lean();
  if (!studentProfile) {
    return null;
  }

  const user = await User.findById(studentId).select("_id name email profileImage status clerkId verificationLevel isPublicProfile").lean();
  if (!user || user.status !== "verified" || user.isPublicProfile === false) {
    return null;
  }

  const studentData = {
    _id: studentProfile._id.toString(),
    userId: studentId,
    name: user.name,
    profileImage: user.profileImage,
    clerkId: user.clerkId,
    status: user.status,
    verificationLevel: user.verificationLevel,
    subjects: studentProfile.preferredSubjects || studentProfile.subjects,
    whichClass: studentProfile.whichClass,
    learningGoals: studentProfile.learningGoals,
    stats: {
      hoursLearned: 0,
      activeCourses: 0,
      completedSessions: 0,
    },
    history: [],
  };

  return studentData;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const studentData = await getStudentData(id);
  
  if (!studentData) {
    return {
      title: "Student Not Found",
    };
  }
  
  return {
    title: `${studentData.name} - Student`,
    description: `Student ${studentData.name} looking to learn ${studentData.subjects.join(", ")}. Connect on Ravencrest Academy today!`,
    openGraph: {
      title: `${studentData.name} - Student | Ravencrest Academy`,
      description: `Student ${studentData.name} looking to learn ${studentData.subjects.join(", ")}. Connect on Ravencrest Academy today!`,
      images: studentData.profileImage ? [studentData.profileImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${studentData.name} - Student | Ravencrest Academy`,
      description: `Student ${studentData.name} looking to learn ${studentData.subjects.join(", ")}. Connect on Ravencrest Academy today!`,
      images: studentData.profileImage ? [studentData.profileImage] : undefined,
    },
  };
}

export default async function StudentProfilePage({ params }: PageProps) {
  const { id } = await params;
  const studentData = await getStudentData(id);

  if (!studentData) {
    notFound();
  }

  return <StudentProfileClient studentData={studentData} userId={id} />;
}
