"use client";

import React, { useEffect, useState } from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  BookOpen, GraduationCap, Mail, MapPin,
  Clock, Calendar, CheckCircle, ChevronRight,
  LayoutDashboard, Search, Settings, LogOut, CreditCard, Bell, History,
  TrendingUp, Award
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dark-navy"></div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <p className="text-steel-blue font-bold">Student not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-off-white min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Profile Header Card */}
        <div className="bg-white border border-dark-navy/10 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-coral/5 rounded-bl-full -mr-10 -mt-10" />
          
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative">
            <div className="w-32 h-32 bg-coral rounded-2xl flex items-center justify-center text-off-white text-4xl font-bold border-4 border-white shadow-lg overflow-hidden shrink-0">
              {studentData.profileImage ? (
                <Image src={studentData.profileImage} alt={studentData.name} width={128} height={128} className="object-cover w-full h-full" />
              ) : (
                studentData.name.charAt(0)
              )}
            </div>

            <div className="flex-grow w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-dark-navy uppercase tracking-tight mb-1">{studentData.name}</h1>
                  <p className="text-[10px] font-bold text-steel-blue uppercase tracking-[0.2em]">{studentData.whichClass}</p>
                </div>
                <StatusBadge status={studentData.status} />
              </div>

              <div className="mt-6 bg-off-white p-4 rounded-2xl border border-dark-navy/5 inline-block w-full md:w-auto text-left">
                <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-2 flex items-center gap-2">
                  <TrendingUp size={12} className="text-coral" /> Learning Goals
                </p>
                <p className="text-dark-navy font-medium text-sm leading-relaxed italic">
                  "{studentData.learningGoals}"
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-dark-navy/5">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-1">Hours Learned</span>
                  <p className="text-xl font-bold text-dark-navy">{studentData.stats.hoursLearned}h</p>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-1">Courses</span>
                  <p className="text-xl font-bold text-dark-navy">{studentData.stats.activeCourses}</p>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-1">Sessions</span>
                  <p className="text-xl font-bold text-dark-navy">{studentData.stats.completedSessions}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Interests & History */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white border border-dark-navy/10 rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-dark-navy uppercase tracking-tight mb-6 flex items-center gap-2">
                <BookOpen className="text-coral" size={20} /> Subjects of Interest
              </h3>
              <div className="flex flex-wrap gap-3">
                {studentData.subjects && studentData.subjects.length > 0 ? (
                  studentData.subjects.map((sub: string) => (
                    <div key={sub} className="flex items-center gap-2 px-4 py-2 bg-off-white border border-dark-navy/5 rounded-xl hover:border-coral/30 transition-colors">
                      <div className="w-1.5 h-1.5 bg-coral rounded-full" />
                      <span className="text-xs font-bold text-dark-navy uppercase tracking-wider">{sub}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-steel-blue italic">No subjects selected yet.</p>
                )}
              </div>
            </div>

            <div className="bg-white border border-dark-navy/10 rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-dark-navy uppercase tracking-tight mb-6 flex items-center gap-2">
                <History className="text-coral" size={20} /> Learning History
              </h3>
              <div className="space-y-4">
                {studentData.history && studentData.history.length > 0 ? (
                  studentData.history.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-off-white rounded-2xl border border-dark-navy/5 hover:border-dark-navy/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-dark-navy/10">
                          <Award size={18} className="text-coral" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-dark-navy uppercase">{item.tutor}</p>
                          <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest">
                            {item.subject} • {new Date(item.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-steel-blue font-medium italic">No sessions attended yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-white border border-dark-navy/10 rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-dark-navy uppercase tracking-tight mb-6 flex items-center gap-2">
                <MapPin className="text-coral" size={20} /> Information
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-1 py-3 border-b border-dark-navy/5">
                  <span className="text-[10px] font-bold text-steel-blue uppercase tracking-widest">Location</span>
                  <span className="text-sm font-bold text-dark-navy">{studentData.location || "Not specified"}</span>
                </div>
                <div className="flex flex-col gap-1 py-3 border-b border-dark-navy/5">
                  <span className="text-[10px] font-bold text-steel-blue uppercase tracking-widest">Email</span>
                  <span className="text-sm font-bold text-dark-navy truncate">{studentData.email}</span>
                </div>
                <button className="mt-4 w-full py-4 bg-dark-navy text-off-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-coral transition-all shadow-lg hover:shadow-coral/20">
                  {isOwner ? "Update Profile" : "Contact Student"}
                </button>
              </div>
            </div>

            {isOwner && (
              <Link 
                href={`/students/${id}/dashboard`}
                className="block w-full py-4 bg-coral text-white text-center text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-dark-navy transition-all shadow-lg"
              >
                Go to Private Dashboard
              </Link>
            )}

            <div className="bg-coral rounded-3xl p-8 text-off-white shadow-xl">
              <h3 className="text-lg font-bold uppercase tracking-tight mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Global Rank</span>
                  <span className="text-xl font-bold">#1,204</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Points</span>
                  <span className="text-xl font-bold">450 XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
