"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  MapPin, GraduationCap, 
  DollarSign, Edit2, 
  ShieldCheck, Briefcase, 
  Calendar, Star, Users, Clock as ClockIcon, Pencil, Loader2,
  Wallet, Building2, Smartphone, Video, X, Upload, Trash2, ShieldAlert
} from "lucide-react";
import { updateTutorProfile, updateProfileImage, updateBannerImage, removeBannerImage } from "@/app/(routes)/dashboard/actions";
import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { InterviewSection } from "@/components/dashboard/InterviewSection";
import { SessionSection } from "@/components/dashboard/SessionSection";
import { ConnectionList } from "@/components/dashboard/ConnectionList";
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import { WhatsAppCard } from "@/components/dashboard/WhatsAppCard";
import { TutorPaymentAssistanceCard } from "@/components/dashboard/TutorPaymentAssistanceCard";
import { WhatsAppOnboarding } from "@/components/dashboard/WhatsAppOnboarding";
import ChatInitializer from "@/components/chat/ChatInitializer";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";
import { RealtimeProvider, useRealtime } from "@/lib/realtime-context";

function TutorDashboardContent() {
  const { id } = useParams<{ id: string }>();
  const { lastUpdate } = useRealtime();
  const [tutorData, setTutorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isTogglingPublicProfile, setIsTogglingPublicProfile] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [conversations, setConversations] = useState<any[]>([]);
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tutorRes, convRes] = await Promise.all([
          fetch(`/api/tutors/${id}`),
          fetch(`/api/conversations`)
        ]);
        
        if (tutorRes.ok) {
          const data = await tutorRes.json();
          setTutorData(data);
          
          const initialAvailability = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
            const existing = data.availability?.find((a: any) => a.day === day);
            return {
              day,
              time: existing ? existing.time.join(", ") : ""
            };
          });

          setFormData({
            name: data.name,
            email: data.email,
            country: data.location,
            timezone: data.timezone || "GMT+0",
            subjects: data.subjects.join(", "),
            education: data.education,
            experienceYears: data.experienceYears,
            hourlyRate: data.hourlyRate,
            monthlyRate: data.monthlyRate || 0,
            bio: data.bio,
            skills: data.skills?.join(", ") || "",
            languages: data.languages?.join(", ") || "",
            availability: initialAvailability,
            payoutDetails: (data.payoutDetails && Object.keys(data.payoutDetails).length > 0) ? data.payoutDetails : {
              method: 'JazzCash',
              accountTitle: '',
              accountNumber: '',
              bankName: '',
              iban: '',
            }
          });
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
      const formattedAvailability = formData.availability
        .filter((a: any) => a.time.trim() !== "")
        .map((a: any) => ({
          day: a.day,
          time: a.time.split(",").map((t: string) => t.trim())
        }));

      await updateTutorProfile(id, {
        ...formData,
        availability: formattedAvailability
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
      const res = await fetch(`/api/tutors/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTutorData(data);
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
          setTutorData((prev: any) => ({ ...prev, profileImage: base64 }));
          toast.success("Profile image updated!");
        } else {
          toast.error(res.error || "Failed to update image");
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
          setTutorData((prev: any) => ({ ...prev, bannerImage: base64 }));
          toast.success("Banner updated!");
        } else {
          toast.error(res.error || "Failed to update banner");
        }
      } catch (error) {
        toast.error("Error uploading banner");
      } finally {
        setIsUploadingBanner(false);
      }
    };
    reader.readAsDataURL(file);
  };
// design the achievements sesction at studnets dashbaord that they are menaingful, not just ticks and stars and dummy data. make them like add certificates, etc, badges and manage these things in the system itself where change is needed, you wouldd design the architecture
  const handleRemoveBanner = async () => {
    try {
      const res = await removeBannerImage(id);
      if (res.success) {
        setTutorData((prev: any) => ({ ...prev, bannerImage: undefined }));
        toast.success("Banner removed!");
      } else {
        toast.error(res.error || "Failed to remove banner");
      }
    } catch (error) {
      toast.error("Error removing banner");
    }
  };


  const handleAvailabilityChange = (day: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      availability: prev.availability.map((a: any) => 
        a.day === day ? { ...a, time: value } : a
      )
    }));
  };

  const handlePayoutChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      payoutDetails: {
        ...prev.payoutDetails,
        [field]: value
      }
    }));
  };

  if (isLoading) return (
    <div className="min-h-screen bg-off-white flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-dark-navy border-t-coral rounded-full animate-spin"></div>
    </div>
  );

  if (!tutorData) return (
    <div className="min-h-screen bg-off-white flex items-center justify-center font-black text-dark-navy uppercase tracking-widest">
      Tutor not found
    </div>
  );

  return (
    <div className="bg-[#F8F9FA] min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <Toaster />
      <ChatInitializer initialConversations={conversations} />
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* WhatsApp Onboarding Banner and Modal */}
        <WhatsAppOnboarding 
          userId={id as string} 
          hasJoinedInitial={!!tutorData.hasJoinedWhatsAppCommunity} 
          onSuccess={() => {
            setTutorData((prev: any) => ({ ...prev, hasJoinedWhatsAppCommunity: true }));
          }}
        />

        {/* Trial Status Banner */}
        <TrialBanner userRole="tutor" myId={id} />

        {/* WhatsApp Community & Contact Card */}
        <WhatsAppCard userData={{ name: tutorData?.name, email: tutorData?.email }} />

        {/* Block Reason Banner */}
        {tutorData.status === "blocked" && (
          <div className="bg-rose-50 border border-rose-200 p-6 rounded-[2rem]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 flex-shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="font-black text-rose-800 uppercase tracking-tight">Account Blocked</h3>
                {tutorData.blockReason && (
                  <p className="text-sm text-rose-700 mt-2 leading-relaxed">
                    Reason: {tutorData.blockReason}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LinkedIn-Style Banner + Profile */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-dark-navy/5 overflow-hidden">
          {/* Banner Area */}
          <div className="relative h-52 bg-gradient-to-r from-purple-50 to-coral/5">
            {tutorData.bannerImage ? (
              <Image src={tutorData.bannerImage} alt="Banner" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-300 font-bold uppercase tracking-widest">Add a banner</span>
              </div>
            )} 
            
            {/* Banner Controls - Only visible when editing */}
            {isEditing && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <label className="flex items-center gap-2 px-4 py-2 bg-white text-dark-navy rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors shadow-lg border border-gray-100">
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
                {tutorData.bannerImage && (
                  <button 
                    onClick={handleRemoveBanner}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-100 transition-colors shadow-lg border border-rose-100"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Profile Header */}
          <div className="px-8 md:px-10 pb-8 md:pb-10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative">
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-2xl bg-white p-1 shadow-xl">
                    <div className="w-full h-full rounded-xl bg-white overflow-hidden relative">
                      {tutorData.profileImage ? (
                        <Image src={tutorData.profileImage} alt={tutorData.name} width={112} height={112} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white bg-dark-navy text-4xl font-black">
                          {tutorData.name.charAt(0)}
                        </div>
                      )}

                      {/* Change Image Overlay */}
                      <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl">
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
                  {tutorData.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl border-4 border-white shadow-lg z-20 pointer-events-none">
                      <ShieldCheck size={18} />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {isEditing ? (
                    <input 
                      className="text-3xl font-black text-dark-navy tracking-tight uppercase w-full bg-transparent focus:outline-none border-b-2 border-coral/30 focus:border-coral" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    />
                  ) : (
                    <h1 className="text-3xl font-black text-dark-navy tracking-tight uppercase">{tutorData.name}</h1>
                  )}
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <span className="flex items-center gap-2 text-[10px] font-black text-steel-blue uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                      <Briefcase size={14} className="text-coral" /> {tutorData.experienceYears} Years Exp
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-black text-steel-blue uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                      <MapPin size={14} className="text-coral" /> {tutorData.location}
                    </span>
                    <StatusBadge status={tutorData.status} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="flex-1 md:flex-none px-6 py-3 bg-gray-50 text-dark-navy font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all border border-dark-navy/5">
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none px-6 py-3 bg-coral text-white font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-coral/90 transition-all shadow-lg shadow-coral/20 disabled:opacity-50">
                      {isSaving ? "Saving..." : "Save Profile"}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="w-full md:w-auto px-6 py-3 bg-coral text-white font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-coral/90 transition-all shadow-lg shadow-coral/20 flex items-center justify-center gap-2">
                    <Edit2 size={16} /> Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-dark-navy/5 text-center group hover:border-coral/20 transition-all">
            <div className="w-12 h-12 bg-coral/10 text-coral rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">Students</p>
            <p className="text-2xl font-black text-dark-navy">{tutorData.stats?.totalStudents ?? 0}</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-dark-navy/5 text-center group hover:border-coral/20 transition-all">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <ClockIcon size={24} />
            </div>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">Hours</p>
            <p className="text-2xl font-black text-dark-navy">{tutorData.stats?.hoursTaught ?? 0}h</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-dark-navy/5 text-center group hover:border-coral/20 transition-all">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Star size={24} className="fill-current" />
            </div>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">Rating</p>
            <p className="text-2xl font-black text-dark-navy">{tutorData.stats?.rating ?? 0}</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-dark-navy/5 text-center group hover:border-coral/20 transition-all">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <DollarSign size={24} />
            </div>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">Earnings</p>
            <p className="text-2xl font-black text-dark-navy">${tutorData.stats?.totalEarnings ?? 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-10">
            {/* Interview Section */}
            <InterviewSection data={tutorData} />

            {/* Study Sessions Section */}
            <SessionSection userRole="tutor" />

            {/* Professional Details */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-dark-navy/5 space-y-10">
              <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">Professional Profile</h2>
                <GraduationCap className="text-coral" size={24} />
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Education Background</label>
                  {isEditing ? (
                    <input className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all" value={formData.education} onChange={(e) => setFormData({...formData, education: e.target.value})} />
                  ) : (
                    <p className="text-dark-navy font-bold text-lg bg-gray-50 p-5 rounded-2xl border border-gray-100">{tutorData.education}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Years of Experience</label>
                  {isEditing ? (
                    <input type="number" className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all" value={formData.experienceYears} onChange={(e) => setFormData({...formData, experienceYears: e.target.value})} />
                  ) : (
                    <p className="text-dark-navy font-bold text-lg bg-gray-50 p-5 rounded-2xl border border-gray-100">{tutorData.experienceYears} Years</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Expertise Subjects (Comma separated)</label>
                {isEditing ? (
                  <input className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all" value={formData.subjects} onChange={(e) => setFormData({...formData, subjects: e.target.value})} />
                ) : (
                  <div className="flex flex-wrap gap-3 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    {(tutorData.subjects || []).map((s: string, i: number) => (
                      <span key={i} className="px-5 py-2 bg-dark-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Personal Bio</label>
                {isEditing ? (
                  <textarea rows={5} className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all resize-none" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
                ) : (
                  <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <p className="text-dark-navy font-medium text-lg leading-relaxed italic text-steel-blue/80">
                      "{tutorData.bio}"
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 pt-4 border-t border-gray-50">
                <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Public Profile</label>
                <div className="flex items-center justify-between bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <div>
                    <p className="text-dark-navy font-bold text-lg">Show my profile publicly</p>
                    <p className="text-xs text-steel-blue mt-1">Students will be able to find and view your profile</p>
                  </div>
                  <button
                    onClick={async () => {
                      setIsTogglingPublicProfile(true);
                      const newVal = !tutorData.isPublicProfile;
                      try {
                        const res = await fetch('/api/me', {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ isPublicProfile: newVal })
                        });
                        if (res.ok) {
                          setTutorData((prev: any) => ({...prev, isPublicProfile: newVal}));
                          toast.success("Profile visibility updated!");
                        } else {
                          toast.error("Failed to update visibility");
                        }
                      } catch (err) {
                        console.error(err);
                        toast.error("Failed to update visibility");
                      } finally {
                        setIsTogglingPublicProfile(false);
                      }
                    }}
                    disabled={isTogglingPublicProfile}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                      isTogglingPublicProfile ? 'bg-gray-400 cursor-wait' : 
                      tutorData.isPublicProfile ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    {isTogglingPublicProfile ? (
                      <div className="w-6 h-6 m-1 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform ${tutorData.isPublicProfile ? 'translate-x-9' : 'translate-x-1'}`}
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Payout Details */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-dark-navy/5 space-y-10">
              <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">Payout Information</h2>
                <Wallet className="text-coral" size={24} />
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Payout Method</label>
                  {isEditing ? (
                    <select 
                      className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all appearance-none"
                      value={formData.payoutDetails.method}
                      onChange={(e) => handlePayoutChange('method', e.target.value)}
                    >
                      <option value="JazzCash">JazzCash</option>
                      <option value="Easypaisa">Easypaisa</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-coral shadow-sm">
                        {tutorData.payoutDetails?.method === 'Bank Transfer' ? <Building2 size={20} /> : <Smartphone size={20} />}
                      </div>
                      <p className="text-dark-navy font-bold text-lg">{tutorData.payoutDetails?.method || "Not set"}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Account Title</label>
                  {isEditing ? (
                    <input 
                      className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all"
                      placeholder="Full Name on Account"
                      value={formData.payoutDetails.accountTitle}
                      onChange={(e) => handlePayoutChange('accountTitle', e.target.value)}
                    />
                  ) : (
                    <p className="text-dark-navy font-bold text-lg bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      {tutorData.payoutDetails?.accountTitle || "Not provided"}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Account Number</label>
                  {isEditing ? (
                    <input 
                      className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all"
                      placeholder="03XXXXXXXXX or Bank Acc #"
                      value={formData.payoutDetails.accountNumber}
                      onChange={(e) => handlePayoutChange('accountNumber', e.target.value)}
                    />
                  ) : (
                    <p className="text-dark-navy font-bold text-lg bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      {tutorData.payoutDetails?.accountNumber || "Not provided"}
                    </p>
                  )}
                </div>

                {((isEditing && formData.payoutDetails.method === 'Bank Transfer') || (!isEditing && tutorData.payoutDetails?.method === 'Bank Transfer')) && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Bank Name & IBAN</label>
                    {isEditing ? (
                      <div className="flex gap-4">
                        <input 
                          className="flex-1 p-5 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all"
                          placeholder="Bank Name"
                          value={formData.payoutDetails.bankName}
                          onChange={(e) => handlePayoutChange('bankName', e.target.value)}
                        />
                        <input 
                          className="flex-1 p-5 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all"
                          placeholder="IBAN"
                          value={formData.payoutDetails.iban}
                          onChange={(e) => handlePayoutChange('iban', e.target.value)}
                        />
                      </div>
                    ) : (
                      <p className="text-dark-navy font-bold text-lg bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        {tutorData.payoutDetails?.bankName} - {tutorData.payoutDetails?.iban}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tutor Payment Assistance Card */}
            <TutorPaymentAssistanceCard userData={{ name: tutorData?.name, email: tutorData?.email }} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            {/* Connections */}
            <ConnectionList userRole="tutor" myId={id} />

            {/* Availability */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-dark-navy/5 space-y-8">
              <h3 className="text-sm font-black text-dark-navy uppercase tracking-widest flex items-center gap-3">
                <Calendar size={20} className="text-coral" /> Weekly Schedule
              </h3>
              <div className="space-y-4">
                {isEditing ? (
                  formData.availability.map((a: any) => (
                    <div key={a.day} className="space-y-2">
                      <label className="text-[9px] font-black text-steel-blue uppercase tracking-widest">{a.day}</label>
                      <input 
                        className="w-full px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold focus:outline-none border border-transparent focus:border-dark-navy/10"
                        placeholder="e.g. 10:00 AM, 02:00 PM"
                        value={a.time}
                        onChange={(e) => handleAvailabilityChange(a.day, e.target.value)}
                      />
                    </div>
                  ))
                ) : (
                  tutorData.availability?.map((a: any) => (
                    <div key={a.day} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <span className="text-xs font-bold text-steel-blue uppercase">{a.day}</span>
                      <div className="flex flex-wrap justify-end gap-1">
                        {(a.time || []).map((t: string, i: number) => (
                          <span key={i} className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg uppercase">{t}</span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function TutorPrivateDashboard() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <RealtimeProvider currentUserId={id as string}>
      <TutorDashboardContent />
    </RealtimeProvider>
  );
}
