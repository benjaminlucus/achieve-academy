import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
import Expertise from "@/database/models/expertise.model";
import ExpertiseSubject from "@/database/models/expertise-subject.model";
import Connection from "@/database/models/connection.model";
import { TutorSearchSection } from "./TutorSearchSection";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find Tutors",
  description: "Browse our directory of verified expert tutors at Ravencrest Academy. Find the perfect mentor for your learning needs.",
  openGraph: {
    title: "Find Tutors | Ravencrest Academy",
    description: "Browse our directory of verified expert tutors at Ravencrest Academy.",
  },
  twitter: {
    title: "Find Tutors | Ravencrest Academy",
    description: "Browse our directory of verified expert tutors at Ravencrest Academy.",
  },
};

export default async function TutorsPage(props: any) {
  await connectDB();
  const searchParams = props.searchParams || {};

  const query = searchParams.q || "";
  const subjectFilter = searchParams.subject || "Subject (All)";

  const tutors = await TutorProfile.find({})
    .populate({
      path: "user",
      model: User,
      match: { status: "verified", isPublicProfile: { $ne: false } },
      select: "_id name email profileImage status verificationLevel isPublicProfile",
    })
    .select("subjects hourlyRate rating experienceYears teachingLevels experienceLevel description bio skills languages")
    .lean();

  const validTutors = (tutors as any[]).filter((t) => !!t.user);
  const tutorUserIds = validTutors.map((t) => t.user._id);

  const expertises = await Expertise.find({
    tutor: { $in: tutorUserIds },
    isActive: true,
    visibility: "public",
  })
    .populate("subject", "name")
    .populate("teachingLevels", "name")
    .lean();

  const expertiseByTutor: Record<string, any[]> = {};
  for (const exp of expertises as any[]) {
    const tid = String(exp.tutor);
    if (!expertiseByTutor[tid]) expertiseByTutor[tid] = [];
    expertiseByTutor[tid].push(exp);
  }

  const tutorsWithExpertise = validTutors.map((t) => {
    const uid = String(t.user._id);
    const tutorExpertises = expertiseByTutor[uid] || [];

    const expertiseDisplay = tutorExpertises.map((exp: any) => {
      const subjectName: string =
        exp.subject && typeof exp.subject === "object"
          ? (exp.subject as any).name
          : "";
      const levelNames: string[] = (exp.teachingLevels || [])
        .map((l: any) => (l && typeof l === "object" ? l.name : ""))
        .filter(Boolean);
      return {
        name: subjectName,
        levels: levelNames,
      };
    }).filter((e: any) => e.name);

    const expertiseSubjectNames = expertiseDisplay.map((e: any) => e.name);
    const allSearchableSubjects = Array.from(
      new Set([...(t.subjects || []), ...expertiseSubjectNames])
    );

    return {
      ...t,
      expertise: expertiseDisplay,
      allSearchableSubjects,
    };
  });

  const filteredTutors = tutorsWithExpertise.filter((t) => {
    const qLower = String(query).toLowerCase();
    const matchesQuery =
      !qLower ||
      t.user.name.toLowerCase().includes(qLower) ||
      t.allSearchableSubjects.some((s: string) =>
        s.toLowerCase().includes(qLower)
      );

    const matchesSubject =
      subjectFilter === "Subject (All)" ||
      t.allSearchableSubjects.includes(subjectFilter);

    return matchesQuery && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-off-white pt-24 pb-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-dark-navy mb-2 tracking-tight">
            Find Your <span className="text-coral">Expert Tutor</span>
          </h1>
          <p className="text-steel-blue font-medium">Browse verified educators ready to help you achieve your goals.</p>
        </header>

        <TutorSearchSection initialTutors={JSON.parse(JSON.stringify(filteredTutors))} />
      </div>
    </div>
  );
}
