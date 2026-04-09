import React from "react";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import StudentProfile from "@/database/models/student.model";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { BookOpen, GraduationCap, Mail, MapPin, Target, History } from "lucide-react";
import { notFound } from "next/navigation";

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  await connectDB();

  // The ID in the URL is the USER ID, let's find the student profile by user ID
  const student = await StudentProfile.findOne({ user: params.id })
    .populate({
      path: "user",
      model: User,
    })
    .lean();

  if (!student) {
    return notFound();
  }

  const studentData = student as any;

  return (
    <div className="bg-off-white min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        
        {/* Profile Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <DashboardCard className="lg:col-span-2">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-24 h-24 bg-coral text-off-white flex items-center justify-center text-3xl font-bold border-2 border-dark-navy shrink-0">
                {studentData.user?.name?.charAt(0) || "S"}
              </div>
              <div className="flex-grow w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-extrabold text-dark-navy tracking-tight uppercase">
                      {studentData.user?.name}
                    </h1>
                    <p className="text-xs font-bold text-steel-blue uppercase tracking-widest mt-1">
                      {studentData.whichClass || "Student"}
                    </p>
                  </div>
                  <StatusBadge status={studentData.user?.status || "active"} />
                </div>
                
                <div className="mt-6 flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-bold text-steel-blue uppercase tracking-widest mb-1">Learning Goals</p>
                    <p className="text-dark-navy font-medium leading-relaxed italic">
                      "{studentData.learningGoals || "No specific goals listed."}"
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-steel-blue uppercase tracking-widest mb-1">Interested Subjects</p>
                    <div className="flex flex-wrap gap-2">
                      {(studentData.subjects || []).map((sub: string) => (
                        <span key={sub} className="px-2 py-1 bg-off-white border-2 border-dark-navy/10 text-[10px] font-bold uppercase text-steel-blue">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Quick Info */}
          <DashboardCard title="Student Info" className="h-fit">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-dark-navy">
                <Mail size={18} className="text-coral" />
                <span className="text-sm font-bold truncate">{studentData.user?.email}</span>
              </div>
              {studentData.user?.country && (
                <div className="flex items-center gap-3 text-dark-navy">
                  <MapPin size={18} className="text-coral" />
                  <span className="text-sm font-bold">{studentData.user.country}</span>
                </div>
              )}
              <div className="mt-4 pt-4 border-t-2 border-dark-navy/10">
                <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-2">Academic Level</p>
                <div className="flex items-center gap-2">
                  <GraduationCap size={20} className="text-coral" />
                  <span className="font-extrabold text-dark-navy">{studentData.whichClass}</span>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Detailed Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DashboardCard title="About Me">
            <p className="text-steel-blue font-medium leading-relaxed">
              {studentData.description || "The student hasn't provided a detailed description yet."}
            </p>
          </DashboardCard>

          <DashboardCard title="Study Interests">
            <div className="flex flex-wrap gap-3">
              {(studentData.subjects || []).length > 0 ? (
                studentData.subjects.map((sub: string) => (
                  <div key={sub} className="flex items-center gap-2 px-4 py-2 bg-off-white border-2 border-dark-navy">
                    <BookOpen size={14} className="text-coral" />
                    <span className="font-bold text-xs uppercase tracking-widest text-dark-navy">{sub}</span>
                  </div>
                ))
              ) : (
                <p className="text-steel-blue italic text-sm">No specific interests listed.</p>
              )}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
