"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  User, Mail, MapPin, Clock, GraduationCap, 
  DollarSign, BookOpen, Settings, Save, Edit2, 
  X, ShieldCheck, ShieldAlert, BarChart3, TrendingUp,
  ChevronRight, Calendar, CreditCard, Star, Languages, Briefcase,
  History
} from "lucide-react";
import { updateTutorProfile } from "@/app/(routes)/dashboard/actions";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { InterviewSection } from "@/components/dashboard/InterviewSection";
import { SessionSection } from "@/components/dashboard/SessionSection";
import { ConnectionList } from "@/components/dashboard/ConnectionList";
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import Image from "next/image";

export default function TutorPrivateDashboard() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tutorData, setTutorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/tutors/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTutorData(data);
          
          const initialAvailability = daysOfWeek.map(day => {
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
      <div className="w-12 h-12 border-4 border-dark-navy border-t-coral rounded-full animate-spin"></div>
    </div>
  );

  if (!tutorData) return (
    <div className="min-h-screen bg-off-white flex items-center justify-center font-black text-dark-navy uppercase tracking-widest">
      Tutor not found
    </div>
  );

  return (
    <div className="bg-[#F8F9FA] min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Trial Status Banner */}
        <TrialBanner userRole="tutor" myId={id} />

        {/* Profile Header */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-dark-navy/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="relative group">
              {tutorData.profileImage ? (
                <Image src={tutorData.profileImage} alt={tutorData.name} width={100} height={100} className="w-24 h-24 rounded-3xl object-cover ring-4 ring-dark-navy/5 transition-all group-hover:scale-105" />
              ) : (
                <div className="w-24 h-24 bg-dark-navy rounded-3xl flex items-center justify-center text-white text-4xl font-black transition-all group-hover:scale-105">
                  {tutorData.name.charAt(0)}
                </div>
              )}
              {tutorData.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-2xl border-4 border-white shadow-lg">
                  <ShieldCheck size={18} />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-dark-navy tracking-tight uppercase">{tutorData.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <span className="flex items-center gap-2 text-[10px] font-black text-steel-blue uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-dark-navy/5">
                  <Briefcase size={14} className="text-coral" /> {tutorData.experienceYears} Years Experience
                </span>
                <span className="flex items-center gap-2 text-[10px] font-black text-steel-blue uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-dark-navy/5">
                  <MapPin size={14} className="text-coral" /> {tutorData.location}
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
                <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">Professional Details</h2>
                <GraduationCap className="text-coral" size={24} />
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Education</label>
                  {isEditing ? (
                    <input className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all" value={formData.education} onChange={(e) => setFormData({...formData, education: e.target.value})} />
                  ) : (
                    <p className="text-dark-navy font-bold text-lg">{tutorData.education}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Experience</label>
                  {isEditing ? (
                    <input type="number" className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all" value={formData.experienceYears} onChange={(e) => setFormData({...formData, experienceYears: e.target.value})} />
                  ) : (
                    <p className="text-dark-navy font-bold text-lg">{tutorData.experienceYears} Years</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Expertise Subjects</label>
                {isEditing ? (
                  <input className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all" value={formData.subjects} onChange={(e) => setFormData({...formData, subjects: e.target.value})} />
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {tutorData.subjects.map((s: string) => (
                      <span key={s} className="px-5 py-2 bg-dark-navy/5 text-dark-navy text-[10px] font-black uppercase tracking-widest rounded-xl border border-dark-navy/5">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">Bio</label>
                {isEditing ? (
                  <textarea rows={4} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all resize-none" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
                ) : (
                  <p className="text-dark-navy font-medium text-lg leading-relaxed italic text-steel-blue/80">
                    "{tutorData.bio}"
                  </p>
                )}
              </div>
            </div>

            {/* Payout Settings */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-dark-navy/5 space-y-10">
              <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">Payout Settings</h2>
                <CreditCard className="text-coral" size={24} />
              </div>

              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Payout Method</label>
                      <select 
                        className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all"
                        value={formData.payoutDetails.method}
                        onChange={(e) => setFormData({...formData, payoutDetails: {...formData.payoutDetails, method: e.target.value}})}
                      >
                        <option value="JazzCash">JazzCash</option>
                        <option value="Easypaisa">Easypaisa</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Account Title</label>
                      <input 
                        className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all"
                        value={formData.payoutDetails.accountTitle}
                        onChange={(e) => setFormData({...formData, payoutDetails: {...formData.payoutDetails, accountTitle: e.target.value}})}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
                        {formData.payoutDetails.method === 'Bank Transfer' ? 'Account Number' : 'Phone Number'}
                      </label>
                      <input 
                        className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all"
                        value={formData.payoutDetails.accountNumber}
                        onChange={(e) => setFormData({...formData, payoutDetails: {...formData.payoutDetails, accountNumber: e.target.value}})}
                      />
                    </div>
                    {formData.payoutDetails.method === 'Bank Transfer' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Bank Name</label>
                        <input 
                          className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-dark-navy/10 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all"
                          value={formData.payoutDetails.bankName}
                          onChange={(e) => setFormData({...formData, payoutDetails: {...formData.payoutDetails, bankName: e.target.value}})}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-8 rounded-3xl border border-dark-navy/5">
                  {tutorData.payoutDetails ? (
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Active Method</p>
                        <p className="text-lg font-black text-dark-navy uppercase">{tutorData.payoutDetails.method}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Account Holder</p>
                        <p className="text-lg font-black text-dark-navy">{tutorData.payoutDetails.accountTitle}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
                          {tutorData.payoutDetails.method === 'Bank Transfer' ? 'Account Number' : 'Phone Number'}
                        </p>
                        <p className="text-lg font-black text-dark-navy">{tutorData.payoutDetails.accountNumber}</p>
                      </div>
                      {tutorData.payoutDetails.method === 'Bank Transfer' && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Bank</p>
                          <p className="text-lg font-black text-dark-navy">{tutorData.payoutDetails.bankName}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-2">No Payout Method Configured</p>
                      <p className="text-[10px] text-steel-blue">Click Edit Profile to add your payment details and receive earnings.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Weekly Availability */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-dark-navy/5 space-y-10">
              <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">Weekly Availability</h2>
                <Clock className="text-coral" size={24} />
              </div>
              <div className="flex flex-row overflow-x-auto gap-4 pb-6 no-scrollbar snap-x">
                {formData.availability?.map((item: any) => (
                  <div key={item.day} className="flex-shrink-0 w-[180px] snap-center p-6 bg-gray-50/50 rounded-3xl border border-dark-navy/5 hover:border-dark-navy/10 transition-all space-y-4">
                    <span className="text-[10px] font-black text-dark-navy uppercase tracking-[0.2em]">{item.day}</span>
                    {isEditing ? (
                      <textarea
                        value={item.time}
                        onChange={(e) => handleAvailabilityChange(item.day, e.target.value)}
                        placeholder="Not available"
                        className="w-full p-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-dark-navy/20 font-bold text-[11px] text-dark-navy resize-none"
                        rows={3}
                      />
                    ) : (
                      <p className="text-[11px] font-bold text-steel-blue leading-relaxed">
                        {item.time || "Not available"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            {/* Rates & Financials */}
            <div className="bg-dark-navy p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-coral/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-coral/20 transition-all" />
              <h2 className="text-lg font-black uppercase tracking-tight border-b border-white/10 pb-6 mb-8 flex items-center justify-between">
                Financials <DollarSign className="text-coral" size={20} />
              </h2>
              <div className="space-y-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Hourly Rate</p>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black">$</span>
                      <input type="number" className="w-full bg-white/5 border border-white/10 p-2 rounded-xl focus:outline-none focus:border-coral/50 font-black text-2xl" value={formData.hourlyRate} onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})} />
                    </div>
                  ) : (
                    <p className="text-4xl font-black text-coral">${tutorData.hourlyRate}<span className="text-sm text-white/40 font-bold tracking-normal">/hr</span></p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Earned</p>
                    <p className="text-xl font-black">$0.00</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Pending</p>
                    <p className="text-xl font-black text-coral">$0.00</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all border border-white/10">
                Setup Payouts
              </button>
            </div>

            {/* Performance Stats */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-dark-navy/5 space-y-8">
              <h2 className="text-lg font-black text-dark-navy uppercase tracking-tight flex items-center justify-between">
                Stats <BarChart3 className="text-coral" size={20} />
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-2xl border border-dark-navy/5">
                  <span className="text-[9px] font-black text-steel-blue uppercase tracking-widest block mb-1">Hours</span>
                  <p className="text-xl font-black text-dark-navy">{tutorData.stats.hoursTaught}h</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-dark-navy/5">
                  <span className="text-[9px] font-black text-steel-blue uppercase tracking-widest block mb-1">Students</span>
                  <p className="text-xl font-black text-dark-navy">{tutorData.stats.totalStudents}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-dark-navy/5">
                  <span className="text-[9px] font-black text-steel-blue uppercase tracking-widest block mb-1">Rating</span>
                  <p className="text-xl font-black text-dark-navy flex items-center gap-1">{tutorData.stats.rating}<Star size={12} className="fill-coral text-coral" /></p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-dark-navy/5">
                  <span className="text-[9px] font-black text-steel-blue uppercase tracking-widest block mb-1">Sessions</span>
                  <p className="text-xl font-black text-dark-navy">{tutorData.stats.completedSessions}<span className="text-[10px] opacity-40 ml-1">/ {tutorData.stats.totalSessions}</span></p>
                </div>
              </div>
            </div>

            {/* Connections Section */}
            <ConnectionList userRole="tutor" myId={id} />

            {/* Recent Activity */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-dark-navy/5 space-y-8">
              <h2 className="text-lg font-black text-dark-navy uppercase tracking-tight flex items-center justify-between">
                Activity <History className="text-coral" size={20} />
              </h2>
              <div className="space-y-4">
                {tutorData.history && tutorData.history.length > 0 ? (
                  tutorData.history.map((item: any) => (
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
                        {item.amount && <p className="text-[10px] font-bold text-green-600">+${item.amount}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-steel-blue font-medium italic text-center py-6">No recent activity found.</p>
                )}
              </div>
            </div>

            {/* Verification Status */}
            <div className={`p-8 rounded-[2rem] border flex items-center gap-6 ${tutorData.isVerified ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tutorData.isVerified ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                {tutorData.isVerified ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-navy">Account Status</p>
                <p className={`text-xs font-black uppercase tracking-widest ${tutorData.isVerified ? 'text-green-600' : 'text-amber-600'}`}>
                  {tutorData.isVerified ? 'Verified Pro' : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
