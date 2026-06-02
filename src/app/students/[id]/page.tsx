"use client";

import React, { useEffect, useState } from "react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  BookOpen, GraduationCap, Search, History, Award, Zap, Target, ShieldCheck, Trophy
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { ConnectButton } from "@/components/ConnectButton";
import { Toaster } from "react-hot-toast";

export default function StudentProfileView() {
  const { id } = useParams<{ id: string }>();
  const { user: clerkUser } = useUser();
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await fetch(`/api/students/${id}`);
        if (res.ok) {
          const data = await res.json();
          setStudentData(data);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  const isOwner = clerkUser?.publicMetadata?.databaseId === id || studentData?.clerkId === clerkUser?.id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-coral border-t-dark-navy rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Search size={40} className="text-gray-300" />
          </div>
          <p className="text-dark-navy font-black uppercase tracking-widest">Student not found</p>
          <Link href="/students" className="text-coral font-bold uppercase text-xs hover:underline">Browse all students</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-20 font-sans">
      <Toaster />
      
      {/* Hero Banner Area */}
      <div className="relative h-64 md:h-80 bg-coral overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-dark-navy via-transparent to-transparent blur-3xl scale-150" />
          <div className="grid grid-cols-12 gap-2 opacity-10 p-2">
            {[...Array(60)].map((_, i) => (
              <div key={i} className="h-12 bg-white/20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-coral/5 border border-gray-100 text-center flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-40 h-40 rounded-[2.5rem] bg-coral p-1 shadow-2xl -rotate-3 group hover:rotate-0 transition-transform duration-500">
                  <div className="w-full h-full rounded-[2.2rem] bg-white overflow-hidden rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    {studentData.profileImage ? (
                      <Image
                        src={studentData.profileImage}
                        alt={studentData.name}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-black text-coral uppercase">
                        {studentData.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-dark-navy text-white p-2.5 rounded-2xl border-4 border-white shadow-xl z-20">
                  <Award size={24} />
                </div>
              </div>

              <h1 className="text-2xl font-black text-dark-navy uppercase tracking-tight mb-1">{studentData.name}</h1>
              <p className="text-xs font-bold text-steel-blue uppercase tracking-[0.2em] mb-6">{studentData.whichClass}</p>

              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {studentData.subjects && studentData.subjects.map((sub: string) => (
                  <span key={sub} className="px-4 py-2 bg-gray-50 text-dark-navy text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-100">
                    {sub}
                  </span>
                ))}
              </div>

              <div className="w-full space-y-3 mb-8">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Level</span>
                  <span className="text-xs font-black text-dark-navy uppercase">Intermediate</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Points</span>
                  <div className="flex items-center gap-1">
                    <Zap size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-lg font-black text-dark-navy">450 XP</span>
                  </div>
                </div>
              </div>

              {!isOwner && (
                <div className="w-full">
                  <ConnectButton targetUserId={studentData.userId} />
                </div>
              )}
            </div>

            {/* Achievements Sidebar */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-sm font-black text-dark-navy uppercase tracking-widest flex items-center gap-3">
                <Trophy size={18} className="text-coral" /> Achievements
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 hover:scale-110 transition-transform cursor-help group relative">
                    <ShieldCheck size={24} className="text-emerald-500" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-navy text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Verified Learner
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                <p className="text-[9px] font-black text-steel-blue uppercase tracking-[0.2em] mb-2">Hours Learned</p>
                <p className="text-xl font-black text-dark-navy">{studentData.stats.hoursLearned}H</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                <p className="text-[9px] font-black text-steel-blue uppercase tracking-[0.2em] mb-2">Courses</p>
                <p className="text-xl font-black text-dark-navy">{studentData.stats.activeCourses}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                <p className="text-[9px] font-black text-steel-blue uppercase tracking-[0.2em] mb-2">Sessions</p>
                <p className="text-xl font-black text-dark-navy">{studentData.stats.completedSessions}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                <p className="text-[9px] font-black text-steel-blue uppercase tracking-[0.2em] mb-2">Streak</p>
                <p className="text-xl font-black text-coral">5 DAYS</p>
              </div>
            </div>

            {/* Goals Section */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-dark-navy uppercase tracking-tight mb-6 flex items-center gap-3">
                <Target size={24} className="text-coral" /> Learning Goals
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg font-medium italic">
                "{studentData.learningGoals}"
              </p>
            </div>

            {/* Subject Interests */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-sm font-black text-dark-navy uppercase tracking-widest mb-6 flex items-center gap-3">
                <BookOpen size={20} className="text-coral" /> Areas of Interest
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {studentData.subjects && studentData.subjects.map((sub: string) => (
                  <div key={sub} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3 group hover:bg-white hover:shadow-md transition-all">
                    <div className="w-2 h-2 rounded-full bg-coral" />
                    <span className="text-xs font-black text-dark-navy uppercase tracking-tight">{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning History */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-dark-navy uppercase tracking-tight flex items-center gap-3">
                  <History size={24} className="text-coral" /> Learning History
                </h3>
                <Link href="#" className="text-[10px] font-black text-coral uppercase tracking-widest hover:underline">View All</Link>
              </div>
              
              <div className="space-y-4">
                {studentData.history && studentData.history.length > 0 ? (
                  studentData.history.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-coral group-hover:text-white transition-colors">
                          <GraduationCap size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-dark-navy uppercase">{item.tutor}</p>
                          <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest">{item.subject} • {new Date(item.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <Trophy size={40} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Your learning journey starts here</p>
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
