"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  MapPin, Clock, GraduationCap, 
  BookOpen, Edit2, 
  Target, BookCheck,
  Zap, Trophy,
  TrendingUp, Pencil, Loader2, Upload, Trash2, ShieldAlert, Search, CheckCircle2, ArrowRight
} from "lucide-react";
import { updateStudentProfile, updateProfileImage, updateBannerImage, removeBannerImage } from "@/app/(routes)/dashboard/actions";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { InterviewSection } from "@/components/dashboard/InterviewSection";
import { SessionSection } from "@/components/dashboard/SessionSection";
import { ConnectionList } from "@/components/dashboard/ConnectionList";
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import { PaymentSubmissionSection } from "@/components/dashboard/PaymentSubmissionSection";
import { AchievementsSection } from "@/components/dashboard/AchievementsSection";
import { WhatsAppCard } from "@/components/dashboard/WhatsAppCard";
import { PaymentInstructionsCard } from "@/components/dashboard/PaymentInstructionsCard";
import { WhatsAppOnboarding } from "@/components/dashboard/WhatsAppOnboarding";
import ConnectionRequestsManager from "@/components/dashboard/ConnectionRequestsManager";
import ChatInitializer from "@/components/chat/ChatInitializer";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";
import { RealtimeProvider, useRealtime } from "@/lib/realtime-context";

