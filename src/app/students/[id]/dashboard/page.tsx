"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  User, Mail, MapPin, Clock, GraduationCap, 
  BookOpen, Settings, Save, Edit2, 
  X, Target, History, Award, BookCheck,
  ChevronRight, Calendar, CreditCard
} from "lucide-react";
import { updateStudentProfile } from "@/app/(routes)/dashboard/actions";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { InterviewSection } from "@/components/dashboard/InterviewSection";
import { SessionSection } from "@/components/dashboard/SessionSection";
import { ConnectionList } from "@/components/dashboard/ConnectionList";
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import Image from "next/image";

export default function StudentPrivateDashboard() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/students/${id}`);
        if (res.ok) {
          const data = await res.json();
          setStudentData(data);
          setFormData({
            name: data.name,
            email: data.email,
            country: data.location,
            timezone: data.timezone || "GMT+0",
            whichClass: data.whichClass,
            learningGoals: data.learningGoals,
            subjects: data.subjects.join(", "),
            description: data.description || "",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateStudentProfile(id, formData);
      setIsEditing(false);
      const res = await fetch(`/api/students/${id}`);
      if (res.ok) {
        const data = await res.json();
        setStudentData(data);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-off-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-dark-navy border-t-coral rounded-full animate-spin"></div>
    </div>
  );

  if (!studentData) return (
    <div className="min-h-screen bg-off-white flex items-center justify-center font-black text-dark-navy uppercase tracking-widest">
      Student not found
    </div>
  );

  return (
    <div className="bg-[#F8F9FA] min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Trial Status Banner */}
        <TrialBanner userRole="student" myId={id} />

        {/* Profile Header */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-dark-navy/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="relative group">
              {studentData.profileImage ? (
                <Image src={studentData.profileImage} alt={studentData.name} width={100} height={100} className="w-24 h-24 rounded-3xl object-cover ring-4 ring-dark-navy/5 transition-all group-hover:scale-105" />
              ) : (
                <div className="w-24 h-24 bg-dark-navy rounded-3xl flex items-center justify-center text-white text-4xl font-black transition-all group-hover:scale-105">
                  {studentData.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-dark-navy tracking-tight uppercase">{studentData.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <span className="flex items-center gap-2 text-[10px] font-black text-steel-blue uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-dark-navy/5">
                  <GraduationCap size={14} className="text-coral" /> {studentData.whichClass}
                </span>
                <span className="flex items-center gap-2 text-[10px] font-black text-steel-blue uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-dark-navy/5">
                  <MapPin size={14} className="text-coral" /> {studentData.location}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="flex-1 md:flex-none px-8 py-4 bg-gray-50 text-dark-navy font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all border border-dark-navy/5">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none px-8 py-4 bg-dark-navy text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-dark-navy/90 transition-all shadow-xl shadow-dark-navy/20 disabled:opacity-50">
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="w-full md:w-auto px-8 py-4 bg-dark-navy text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-dark-navy/90 transition-all shadow-xl shadow-dark-navy/20 flex items-center justify-center gap-3">
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-10">
            {/* Interview Section */}
            <InterviewSection data={studentData} />

            {/* Study Sessions Section */}
            <SessionSection userRole="student" />

            {/* Academic Info */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-dark-navy/5 space-y-10">
              <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">Academic Profile</h2>
                <BookCheck className="text-coral" size={24} />
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Full Name</label>
                  {isEditing ? (
                    <input className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  ) : (
                    <p className="text-dark-navy font-bold text-lg">{studentData.name}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Email Address</label>
                  <p className="text-dark-navy font-bold text-lg opacity-60">{studentData.email}</p>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Current Grade</label>
                  {isEditing ? (
                    <input className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all" value={formData.whichClass} onChange={(e) => setFormData({...formData, whichClass: e.target.value})} />
                  ) : (
                    <p className="text-dark-navy font-bold text-lg">{studentData.whichClass}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Timezone</label>
                  {isEditing ? (
                    <input className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all" value={formData.timezone} onChange={(e) => setFormData({...formData, timezone: e.target.value})} />
                  ) : (
                    <p className="text-dark-navy font-bold text-lg">{formData.timezone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Subjects of Interest</label>
                {isEditing ? (
                  <input className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all" value={formData.subjects} onChange={(e) => setFormData({...formData, subjects: e.target.value})} />
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {studentData.subjects.map((s: string) => (
                      <span key={s} className="px-5 py-2 bg-dark-navy/5 text-dark-navy text-[10px] font-black uppercase tracking-widest rounded-xl border border-dark-navy/5">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Learning Goals</label>
                {isEditing ? (
                  <textarea rows={4} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all resize-none" value={formData.learningGoals} onChange={(e) => setFormData({...formData, learningGoals: e.target.value})} />
                ) : (
                  <p className="text-dark-navy font-medium text-lg leading-relaxed italic text-steel-blue/80">
                    "{studentData.learningGoals}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            {/* Stats Card */}
            <div className="bg-dark-navy p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-coral/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-coral/20 transition-all" />
              <h2 className="text-lg font-black uppercase tracking-tight border-b border-white/10 pb-6 mb-8 flex items-center justify-between">
                Progress <Target className="text-coral" size={20} />
              </h2>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Hours</p>
                  <p className="text-3xl font-black">{studentData.stats.hoursLearned}h</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Sessions</p>
                  <p className="text-3xl font-black">{studentData.stats.completedSessions}<span className="text-xs opacity-40 ml-1 font-bold">/ {studentData.stats.totalSessions}</span></p>
                </div>
              </div>
            </div>

            {/* Connections Section */}
            <ConnectionList userRole="student" myId={id} />

            {/* Recent Activity */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-dark-navy/5 space-y-8">
              <h2 className="text-lg font-black text-dark-navy uppercase tracking-tight flex items-center justify-between">
                Activity <History className="text-coral" size={20} />
              </h2>
              <div className="space-y-4">
                {studentData.history && studentData.history.length > 0 ? (
                  studentData.history.map((item: any) => (
                    <div key={item.id} className="group flex items-center gap-4 p-4 hover:bg-gray-50 rounded-[1.5rem] transition-all cursor-pointer border border-transparent hover:border-dark-navy/5">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {item.type === "payment" ? (
                          <CreditCard size={20} className="text-coral" />
                        ) : (
                          <Calendar size={20} className="text-dark-navy/30" />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-xs font-black text-dark-navy uppercase truncate tracking-tight">{item.title}</p>
                        <p className="text-[9px] font-bold text-steel-blue uppercase truncate">{item.subtitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-dark-navy">{new Date(item.date).toLocaleDateString()}</p>
                        {item.amount && <p className="text-[10px] font-bold text-coral">${item.amount}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-steel-blue font-medium italic text-center py-6">No recent activity found.</p>
                )}
              </div>
            </div>

            {/* Wallet Card */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-dark-navy/5 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Learning Wallet</h2>
                <CreditCard className="text-dark-navy/20" size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-dark-navy">$0.00</p>
                <p className="text-[10px] font-black text-coral uppercase tracking-widest">Available Credit</p>
              </div>
              <button className="w-full py-4 bg-dark-navy/5 hover:bg-dark-navy text-dark-navy hover:text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all border border-dark-navy/5">
                Top Up Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
