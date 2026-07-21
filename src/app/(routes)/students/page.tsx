import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import StudentProfile from "@/database/models/student.model";
import Connection from "@/database/models/connection.model";
import { StudentSearchSection } from "./StudentSearchSection";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find Students",
  description: "Browse our directory of students seeking tutoring help on Ravencrest Academy. Find students who match your expertise.",
  openGraph: {
    title: "Find Students | Ravencrest Academy",
    description: "Browse our directory of students seeking tutoring help on Ravencrest Academy.",
  },
  twitter: {
    title: "Find Students | Ravencrest Academy",
    description: "Browse our directory of students seeking tutoring help on Ravencrest Academy.",
  },
};

interface PageProps {
  searchParams: Promise<{ q?: string; class?: string }>;
}

export default async function StudentsPage({ searchParams }: PageProps) {
  await connectDB();

  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const classFilter = resolvedParams.class || "Class (All)";

  // Fetch ONLY verified, public profile students
  const students = await StudentProfile.find({})
    .populate({
      path: "user",
      model: User,
      match: { status: "verified", isPublicProfile: { $ne: false } },
      select: "_id name email profileImage status country verificationLevel isPublicProfile",
    })
    .lean();

  // Filter logic
  const filteredStudents = (students || []).filter((s: any) => {
    if (!s.user) return false; // Filter out non-verified or hidden profiles
    
    const subjects = s.preferredSubjects || s.subjects || [];
    const name = s.user.name || "";
    
    const matchesQuery = !query || 
      name.toLowerCase().includes(query.toLowerCase()) ||
      subjects.some((sub: string) => sub.toLowerCase().includes(query.toLowerCase()));
    
    const matchesClass = classFilter === "Class (All)" || 
      s.whichClass === classFilter;

    return matchesQuery && matchesClass;
  });

  return (
    <div className="min-h-screen bg-off-white pt-24 pb-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-dark-navy mb-2 tracking-tight">
            Students Seeking <span className="text-coral">Help</span>
          </h1>
          <p className="text-steel-blue font-medium">Connect with students looking for expertise in your field.</p>
        </header>

        <StudentSearchSection initialStudents={JSON.parse(JSON.stringify(filteredStudents))} />
      </div>
    </div>
  );
}
