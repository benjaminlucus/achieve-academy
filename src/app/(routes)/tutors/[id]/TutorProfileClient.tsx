"use client";

import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { 
  GraduationCap, Users, 
  ShieldCheck, ShieldAlert, History, Star, Award, Zap,
  Globe, Briefcase
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { ConnectButton } from "@/components/ConnectButton";
import { Toaster } from "react-hot-toast";
import { availabilityTimes } from "@/lib/availability";

interface TutorData {
  _id: string;
  name: string;
  profileImage?: string;
  clerkId: string;
  status: string;
  isVerified: boolean;
  verificationLevel: string;
  [key: string]: any;
}

interface TutorProfileClientProps {
  tutorData: TutorData;
  userId: string;
}

export function TutorProfileClient({ tutorData, userId }: TutorProfileClientProps) {
  const { user: clerkUser } = useUser();
  const isOwner = clerkUser?.publicMetadata?.databaseId === userId || tutorData?.clerkId === clerkUser?.id;

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-20 font-sans">
      <Toaster />
      
      {/* Hero Banner Area */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-gray-100 to-gray-50 overflow-hidden">
        {tutorData.bannerImage ? (
          <Image 
            src={tutorData.bannerImage} 
            alt="Profile Banner" 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-300 font-semibold uppercase tracking-widest text-sm">Banner Area</div>
          </div>
        )}
        
        {/* Verification Alert for Admin/Owner */}
        {!tutorData.isVerified && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4">
            <div className="bg-amber-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <ShieldAlert size={24} className="shrink-0" />
              <div className="flex-grow">
                <p className="text-xs font-black uppercase tracking-widest">Verification Pending</p>
                <p className="text-[11px] opacity-90 font-medium">This profile is currently being reviewed by our team.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-dark-navy/5 border border-gray-100 text-center flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-40 h-40 rounded-[2.5rem] bg-dark-navy p-1 shadow-2xl rotate-3 group hover:rotate-0 transition-transform duration-500">
                  <div className="w-full h-full rounded-[2.2rem] bg-white overflow-hidden -rotate-3 group-hover:rotate-0 transition-transform duration-500 relative">
                    {tutorData.profileImage ? (
                      <Image
                        src={tutorData.profileImage}
                        alt={tutorData.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-black text-dark-navy uppercase">
                        {tutorData.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                {tutorData.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2.5 rounded-2xl border-4 border-white shadow-xl z-20">
                    <ShieldCheck size={24} />
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-black text-dark-navy uppercase tracking-tight mb-1">{tutorData.name}</h1>
              <p className="text-xs font-bold text-coral uppercase tracking-[0.2em] mb-6">Expert Educator</p>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {tutorData.teachingLevels && tutorData.teachingLevels.length > 0 ? (
                  tutorData.teachingLevels.map((level: string) => (
                    <span key={level} className="px-4 py-2 bg-purple-primary/10 text-purple-primary text-[10px] font-black uppercase tracking-widest rounded-xl border border-purple-primary/20">
                      {level}
                    </span>
                  ))
                ) : (
                  <span className="px-4 py-2 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl">
                    Teaching levels not specified
                  </span>
                )}
              </div>

              <div className="w-full mb-6">
                <p className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em] mb-3 text-center">Can Teach</p>
                <div className="flex flex-col items-stretch gap-2">
                  {(() => {
                    const entries: { name: string; levelsText: string }[] = [];
                    const seen = new Set<string>();
                    if (tutorData.expertise && Array.isArray(tutorData.expertise)) {
                      for (const e of tutorData.expertise) {
                        if (!e || !e.name) continue;
                        const key = String(e.name).trim().toLowerCase();
                        if (seen.has(key)) continue;
                        seen.add(key);
                        entries.push({
                          name: e.name,
                          levelsText: (e.levels && e.levels.length > 0) ? e.levels.join(" & ") : "",
                        });
                      }
                    }
                    for (const s of tutorData.subjects || []) {
                      if (!s) continue;
                      const key = String(s).trim().toLowerCase();
                      if (seen.has(key)) continue;
                      seen.add(key);
                      entries.push({ name: s, levelsText: "" });
                    }
                    if (entries.length === 0) {
                      return (
                        <span className="px-4 py-2 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl text-center">
                          No subjects listed yet
                        </span>
                      );
                    }
                    return entries.map((entry, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <span className="text-steel-blue text-[10px] font-black uppercase tracking-widest">
                          {entry.name}
                        </span>
                        {entry.levelsText && (
                          <span className="text-coral text-[9px] font-bold uppercase tracking-widest">
                            {entry.levelsText}
                          </span>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div className="w-full space-y-3 mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Hourly Rate</span>
                  <span className="text-lg font-black text-dark-navy">${tutorData.hourlyRate}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="text-lg font-black text-dark-navy">{tutorData.stats.rating || 0}</span>
                  </div>
                </div>
              </div>

              {!isOwner && (
                <div className="w-full">
                  <ConnectButton targetUserId={userId} />
                </div>
              )}
            </div>

            {/* Quick Info Sidebar */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-sm font-black text-dark-navy uppercase tracking-widest flex items-center gap-3">
                <Globe size={18} className="text-coral" /> Availability
              </h3>
              <div className="space-y-3">
                {tutorData.availability && tutorData.availability.some((slot: any) => availabilityTimes(slot).length > 0) ? (
                  tutorData.availability.filter((slot: any) => availabilityTimes(slot).length > 0).map((slot: any) => (
                    <div key={slot.day} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <span className="text-xs font-bold text-steel-blue uppercase">{slot.day}</span>
                      <span className="text-[10px] font-black text-dark-navy uppercase bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg">
                        {availabilityTimes(slot).join(" – ")}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">Availability not set</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                <p className="text-[9px] font-black text-steel-blue uppercase tracking-[0.2em] mb-2">Experience</p>
                <p className="text-xl font-black text-dark-navy">{tutorData.experienceLevel}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                <p className="text-[9px] font-black text-steel-blue uppercase tracking-[0.2em] mb-2">Students</p>
                <p className="text-xl font-black text-dark-navy">{tutorData.stats.totalStudents}+</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                <p className="text-[9px] font-black text-steel-blue uppercase tracking-[0.2em] mb-2">Sessions</p>
                <p className="text-xl font-black text-dark-navy">{tutorData.stats.completedSessions}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                <p className="text-[9px] font-black text-steel-blue uppercase tracking-[0.2em] mb-2">Response</p>
                <p className="text-xl font-black text-emerald-500">FAST</p>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-dark-navy uppercase tracking-tight mb-6 flex items-center gap-3">
                <Zap size={24} className="text-coral" /> About Me
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg font-medium italic">
                "{tutorData.bio}"
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                <h3 className="text-sm font-black text-dark-navy uppercase tracking-widest mb-6 flex items-center gap-3">
                  <Briefcase size={20} className="text-coral" /> What This Tutor Can Teach
                </h3>
                {(() => {
                  const entries: { name: string; levels: string[] }[] = [];
                  const seen = new Set<string>();
                  if (tutorData.expertise && Array.isArray(tutorData.expertise)) {
                    for (const e of tutorData.expertise) {
                      if (!e || !e.name) continue;
                      const key = String(e.name).trim().toLowerCase();
                      if (seen.has(key)) continue;
                      seen.add(key);
                      entries.push({
                        name: e.name,
                        levels: (e.levels && Array.isArray(e.levels)) ? e.levels : [],
                      });
                    }
                  }
                  for (const s of tutorData.subjects || []) {
                    if (!s) continue;
                    const key = String(s).trim().toLowerCase();
                    if (seen.has(key)) continue;
                    seen.add(key);
                    entries.push({ name: s, levels: [] });
                  }
                  if (entries.length === 0) {
                    return (
                      <p className="text-sm text-gray-500">No subjects listed yet.</p>
                    );
                  }
                  return (
                    <div className="space-y-3 mb-6">
                      {entries.map((entry, i) => (
                        <div
                          key={i}
                          className="flex flex-wrap items-baseline justify-between gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100"
                        >
                          <span className="px-3 py-1 bg-dark-navy text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                            {entry.name}
                          </span>
                          {entry.levels.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {entry.levels.map((lv: string, j: number) => (
                                <span
                                  key={j}
                                  className="px-2.5 py-1 bg-purple-primary/10 text-purple-primary text-[9px] font-black uppercase tracking-widest rounded-lg border border-purple-primary/20"
                                >
                                  {lv}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                              Teaching levels not specified
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
                {tutorData.certifications && tutorData.certifications.length > 0 && (
                  <div>
                    <p className="text-xs font-black text-steel-blue uppercase tracking-widest mb-3">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {tutorData.certifications.map((cert: string) => (
                        <span key={cert} className="px-4 py-2 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-xl border border-amber-200">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Session History (Placeholder for real data) */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-dark-navy uppercase tracking-tight flex items-center gap-3">
                  <History size={24} className="text-coral" /> Recent Activity
                </h3>
                <Link href="#" className="text-[10px] font-black text-coral uppercase tracking-widest hover:underline">View All</Link>
              </div>
              
              <div className="space-y-4">
                {tutorData.history && tutorData.history.length > 0 ? (
                  tutorData.history.map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-coral group-hover:text-white transition-colors">
                          <Users size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-dark-navy uppercase">{session.student}</p>
                          <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest">{session.subject} • {new Date(session.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <StatusBadge status={session.status} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <Award size={40} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No recent sessions recorded</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
