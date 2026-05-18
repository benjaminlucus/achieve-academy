import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import StudentProfile from "@/database/models/student.model";
import Link from "next/link";
import { BookOpen, GraduationCap, MapPin } from "lucide-react";
import { StudentSearchSection } from "./StudentSearchSection";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: { q?: string; class?: string };
}) {
  await connectDB();

  const query = searchParams.q || "";
  const classFilter = searchParams.class || "Class (All)";

  // Basic fetch - ONLY show APPROVED (verified) users publicly
  const students = await StudentProfile.find({})
    .populate({
      path: "user",
      model: User,
      match: { status: "approved" },
      select: "_id name email profileImage status country verificationLevel",
    })
    .lean();

  // Filter logic
  const filteredStudents = (students || []).filter((s: any) => {
    if (!s.user) return false; // This filters out users whose status is not 'approved' due to the match in populate
    
    const subjects = s.preferredSubjects || s.subjects || [];
    const name = s.user.name || "";
    
    const matchesQuery = !query || 
      name.toLowerCase().includes(query.toLowerCase()) ||
      subjects.some((sub: string) => sub.toLowerCase().includes(query.toLowerCase()));
    
    const matchesClass = classFilter === "Class (All)" || 
      s.whichClass === classFilter || s.whichClass === classFilter;

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
