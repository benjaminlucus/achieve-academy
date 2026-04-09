import React from "react";
import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { BookOpen, GraduationCap, DollarSign, Clock, Users, Calendar, Mail, MapPin } from "lucide-react";
import { notFound } from "next/navigation";

export default async function TutorProfilePage({ params }: { params: { id: string } }) {
  await connectDB();

  // The ID in the URL is the USER ID, let's find the tutor profile by user ID
  const tutor = await TutorProfile.findOne({ user: params.id })
    .populate({
      path: "user",
      model: User,
    })
    .lean();

  if (!tutor) {
    return notFound();
  }

  const tutorData = tutor as any;

  return (
    <div className="bg-off-white min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        
        {/* Profile Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <DashboardCard className="lg:col-span-2">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-24 h-24 bg-dark-navy text-off-white flex items-center justify-center text-3xl font-bold border-2 border-dark-navy shrink-0">
                {tutorData.user?.name?.charAt(0) || "T"}
              </div>
              <div className="flex-grow w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-extrabold text-dark-navy tracking-tight uppercase">
                      {tutorData.user?.name}
                    </h1>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(tutorData.subjects || []).map((sub: string) => (
                        <span key={sub} className="px-2 py-1 bg-off-white border-2 border-dark-navy/10 text-[10px] font-bold uppercase text-steel-blue">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                  <StatusBadge status={tutorData.user?.status || "active"} />
                </div>
                
                <p className="mt-6 text-steel-blue font-medium leading-relaxed italic">
                  "{tutorData.description || "No description provided."}"
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-center gap-2 text-dark-navy">
                    <Clock size={16} className="text-coral" />
                    <span className="text-xs font-bold uppercase tracking-widest">{tutorData.experienceYears || 0} Years Exp.</span>
                  </div>
                  <div className="flex items-center gap-2 text-dark-navy">
                    <GraduationCap size={16} className="text-coral" />
                    <span className="text-xs font-bold uppercase tracking-widest">{tutorData.education || "Expert"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-dark-navy">
                    <DollarSign size={16} className="text-coral" />
                    <span className="text-xs font-bold uppercase tracking-widest">${tutorData.hourlyRate || 0}/hr</span>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Contact / Info */}
          <DashboardCard title="Contact Info" className="h-fit">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-dark-navy">
                <Mail size={18} className="text-coral" />
                <span className="text-sm font-bold truncate">{tutorData.user?.email}</span>
              </div>
              {tutorData.user?.country && (
                <div className="flex items-center gap-3 text-dark-navy">
                  <MapPin size={18} className="text-coral" />
                  <span className="text-sm font-bold">{tutorData.user.country}</span>
                </div>
              )}
              <button className="mt-4 w-full py-3 bg-dark-navy text-off-white font-bold uppercase tracking-widest hover:bg-coral transition-colors border-2 border-dark-navy">
                Book a Session
              </button>
            </div>
          </DashboardCard>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DashboardCard title="Expertise & Skills">
            <div className="flex flex-wrap gap-3">
              {(tutorData.skills || []).length > 0 ? (
                tutorData.skills.map((skill: string) => (
                  <span key={skill} className="px-4 py-2 bg-off-white border-2 border-dark-navy font-bold text-xs uppercase tracking-widest text-dark-navy">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-steel-blue italic text-sm">No specific skills listed.</p>
              )}
            </div>
          </DashboardCard>

          <DashboardCard title="Availability">
            <div className="space-y-4">
              {tutorData.availability && tutorData.availability.length > 0 ? (
                tutorData.availability.map((avail: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-off-white border-2 border-dark-navy/5">
                    <span className="font-bold text-dark-navy uppercase text-xs tracking-widest">{avail.day}</span>
                    <span className="text-steel-blue font-bold text-xs">{avail.time.join(", ")}</span>
                  </div>
                ))
              ) : (
                <p className="text-steel-blue italic text-sm">Availability not set.</p>
              )}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
