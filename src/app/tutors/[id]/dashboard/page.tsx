"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  User, Mail, MapPin, Clock, GraduationCap, 
  DollarSign, BookOpen, Settings, Save, Edit2, 
  X, ShieldCheck, ShieldAlert, BarChart3, TrendingUp
} from "lucide-react";
import { updateTutorProfile } from "@/app/(routes)/dashboard/actions";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import Image from "next/image";

export default function TutorPrivateDashboard() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tutorData, setTutorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/tutors/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTutorData(data);
          setFormData({
            name: data.name,
            email: data.email,
            country: data.location,
            timezone: data.timezone || "GMT+0",
            subjects: data.subjects.join(", "),
            education: data.education,
            experienceYears: data.experienceYears,
            hourlyRate: data.hourlyRate,
            bio: data.bio,
            skills: data.subjects.join(", "), // Reusing subjects as skills for now
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
      await updateTutorProfile(id, formData);
      setIsEditing(false);
      // Refresh data
      const res = await fetch(`/api/tutors/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTutorData(data);
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
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dark-navy"></div>
    </div>
  );

  if (!tutorData) return <div>Tutor not found</div>;

  return (
    <div className="bg-off-white min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl border border-dark-navy/10 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="relative">
              {tutorData.profileImage ? (
                <Image src={tutorData.profileImage} alt={tutorData.name} width={80} height={80} className="w-20 h-20 rounded-2xl object-cover border-2 border-dark-navy/10" />
              ) : (
                <div className="w-20 h-20 bg-dark-navy rounded-2xl flex items-center justify-center text-white text-3xl font-bold uppercase">
                  {tutorData.name.charAt(0)}
                </div>
              )}
              {tutorData.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                  <ShieldCheck size={16} />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-dark-navy uppercase tracking-tight">{tutorData.name}</h1>
              <p className="text-sm font-bold text-steel-blue uppercase tracking-widest flex items-center gap-2">
                <Settings size={14} /> Private Dashboard
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 md:flex-none px-6 py-3 border-2 border-dark-navy/10 text-dark-navy font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <X size={18} /> Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 md:flex-none px-6 py-3 bg-dark-navy text-white font-bold rounded-xl hover:bg-dark-navy/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : <><Save size={18} /> Save Changes</>}
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full md:w-auto px-6 py-3 bg-coral text-white font-bold rounded-xl hover:bg-coral/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-coral/20"
              >
                <Edit2 size={18} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Personal & Sensitive Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-dark-navy/10 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-dark-navy uppercase tracking-tight border-b pb-4 flex items-center gap-2">
                <User className="text-coral" size={20} /> Personal Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Full Name</label>
                  {isEditing ? (
                    <input 
                      className="w-full p-3 bg-off-white border border-dark-navy/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-navy/20"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  ) : (
                    <p className="text-dark-navy font-bold p-3 bg-off-white/50 rounded-xl">{tutorData.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Email Address (Private)</label>
                  {isEditing ? (
                    <input 
                      className="w-full p-3 bg-off-white border border-dark-navy/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-navy/20"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  ) : (
                    <p className="text-dark-navy font-bold p-3 bg-off-white/50 rounded-xl">{tutorData.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Country</label>
                  {isEditing ? (
                    <input 
                      className="w-full p-3 bg-off-white border border-dark-navy/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-navy/20"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                    />
                  ) : (
                    <p className="text-dark-navy font-bold p-3 bg-off-white/50 rounded-xl">{tutorData.location}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Timezone</label>
                  {isEditing ? (
                    <input 
                      className="w-full p-3 bg-off-white border border-dark-navy/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-navy/20"
                      value={formData.timezone}
                      onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                    />
                  ) : (
                    <p className="text-dark-navy font-bold p-3 bg-off-white/50 rounded-xl">{formData.timezone}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-dark-navy/10 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-dark-navy uppercase tracking-tight border-b pb-4 flex items-center gap-2">
                <GraduationCap className="text-coral" size={20} /> Professional Details
              </h2>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Education</label>
                    {isEditing ? (
                      <input 
                        className="w-full p-3 bg-off-white border border-dark-navy/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-navy/20"
                        value={formData.education}
                        onChange={(e) => setFormData({...formData, education: e.target.value})}
                      />
                    ) : (
                      <p className="text-dark-navy font-bold p-3 bg-off-white/50 rounded-xl">{tutorData.education}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Experience (Years)</label>
                    {isEditing ? (
                      <input 
                        type="number"
                        className="w-full p-3 bg-off-white border border-dark-navy/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-navy/20"
                        value={formData.experienceYears}
                        onChange={(e) => setFormData({...formData, experienceYears: e.target.value})}
                      />
                    ) : (
                      <p className="text-dark-navy font-bold p-3 bg-off-white/50 rounded-xl">{tutorData.experienceYears} Years</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Expertise Subjects (Comma separated)</label>
                  {isEditing ? (
                    <input 
                      className="w-full p-3 bg-off-white border border-dark-navy/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-navy/20"
                      value={formData.subjects}
                      onChange={(e) => setFormData({...formData, subjects: e.target.value})}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2 p-3 bg-off-white/50 rounded-xl">
                      {tutorData.subjects.map((s: string) => (
                        <span key={s} className="px-3 py-1 bg-dark-navy text-white text-[10px] font-black uppercase rounded-lg">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Short Bio</label>
                  {isEditing ? (
                    <textarea 
                      rows={4}
                      className="w-full p-3 bg-off-white border border-dark-navy/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-navy/20"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    />
                  ) : (
                    <p className="text-dark-navy font-medium p-4 bg-off-white/50 rounded-xl italic leading-relaxed">
                      "{tutorData.bio}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stats & Financials */}
          <div className="space-y-8">
            <div className="bg-dark-navy p-8 rounded-3xl text-white shadow-xl space-y-6">
              <h2 className="text-lg font-black uppercase tracking-tight border-b border-white/10 pb-4 flex items-center gap-2">
                <DollarSign className="text-coral" size={20} /> Earnings & Rates
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Hourly Rate ($)</label>
                  {isEditing ? (
                    <input 
                      type="number"
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 text-white"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                    />
                  ) : (
                    <p className="text-3xl font-black text-coral">${tutorData.hourlyRate}<span className="text-sm text-white/50">/hr</span></p>
                  )}
                </div>
                <div className="pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Total Earned</span>
                    <span className="text-xl font-bold">$0.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Pending Payout</span>
                    <span className="text-xl font-bold text-coral">$0.00</span>
                  </div>
                </div>
                <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">
                  Setup Payout Method
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-dark-navy/10 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-dark-navy uppercase tracking-tight border-b pb-4 flex items-center gap-2">
                <BarChart3 className="text-coral" size={20} /> Performance Stats
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-off-white rounded-2xl border border-dark-navy/5">
                  <span className="text-[9px] font-black text-steel-blue uppercase tracking-widest block mb-1">Hours Taught</span>
                  <p className="text-2xl font-black text-dark-navy">{tutorData.stats.hoursTaught}h</p>
                </div>
                <div className="p-4 bg-off-white rounded-2xl border border-dark-navy/5">
                  <span className="text-[9px] font-black text-steel-blue uppercase tracking-widest block mb-1">Total Students</span>
                  <p className="text-2xl font-black text-dark-navy">{tutorData.stats.totalStudents}</p>
                </div>
                <div className="p-4 bg-off-white rounded-2xl border border-dark-navy/5">
                  <span className="text-[9px] font-black text-steel-blue uppercase tracking-widest block mb-1">Average Rating</span>
                  <p className="text-2xl font-black text-dark-navy">{tutorData.stats.rating}/5</p>
                </div>
                <div className="p-4 bg-off-white rounded-2xl border border-dark-navy/5">
                  <span className="text-[9px] font-black text-steel-blue uppercase tracking-widest block mb-1">Completion</span>
                  <p className="text-2xl font-black text-dark-navy">100%</p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-3xl border flex items-center gap-4 ${tutorData.isVerified ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
              {tutorData.isVerified ? <ShieldCheck className="text-green-500" size={32} /> : <ShieldAlert className="text-amber-500" size={32} />}
              <div>
                <p className="text-xs font-black uppercase tracking-tight text-dark-navy">Account Status</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${tutorData.isVerified ? 'text-green-600' : 'text-amber-600'}`}>
                  {tutorData.isVerified ? 'Verified Professional' : 'Verification Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
