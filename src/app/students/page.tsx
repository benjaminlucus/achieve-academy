import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import StudentProfile from "@/database/models/student.model";
import Link from "next/link";
import { BookOpen, GraduationCap, MapPin } from "lucide-react";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: { q?: string; class?: string };
}) {
  await connectDB();

  const query = searchParams.q || "";
  const classFilter = searchParams.class || "Class (All)";

  // Basic fetch
  const students = await StudentProfile.find({})
    .populate({
      path: "user",
      model: User,
      select: "name email profileImage status country",
    })
    .lean();

  // Filter logic
  const filteredStudents = (students as any[]).filter((s) => {
    if (!s.user || s.user.status === "blocked") return false;
    
    const matchesQuery = !query || 
      s.user.name.toLowerCase().includes(query.toLowerCase()) ||
      s.subjects.some((sub: string) => sub.toLowerCase().includes(query.toLowerCase()));
    
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

// Client component for interactivity
import { StudentSearchSection } from "./StudentSearchSection";