function StudentDashboardContent() {
  const { id } = useParams<{ id: string }>();
  const { lastUpdate } = useRealtime();
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isTogglingPublicProfile, setIsTogglingPublicProfile] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [conversations, setConversations] = useState<any[]>([]);
  const [tutorRequests, setTutorRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, convRes] = await Promise.all([
          fetch(`/api/students/${id}`),
          fetch(`/api/conversations`)
        ]);

        if (studentRes.ok) {
          const data = await studentRes.json();
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

          // Fetch tutor requests for this email
          try {
            const tutorReqRes = await fetch(`/api/tutor-requests?email=${encodeURIComponent(data.email)}`);
            if (tutorReqRes.ok) {
              const tutorReqData = await tutorReqRes.json();
              setTutorRequests(tutorReqData.requests || []);
            }
          } catch (e) {
            console.error("Error fetching tutor requests:", e);
          }
        }

        if (convRes.ok) {
          const convData = await convRes.json();
          setConversations(convData.conversations);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, lastUpdate]);

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

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Banner size must be less than 5MB");
      return;
    }

    setIsUploadingBanner(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await updateBannerImage(id, base64);
        if (res.success) {
          setStudentData((prev: any) => ({ ...prev, bannerImage: base64 }));
          toast.success("Banner updated!");
        } else {
          toast.error(typeof res.error === 'string' ? res.error : "Failed to update banner");
        }
      } catch (error) {
        toast.error("Error uploading banner");
      } finally {
        setIsUploadingBanner(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBanner = async () => {
    try {
      const res = await removeBannerImage(id);
      if (res.success) {
        setStudentData((prev: any) => ({ ...prev, bannerImage: undefined }));
        toast.success("Banner removed!");
      } else {
        toast.error(typeof res.error === 'string' ? res.error : "Failed to remove banner");
      }
    } catch (error) {
      toast.error("Error removing banner");
    }
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
    <div className="bg-[#F8F9FA] min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      <Toaster />
      <ChatInitializer initialConversations={conversations} />
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* WhatsApp Onboarding Banner and Modal */}
        <WhatsAppOnboarding 
          userId={id as string} 
          hasJoinedInitial={!!studentData.hasJoinedWhatsAppCommunity} 
          onSuccess={() => {
            setStudentData((prev: any) => ({ ...prev, hasJoinedWhatsAppCommunity: true }));
          }}
        />

        {/* Tutor Request Notifications */}
        {tutorRequests.map((request) => (
          <div key={request.id} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                request.status === "Tutor Found" ? "bg-emerald-100 text-emerald-600" :
                request.status === "Closed" ? "bg-gray-100 text-gray-600" :
                "bg-amber-100 text-amber-600"
              }`}>
                {request.status === "Tutor Found" ? <CheckCircle2 size={24} /> : <Search size={24} />}
              </div>
              <div className="flex-grow">
                <h3 className="text-base font-black text-dark-navy uppercase tracking-tight">
                  {request.status === "Tutor Found" 
                    ? "🎉 We found a tutor for your request!"
                    : request.status === "Closed"
                    ? "Your tutor request has been closed"
                    : "Your tutor request is being processed"}
                </h3>
                <p className="text-sm text-steel-blue mt-1">
                  Request for <span className="font-bold text-coral">{request.subject}</span> • 
                  Submitted on {new Date(request.createdAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                    request.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    request.status === "Reviewing" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    request.status === "Tutor Found" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    request.status === "Contacted" ? "bg-purple-50 text-purple-700 border-purple-200" :
                    request.status === "Connected" ? "bg-green-50 text-green-700 border-green-200" :
                    "bg-gray-50 text-gray-700 border-gray-200"
                  }`}>
                    Status: {request.status}
                  </span>
                  {request.status !== "Closed" && request.status !== "Connected" && (
                    <span className="text-[10px] font-bold text-steel-blue uppercase tracking-widest">
                      Response time: &lt; 24 hours
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {request.status === "Tutor Found" && (
              <div className="flex items-center gap-3 pt-2">
                <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-lg">
                  View Tutor <ArrowRight size={14} />
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#1e293b] transition-all">
                  Connect Now
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Trial Status Banner */}
        <TrialBanner userRole="student" myId={id} />

        {/* Two-Way Connection Requests & Dashboard Notification Banner */}
        <ConnectionRequestsManager currentUserId={id as string} currentUserRole="student" />

        {/* Block Reason Banner */}
        {studentData.status === "blocked" && (
          <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 flex-shrink-0">
                <ShieldAlert size={18} />
              </div>
              <div>
                <h3 className="font-black text-rose-800 uppercase tracking-tight">Account Blocked</h3>
                {studentData.blockReason && (
                  <p className="text-sm text-rose-700 mt-2 leading-relaxed">
                    Reason: {studentData.blockReason}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Banner Area */}
          <div className="relative h-44 bg-gradient-to-r from-purple-50 to-blue-50">
            {studentData.bannerImage ? (
              <Image src={studentData.bannerImage} alt="Banner" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-300 font-bold uppercase tracking-widest">Add a banner</span>
              </div>
            )}
            {isEditing && (
              <div className="absolute bottom-3 right-3 flex gap-2">
                <label className="flex items-center gap-2 px-3 py-2 bg-white text-dark-navy rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-all shadow-lg border border-gray-100">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleBannerChange}
                    disabled={isUploadingBanner}
                  />
                  {isUploadingBanner ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Upload size={14} />
                  )}
                  {isUploadingBanner ? "Uploading..." : "Change Banner"}
                </label>
                {studentData.bannerImage && (
                  <button 
                    onClick={handleRemoveBanner}
                    className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-100 transition-all shadow-lg border border-rose-100"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Profile Header */}
          <div className="px-6 md:px-8 pb-7 md:pb-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 relative">
              <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-xl">
                    <div className="w-full h-full rounded-xl bg-white overflow-hidden relative">
                      {studentData.profileImage ? (
                        <Image src={studentData.profileImage} alt={studentData.name} width={96} height={96} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-coral bg-white text-3xl font-black">
                          {studentData.name.charAt(0)}
                        </div>
                      )}

                      <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageChange}
                          disabled={isUploading}
                        />
                        {isUploading ? (
                          <Loader2 className="text-white animate-spin" size={20} />
                        ) : (
                          <Pencil className="text-white" size={20} />
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-dark-navy text-white p-1.5 rounded-xl border-4 border-white shadow-lg z-20 pointer-events-none">
                    <Trophy size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  {isEditing ? (
                    <input 
                      className="text-2xl font-black text-dark-navy tracking-tight uppercase w-full bg-transparent focus:outline-none border-b-2 border-coral/30 focus:border-coral" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    />
                  ) : (
                    <h1 className="text-2xl font-black text-dark-navy tracking-tight uppercase">{studentData.name}</h1>
                  )}
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <span className="flex items-center gap-2 text-[10px] font-black text-steel-blue uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      <GraduationCap size={12} className="text-coral" /> {studentData.whichClass}
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-black text-steel-blue uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      <MapPin size={12} className="text-coral" /> {studentData.location}
                    </span>
                    <StatusBadge status={studentData.status} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="flex-1 md:flex-none px-5 py-2.5 bg-gray-50 text-dark-navy font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all border border-dark-navy/5">
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none px-5 py-2.5 bg-dark-navy text-white font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-dark-navy/90 transition-all shadow-lg shadow-dark-navy/20 disabled:opacity-50">
                      {isSaving ? "Saving..." : "Save Profile"}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="w-full md:w-auto px-5 py-2.5 bg-dark-navy text-white font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-dark-navy/90 transition-all shadow-lg shadow-dark-navy/20 flex items-center justify-center gap-2">
                    <Edit2 size={14} /> Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center group hover:border-coral/20 transition-all">
            <div className="w-10 h-10 bg-coral/10 text-coral rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">Hours Learned</p>
            <p className="text-xl font-black text-dark-navy">{studentData.stats?.hoursLearned ?? 0}h</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center group hover:border-coral/20 transition-all">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <BookOpen size={20} />
            </div>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">Active Courses</p>
            <p className="text-xl font-black text-dark-navy">{studentData.stats?.activeCourses ?? 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center group hover:border-coral/20 transition-all">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Zap size={20} className="fill-current" />
            </div>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">XP Points</p>
            <p className="text-xl font-black text-dark-navy">{studentData.stats?.xpPoints ?? 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center group hover:border-coral/20 transition-all">
            <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <TrendingUp size={20} />
            </div>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">Streak</p>
            <p className="text-xl font-black text-dark-navy">{studentData.stats?.streak ?? 0} Days</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Interview Section */}
            <InterviewSection data={studentData} />

            {/* Study Sessions Section */}
            <SessionSection userRole="student" />

            {/* Payment Instructions Card */}
            <PaymentInstructionsCard userData={{ name: studentData?.name, email: studentData?.email }} />

            {/* Payment Submission Section */}
            <PaymentSubmissionSection userId={id} />

            {/* Achievements Section */}
            <AchievementsSection userId={id} />

            {/* Academic Info */}
            <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 space-y-7">
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <h2 className="text-lg font-black text-dark-navy uppercase tracking-tight">Academic Profile</h2>
                <BookCheck className="text-coral" size={20} />
              </div>

              <div className="grid md:grid-cols-2 gap-7">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Current Grade / Level</label>
                  {isEditing ? (
                    <input className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-coral/10 rounded-xl focus:outline-none font-bold text-dark-navy transition-all" value={formData.whichClass} onChange={(e) => setFormData({...formData, whichClass: e.target.value})} />
                  ) : (
                    <p className="text-dark-navy font-bold text-base bg-gray-50 p-4 rounded-xl border border-gray-100">{studentData.whichClass}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Learning Goals</label>
                  {isEditing ? (
                    <input className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-coral/10 rounded-xl focus:outline-none font-bold text-dark-navy transition-all" value={formData.learningGoals} onChange={(e) => setFormData({...formData, learningGoals: e.target.value})} />
                  ) : (
                    <p className="text-dark-navy font-bold text-base bg-gray-50 p-4 rounded-xl border border-gray-100">{studentData.learningGoals}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Subjects of Interest</label>
                {isEditing ? (
                  <input className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-coral/10 rounded-xl focus:outline-none font-bold text-dark-navy transition-all" value={formData.subjects} onChange={(e) => setFormData({...formData, subjects: e.target.value})} />
                ) : (
                  <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    {studentData.subjects.map((s: string) => (
                      <span key={s} className="px-4 py-2 bg-coral text-white text-[10px] font-black uppercase tracking-widest rounded-xl">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Public Profile</label>
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-dark-navy font-bold text-base">Show my profile publicly</p>
                    <p className="text-xs text-steel-blue mt-1">Tutors will be able to find and view your profile</p>
                  </div>
                  <button
                    onClick={async () => {
                      setIsTogglingPublicProfile(true);
                      const newVal = !studentData.isPublicProfile;
                      try {
                        const res = await fetch('/api/me', {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ isPublicProfile: newVal })
                        });
                        if (res.ok) {
                          setStudentData((prev: any) => ({ ...prev, isPublicProfile: newVal }));
                          toast.success("Profile visibility updated!");
                        } else {
                          toast.error("Failed to update visibility");
                        }
                      } catch (e) {
                        console.error(e);
                        toast.error("Failed to update visibility");
                      } finally {
                        setIsTogglingPublicProfile(false);
                      }
                    }}
                    disabled={isTogglingPublicProfile}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                      studentData.isPublicProfile ? 'bg-coral' : 'bg-gray-300'
                    }`}
                  >
                    {isTogglingPublicProfile ? (
                      <div className="w-6 h-6 m-1 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform ${
                          studentData.isPublicProfile ? 'translate-x-9' : 'translate-x-1'
                        }`}
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* WhatsApp Card */}
            <WhatsAppCard userData={{ name: studentData?.name, email: studentData?.email }} />
            
            {/* Connections Section */}
            <ConnectionList userRole="student" myId={id} />
          </div>

        </div>
      </div>
    </div>
  );
}

export default function StudentPrivateDashboard() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <RealtimeProvider currentUserId={id as string}>
      <StudentDashboardContent />
    </RealtimeProvider>
  );
}
