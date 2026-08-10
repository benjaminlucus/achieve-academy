import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
import Expertise from "@/database/models/expertise.model";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TutorProfileClient } from "./TutorProfileClient";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getTutorData(tutorId: string) {
  await connectDB();

  const tutorProfile = await TutorProfile.findOne({ user: tutorId }).lean();
  if (!tutorProfile) {
    return null;
  }

  const user = await User.findById(tutorId).select("_id name email profileImage status clerkId verificationLevel isPublicProfile").lean();
  if (!user || user.status !== "verified" || user.isPublicProfile === false) {
    return null;
  }

  const expertises = await Expertise.find({
    tutor: tutorId,
    isActive: true,
    visibility: "public",
  })
    .populate("subject", "name")
    .populate("teachingLevels", "name")
    .lean();

  const expertiseDisplay = (expertises as any[]).map((exp: any) => {
    const subjectName =
      exp.subject && typeof exp.subject === "object"
        ? (exp.subject as any).name
        : "";
    const levelNames = (exp.teachingLevels || [])
      .map((l: any) => (l && typeof l === "object" ? l.name : ""))
      .filter(Boolean);
    return { name: subjectName, levels: levelNames };
  }).filter((e: any) => e.name);

  const allSearchableSubjects = Array.from(
    new Set([...(tutorProfile.subjects || []), ...expertiseDisplay.map((e: any) => e.name)])
  );

  const tutorData = {
    _id: tutorProfile._id.toString(),
    userId: tutorId,
    name: user.name,
    profileImage: user.profileImage,
    clerkId: user.clerkId,
    status: user.status,
    isVerified: true,
    verificationLevel: user.verificationLevel,
    subjects: tutorProfile.subjects,
    expertise: expertiseDisplay,
    allSearchableSubjects,
    hourlyRate: tutorProfile.hourlyRate,
    bio: tutorProfile.bio || tutorProfile.description,
    experienceLevel: tutorProfile.experienceLevel,
    teachingLevels: tutorProfile.teachingLevels,
    hasDegree: tutorProfile.hasDegree,
    degreeName: tutorProfile.degreeName,
    universityName: tutorProfile.universityName,
    graduationYear: tutorProfile.graduationYear,
    certifications: tutorProfile.certifications,
    availability: tutorProfile.availability,
    stats: {
      rating: tutorProfile.rating,
      totalStudents: 0,
      completedSessions: 0,
    },
    history: [],
  };

  return tutorData;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const tutorData = await getTutorData(id);
  
  if (!tutorData) {
    return {
      title: "Tutor Not Found",
    };
  }
  
  return {
    title: `${tutorData.name} - Tutor`,
    description: `Expert tutor ${tutorData.name} specializing in ${tutorData.subjects.join(", ")}. Book a session on Ravencrest Academy today!`,
    openGraph: {
      title: `${tutorData.name} - Tutor | Ravencrest Academy`,
      description: `Expert tutor ${tutorData.name} specializing in ${tutorData.subjects.join(", ")}. Book a session on Ravencrest Academy today!`,
      images: tutorData.profileImage ? [tutorData.profileImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${tutorData.name} - Tutor | Ravencrest Academy`,
      description: `Expert tutor ${tutorData.name} specializing in ${tutorData.subjects.join(", ")}. Book a session on Ravencrest Academy today!`,
      images: tutorData.profileImage ? [tutorData.profileImage] : undefined,
    },
  };
}

export default async function TutorProfilePage({ params }: PageProps) {
  const { id } = await params;
  const tutorData = await getTutorData(id);

  if (!tutorData) {
    notFound();
  }

  return <TutorProfileClient tutorData={tutorData} userId={id} />;
}
