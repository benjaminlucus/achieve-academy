import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
import { SearchBar } from "@/components/SearchBar";
import Link from "next/link";
import { BookOpen, Clock, DollarSign, Star } from "lucide-react";
import { TutorSearchSection } from "./TutorSearchSection";

export default async function TutorsPage({
  searchParams,
}: {
  searchParams: {q?: string, subject?: string}
}) {
  await connectDB();

  const query = searchParams.q || "";
  const subjectFilter = searchParams.subject || "Subject (All)";

  // Basic fetch - in a real app, we'd add more complex mongo queries
  const tutors = await TutorProfile.find({})
    .populate({
      path: "user",
      model: User,
      select: "_id name email profileImage status",
    })
    .lean();

  // Filter logic
  const filteredTutors = (tutors as any[]).filter((t) => {
    if (!t.user || t.user.status === "blocked") return false;
    
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
