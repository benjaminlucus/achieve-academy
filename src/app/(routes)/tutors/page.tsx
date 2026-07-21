import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
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

  // Fetch ONLY verified, public profile tutors
  const tutors = await TutorProfile.find({})
    .populate({
      path: "user",
      model: User,
      match: { status: "verified", isPublicProfile: { $ne: false } },
      select: "_id name email profileImage status verificationLevel isPublicProfile",
    })
    .select("subjects hourlyRate rating experienceYears teachingLevels experienceLevel description")
    .lean();

  // Filter logic
  const filteredTutors = (tutors as any[]).filter((t) => {
    if (!t.user) return false; // Filter out non-verified or hidden profiles
    
    const matchesQuery = !query || 
      t.user.name.toLowerCase().includes(query.toLowerCase()) ||
      t.subjects.some((s: string) => s.toLowerCase().includes(query.toLowerCase()));
    
    const matchesSubject = subjectFilter === "Subject (All)" || 
      t.subjects.includes(subjectFilter);

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

        {/* We'll need a way to update the URL when searching */}
        {/* For simplicity in this demo, the SearchBar should handle URL updates or we use a Client Component wrapper */}
        <TutorSearchSection initialTutors={JSON.parse(JSON.stringify(filteredTutors))} />
      </div>
    </div>
  );
}
