"use client";

import React, { useEffect, useState } from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { 
  BookOpen, GraduationCap, DollarSign, Clock, Users, 
  Calendar, Mail, MapPin, CheckCircle, ChevronRight, 
  BarChart3, Settings, LogOut, LayoutDashboard, Search, Bell,
  ShieldCheck, ShieldAlert, History
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

export default function TutorProfileView() {
  const { id } = useParams<{ id: string }>();
  const { user: clerkUser } = useUser();
  const [tutorData, setTutorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const res = await fetch(`/api/tutors/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTutorData(data);
        }
      } catch (error) {
        console.error("Error fetching tutor data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutorData();
  }, [id]);

  const isOwner = clerkUser?.publicMetadata?.databaseId === id || tutorData?.clerkId === clerkUser?.id;
  // Actually, since the ID in URL is the database _id, we should check against that.
  // We can add the databaseId to clerk metadata during onboarding or fetch it.
  // For now, let's assume we can compare.

  if (isLoading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dark-navy"></div>
      </div>
    );
  }

  if (!tutorData) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <p className="text-steel-blue font-bold">Tutor not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-off-white min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Verification Banner */}
        {!tutorData.isVerified && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl flex items-center gap-4">
            <ShieldAlert className="text-amber-500 shrink-0" size={24} />
            <div>
              <p className="text-sm font-bold text-amber-800 uppercase tracking-tight">Profile Under Review</p>
              <p className="text-xs text-amber-700">Our team is currently verifying your credentials. You'll be notified once approved.</p>
            </div>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white border border-dark-navy/10 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-dark-navy/5 rounded-bl-full -mr-10 -mt-10" />
          
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative">
            <div className="relative">
              {tutorData.profileImage ? (
                <Image
                  src={tutorData.profileImage}
                  alt={tutorData.name}
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-dark-navy rounded-2xl flex items-center justify-center text-off-white text-4xl font-bold border-4 border-white shadow-md">
                  {tutorData.name.charAt(0)}
                </div>
              )}
              {tutorData.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-white shadow-lg">
                  <ShieldCheck size={20} />
                </div>
              )}
            </div>
            
            <div className="flex-grow w-full">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold text-dark-navy uppercase tracking-tight mb-2 flex items-center gap-2 justify-center md:justify-start">
                    {tutorData.name}
                  </h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {tutorData.subjects.map((sub: string) => (
                      <span key={sub} className="px-3 py-1 bg-off-white text-steel-blue text-[10px] font-bold uppercase rounded-full border border-dark-navy/5">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
                <StatusBadge status={tutorData.status} />
              </div>
              
              <p className="mt-6 text-steel-blue text-sm font-medium leading-relaxed max-w-2xl text-center md:text-left">
                {tutorData.bio}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-dark-navy/5">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-1 flex items-center gap-1">
                    <DollarSign size={10} /> Hourly Rate
                  </span>
                  <p className="text-xl font-bold text-dark-navy">${tutorData.hourlyRate}<span className="text-xs font-medium text-steel-blue">/hr</span></p>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Clock size={10} /> Experience
                  </span>
                  <p className="text-xl font-bold text-dark-navy">{tutorData.experienceYears}<span className="text-xs font-medium text-steel-blue"> Yrs</span></p>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Users size={10} /> Students
                  </span>
                  <p className="text-xl font-bold text-dark-navy">{tutorData.stats.totalStudents}</p>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-1 flex items-center gap-1">
                    <CheckCircle size={10} /> Rating
                  </span>
                  <p className="text-xl font-bold text-dark-navy">{tutorData.stats.rating}<span className="text-xs font-medium text-steel-blue">/5</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Expertise & Education */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white border border-dark-navy/10 rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-dark-navy uppercase tracking-tight mb-6 flex items-center gap-2">
                <GraduationCap className="text-coral" size={20} /> Education & Background
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-2">Highest Qualification</p>
                  <p className="text-base font-bold text-dark-navy bg-off-white p-4 rounded-xl border border-dark-navy/5">
                    {tutorData.education}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-3">Core Expertise</p>
                  <div className="flex flex-wrap gap-3">
                    {tutorData.subjects.map((skill: string) => (
                      <span key={skill} className="text-xs font-bold text-dark-navy bg-off-white px-4 py-2 rounded-xl border border-dark-navy/5 hover:border-coral/30 transition-colors">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Sessions/History */}
            <div className="bg-white border border-dark-navy/10 rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-dark-navy uppercase tracking-tight mb-6 flex items-center gap-2">
                <History className="text-coral" size={20} /> Recent Sessions
              </h3>
              <div className="space-y-4">
                {tutorData.history && tutorData.history.length > 0 ? (
                  tutorData.history.map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-off-white rounded-2xl border border-dark-navy/5 hover:border-dark-navy/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-dark-navy/10">
                          <Users size={18} className="text-coral" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-dark-navy uppercase">{session.student}</p>
                          <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest">
                            {session.subject} • {new Date(session.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={session.status} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-steel-blue font-medium italic">No sessions recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-white border border-dark-navy/10 rounded-3xl p-8 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-dark-navy uppercase tracking-tight mb-6 flex items-center gap-2">
                <Calendar className="text-coral" size={20} /> Availability
              </h3>
              <div className="space-y-4 flex-grow">
                {tutorData.availability && tutorData.availability.length > 0 ? (
                  tutorData.availability.map((item: any) => (
                    <div key={item.day} className="flex justify-between items-center text-sm py-3 border-b border-dark-navy/5 last:border-0">
                      <span className="font-bold text-dark-navy">{item.day}</span>
                      <span className="text-steel-blue font-bold text-xs uppercase tracking-tight">{item.slots?.join(", ") || "No slots"}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-steel-blue italic">No availability set.</p>
                )}
              </div>
              <button className="mt-8 w-full py-4 bg-dark-navy text-off-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-coral transition-all shadow-lg hover:shadow-coral/20 group">
                <span className="flex items-center justify-center gap-2">
                  {isOwner ? "Update Availability" : "Book a Session"} <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>

            {isOwner && (
              <Link 
                href={`/tutors/${id}/dashboard`}
                className="block w-full py-4 bg-coral text-white text-center text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-dark-navy transition-all shadow-lg"
              >
                Go to Private Dashboard
              </Link>
            )}

            <div className="bg-dark-navy rounded-3xl p-8 text-off-white shadow-xl">
              <h3 className="text-lg font-bold uppercase tracking-tight mb-4">Earnings</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-1">Total Hours Taught</p>
                  <p className="text-3xl font-bold">{tutorData.stats.hoursTaught}h</p>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-1">Next Payout</p>
                  <p className="text-xl font-bold text-coral">$0.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
