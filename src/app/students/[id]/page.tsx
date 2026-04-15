"use client";

import React from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  BookOpen, GraduationCap, Mail, MapPin,
  Clock, Calendar, CheckCircle, ChevronRight,
  LayoutDashboard, Search, Settings, LogOut, CreditCard, Bell, History
} from "lucide-react";
import Link from "next/link";

export default function StudentProfileView({ params }: { params: { id: string } }) {

  const [studentData, setStudentData] = React.useState({
    name: "",
    email: "",
    status: "inactive",
    whichClass: "",
    learningGoals: "",
    subjects: [],
    location: "",
    stats: {
      hoursLearned: 0,
      activeCourses: 0,
      completedSessions: 0
    },
    history: [
      { id: "", tutor: "", subject: "", date: "", status: "" },
    ]
  });

  const getStudentData = async () => {

    try {
      const res = await fetch(`/api/students/${params.id}`,
        {
          cache: "no-store",
        }
      );

      console.log("API Response student data:", res);

      if (!res.ok) {
        throw new Error(`Failed to fetch student data: ${res.statusText}`);
      }

      const studentData = await res.json();
      setStudentData(studentData);
    } catch (error) {
      console.error("Error fetching student data:", error);
      return null;
    }
  }

  React.useEffect(() => {
    getStudentData();
  }, [params.id]);

  return (
    <div className="bg-off-white min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">

        {/* Profile Header Card */}
        <div className="bg-white border border-dark-navy/10 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="w-32 h-32 bg-coral rounded-2xl flex items-center justify-center text-off-white text-4xl font-bold border-4 border-white shadow-md overflow-hidden">
              {studentData.name.charAt(0)}
            </div>

            <div className="flex-grow">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-dark-navy uppercase tracking-tight mb-1">{studentData.name}</h1>
                  <p className="text-[10px] font-bold text-steel-blue uppercase tracking-[0.2em]">{studentData.whichClass}</p>
                </div>
                <StatusBadge status={studentData.status} />
              </div>

              <div className="mt-6">
                <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-2">Learning Goals</p>
                <p className="text-dark-navy font-medium text-sm leading-relaxed max-w-2xl italic border-l-2 border-coral/30 pl-4">
                  "{studentData.learningGoals}"
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-dark-navy/5">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[10px] font-bold text-steel-blue uppercase tracking-widest mb-1">Hours Learned</span>
                  <p className="text-xl font-bold text-dark-navy">{studentData.stats.hoursLearned}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Interests & Subjects */}
          <div className="bg-white border border-dark-navy/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-dark-navy uppercase tracking-tight mb-6 flex items-center gap-2">
              <BookOpen className="text-coral" size={20} /> Subjects of Interest
            </h3>
            <div className="flex flex-wrap gap-2">
              {studentData.subjects.map(sub => (
                <div key={sub} className="flex items-center gap-2 px-3 py-2 bg-off-white border border-dark-navy/5 rounded-lg">
                  <div className="w-1.5 h-1.5 bg-coral rounded-full" />
                  <span className="text-xs font-bold text-dark-navy uppercase tracking-wider">{sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location & Contact */}
          <div className="bg-white border border-dark-navy/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-dark-navy uppercase tracking-tight mb-6 flex items-center gap-2">
              <MapPin className="text-coral" size={20} /> Student Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-dark-navy/5">
                <span className="text-[10px] font-bold text-steel-blue uppercase tracking-widest">Location</span>
                <span className="text-sm font-bold text-dark-navy">{studentData.location}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dark-navy/5">
                <span className="text-[10px] font-bold text-steel-blue uppercase tracking-widest">Email</span>
                <span className="text-sm font-bold text-dark-navy">{studentData.email}</span>
              </div>
              <div className="pt-4">
                <button className="w-full py-3 border-2 border-dark-navy text-dark-navy text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-dark-navy hover:text-off-white transition-all">
                  Contact Student
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Learning History Section */}
        <div className="bg-white border border-dark-navy/10 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-dark-navy uppercase tracking-tight mb-6 flex items-center gap-2">
            <History className="text-coral" size={20} /> Recent Learning History
          </h3>
          <div className="space-y-4">
            {studentData.history.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-off-white rounded-xl border border-dark-navy/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-dark-navy/10">
                    <History size={18} className="text-coral" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark-navy uppercase">{item.tutor}</p>
                    <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest">{item.subject} • {item.date}</p>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
