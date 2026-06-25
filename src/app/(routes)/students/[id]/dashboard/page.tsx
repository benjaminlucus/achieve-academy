"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  MapPin, Clock, GraduationCap, 
  BookOpen, Edit2, 
  Target, BookCheck,
  Zap, Trophy,
  TrendingUp, Pencil, Loader2
} from "lucide-react";
import { updateStudentProfile, updateProfileImage } from "@/app/(routes)/dashboard/actions";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { InterviewSection } from "@/components/dashboard/InterviewSection";
import { SessionSection } from "@/components/dashboard/SessionSection";
import { ConnectionList } from "@/components/dashboard/ConnectionList";
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";

export default function StudentPrivateDashboard() {
  const { id } = useParams<{ id: string }>();
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
      toast.success("Profile updated successfully!");
      const res = await fetch(`/api/students/${id}`);
      if (res.ok) {
        const data = await res.json();
        setStudentData(data);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await updateProfileImage(id, base64);
        if (res.success) {
          setStudentData((prev: any) => ({ ...prev, profileImage: base64 }));
          toast.success("Profile image updated!");
        } else {
          toast.error(typeof res.error === 'string' ? res.error : "Failed to update image");
        }
      } catch (error) {
        toast.error("Error uploading image");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };


  if (isLoading) return (
    <div className="min-h-screen bg-off-white flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-coral border-t-dark-navy rounded-full animate-spin"></div>
    </div>
  );

  if (!studentData) return (
    <div className="min-h-screen bg-off-white flex items-center justify-center font-black text-dark-navy uppercase tracking-widest">
      Student not found
    </div>
  );

  return (
    <div className="bg-[#F8F9FA] min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <Toaster />
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Trial Status Banner */}
        <TrialBanner userRole="student" myId={id} />

        {/* Profile Header */}
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-coral/5 rounded-full -ml-32 -mt-32 blur-3xl" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left relative z-10">
            <div className="relative group">
              <div className="w-28 h-28 rounded-3xl bg-coral p-1 shadow-2xl -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full rounded-[1.4rem] bg-white overflow-hidden rotate-3 group-hover:rotate-0 transition-transform duration-500 relative">
                  {studentData.profileImage ? (
                    <Image src={studentData.profileImage} alt={studentData.name} width={112} height={112} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-coral bg-white text-4xl font-black">
                      {studentData.name.charAt(0)}
                    </div>
                  )}

                  {/* Change Image Overlay */}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <Loader2 className="text-white animate-spin" size={24} />
                    ) : (
                      <Pencil className="text-white" size={24} />
                    )}
                  </label>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-dark-navy text-white p-2 rounded-2xl border-4 border-white shadow-lg z-20 pointer-events-none">
                <Trophy size={20} />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-black text-dark-navy tracking-tight uppercase">{studentData.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="flex items-center gap-2 text-[10px] font-black text-steel-blue uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <GraduationCap size={14} className="text-coral" /> {studentData.whichClass}
                </span>
                <span className="flex items-center gap-2 text-[10px] font-black text-steel-blue uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <MapPin size={14} className="text-coral" /> {studentData.location}
                </span>
                <StatusBadge status={studentData.status} />
              </div>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto relative z-10">
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

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center group hover:border-coral/20 transition-all">
            <div className="w-12 h-12 bg-coral/10 text-coral rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Clock size={24} />
            </div>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">Hours Learned</p>
            <p className="text-2xl font-black text-dark-navy">{studentData.stats?.hoursLearned ?? 0}h</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center group hover:border-coral/20 transition-all">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">Active Courses</p>
            <p className="text-2xl font-black text-dark-navy">{studentData.stats?.activeCourses ?? 0}</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center group hover:border-coral/20 transition-all">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Zap size={24} className="fill-current" />
            </div>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">XP Points</p>
            <p className="text-2xl font-black text-dark-navy">{studentData.stats?.xpPoints ?? 0}</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center group hover:border-coral/20 transition-all">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">Streak</p>
            <p className="text-2xl font-black text-dark-navy">{studentData.stats?.streak ?? 0} Days</p>
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
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-10">
              <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">Academic Profile</h2>
                <BookCheck className="text-coral" size={24} />
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Current Grade / Level</label>
                  {isEditing ? (
                    <input className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-coral/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all" value={formData.whichClass} onChange={(e) => setFormData({...formData, whichClass: e.target.value})} />
                  ) : (
                    <p className="text-dark-navy font-bold text-lg bg-gray-50 p-5 rounded-2xl border border-gray-100">{studentData.whichClass}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Learning Goals</label>
                  {isEditing ? (
                    <input className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-coral/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all" value={formData.learningGoals} onChange={(e) => setFormData({...formData, learningGoals: e.target.value})} />
                  ) : (
                    <p className="text-dark-navy font-bold text-lg bg-gray-50 p-5 rounded-2xl border border-gray-100">{studentData.learningGoals}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Subjects of Interest</label>
                {isEditing ? (
                  <input className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-coral/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all" value={formData.subjects} onChange={(e) => setFormData({...formData, subjects: e.target.value})} />
                ) : (
                  <div className="flex flex-wrap gap-3 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    {studentData.subjects.map((s: string) => (
                      <span key={s} className="px-5 py-2 bg-coral text-white text-[10px] font-black uppercase tracking-widest rounded-xl">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            {/* Connections Section */}
            <ConnectionList userRole="student" myId={id} />

            {/* Achievements Card */}
            <div className="bg-dark-navy p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-coral/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-coral/20 transition-all" />
              <h2 className="text-lg font-black uppercase tracking-tight border-b border-white/10 pb-6 mb-8 flex items-center justify-between">
                My Progress <Target className="text-coral" size={20} />
              </h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span>Course Completion</span>
                    <span>{studentData.stats?.courseCompletion ?? 0}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-coral rounded-full" style={{ width: `${studentData.stats?.courseCompletion ?? 0}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">XP Points</p>
                    <p className="text-xl font-black">{studentData.stats?.xpPoints ?? 0}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Rank</p>
                    <p className="text-xl font-black">#{studentData.stats?.rank ?? "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
