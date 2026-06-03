"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  MapPin, GraduationCap, 
  DollarSign, Edit2, 
  ShieldCheck, Briefcase, 
  Calendar, Star, Users, Clock as ClockIcon, Pencil, Loader2
} from "lucide-react";
import { updateTutorProfile, updateProfileImage } from "@/app/(routes)/dashboard/actions";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { InterviewSection } from "@/components/dashboard/InterviewSection";
import { SessionSection } from "@/components/dashboard/SessionSection";
import { ConnectionList } from "@/components/dashboard/ConnectionList";
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";

export default function TutorPrivateDashboard() {
  const { id } = useParams<{ id: string }>();
  const [tutorData, setTutorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/tutors/${id}`);
        if (res.ok) {
          const data = await res.json();
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
            payoutDetails: data.payoutDetails || {
              method: 'JazzCash',
              accountTitle: '',
              accountNumber: '',
              bankName: '',
              iban: '',
            }
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


  const handleAvailabilityChange = (day: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      availability: prev.availability.map((a: any) => 
        a.day === day ? { ...a, time: value } : a
      )
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
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Trial Status Banner */}
        <TrialBanner userRole="tutor" myId={id} />

        {/* Profile Header */}
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-dark-navy/5 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-coral/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left relative z-10">
            <div className="relative group">
              <div className="w-28 h-28 rounded-3xl bg-dark-navy p-1 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full rounded-[1.4rem] bg-white overflow-hidden -rotate-3 group-hover:rotate-0 transition-transform duration-500 relative">
                  {tutorData.profileImage ? (
                    <Image src={tutorData.profileImage} alt={tutorData.name} width={112} height={112} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white bg-dark-navy text-4xl font-black">
                      {tutorData.name.charAt(0)}
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
              {tutorData.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl border-4 border-white shadow-lg z-20 pointer-events-none">
                  <ShieldCheck size={20} />
                </div>
              )}
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-black text-dark-navy tracking-tight uppercase">{tutorData.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="flex items-center gap-2 text-[10px] font-black text-steel-blue uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <Briefcase size={14} className="text-coral" /> {tutorData.experienceYears} Years Exp
                </span>
                <span className="flex items-center gap-2 text-[10px] font-black text-steel-blue uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <MapPin size={14} className="text-coral" /> {tutorData.location}
                </span>
                <StatusBadge status={tutorData.status} />
              </div>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto relative z-10">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="flex-1 md:flex-none px-8 py-4 bg-gray-50 text-dark-navy font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all border border-dark-navy/5">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none px-8 py-4 bg-coral text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-coral/90 transition-all shadow-xl shadow-coral/20 disabled:opacity-50">
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="w-full md:w-auto px-8 py-4 bg-coral text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-coral/90 transition-all shadow-xl shadow-coral/20 flex items-center justify-center gap-3">
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-dark-navy/5 text-center group hover:border-coral/20 transition-all">
            <div className="w-12 h-12 bg-coral/10 text-coral rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">Students</p>
            <p className="text-2xl font-black text-dark-navy">{tutorData.stats.totalStudents}</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-dark-navy/5 text-center group hover:border-coral/20 transition-all">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <ClockIcon size={24} />
            </div>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">Hours</p>
            <p className="text-2xl font-black text-dark-navy">{tutorData.stats.completedSessions * 1.5}h</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-dark-navy/5 text-center group hover:border-coral/20 transition-all">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Star size={24} className="fill-current" />
            </div>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">Rating</p>
            <p className="text-2xl font-black text-dark-navy">{tutorData.stats.rating}</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-dark-navy/5 text-center group hover:border-coral/20 transition-all">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <DollarSign size={24} />
            </div>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">Rate</p>
            <p className="text-2xl font-black text-dark-navy">${tutorData.hourlyRate}/h</p>
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
                    {tutorData.subjects.map((s: string) => (
                      <span key={s} className="px-5 py-2 bg-dark-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl">{s}</span>
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
            </div>
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
                        {a.time.map((t: string) => (
                          <span key={t} className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg uppercase">{t}</span>
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
