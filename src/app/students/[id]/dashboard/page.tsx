"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  User, Mail, MapPin, Clock, GraduationCap, 
  BookOpen, Settings, Save, Edit2, 
  X, Target, History, Award, BookCheck
} from "lucide-react";
import { updateStudentProfile } from "@/app/(routes)/dashboard/actions";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
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
            gradeLevel: data.whichClass,
            learningGoals: data.learningGoals,
            subjects: data.subjects.join(", "),
            interests: data.subjects.join(", "), // Reusing subjects as interests
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
      // Refresh data
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
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dark-navy"></div>
    </div>
  );

  if (!studentData) return <div>Student not found</div>;

  return (
    <div className="bg-off-white min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl border border-dark-navy/10 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="relative">
              {studentData.profileImage ? (
                <Image src={studentData.profileImage} alt={studentData.name} width={80} height={80} className="w-20 h-20 rounded-2xl object-cover border-2 border-dark-navy/10" />
              ) : (
                <div className="w-20 h-20 bg-coral rounded-2xl flex items-center justify-center text-white text-3xl font-bold uppercase">
                  {studentData.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-dark-navy uppercase tracking-tight">{studentData.name}</h1>
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
                className="w-full md:w-auto px-6 py-3 bg-dark-navy text-white font-bold rounded-xl hover:bg-dark-navy/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-dark-navy/20"
              >
                <Edit2 size={18} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Personal & Learning Info */}
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
                    <p className="text-dark-navy font-bold p-3 bg-off-white/50 rounded-xl">{studentData.name}</p>
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
                    <p className="text-dark-navy font-bold p-3 bg-off-white/50 rounded-xl">{studentData.email}</p>
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
                    <p className="text-dark-navy font-bold p-3 bg-off-white/50 rounded-xl">{studentData.location}</p>
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
                <BookCheck className="text-coral" size={20} /> Academic Details
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Current Grade/Level</label>
                  {isEditing ? (
                    <input 
                      className="w-full p-3 bg-off-white border border-dark-navy/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-navy/20"
                      value={formData.gradeLevel}
                      onChange={(e) => setFormData({...formData, gradeLevel: e.target.value})}
                    />
                  ) : (
                    <p className="text-dark-navy font-bold p-3 bg-off-white/50 rounded-xl">{studentData.whichClass}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Preferred Subjects (Comma separated)</label>
                  {isEditing ? (
                    <input 
                      className="w-full p-3 bg-off-white border border-dark-navy/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-navy/20"
                      value={formData.subjects}
                      onChange={(e) => setFormData({...formData, subjects: e.target.value})}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2 p-3 bg-off-white/50 rounded-xl">
                      {studentData.subjects.map((s: string) => (
                        <span key={s} className="px-3 py-1 bg-coral text-white text-[10px] font-black uppercase rounded-lg">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Learning Goals</label>
                  {isEditing ? (
                    <textarea 
                      rows={4}
                      className="w-full p-3 bg-off-white border border-dark-navy/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-navy/20"
                      value={formData.learningGoals}
                      onChange={(e) => setFormData({...formData, learningGoals: e.target.value})}
                    />
                  ) : (
                    <p className="text-dark-navy font-medium p-4 bg-off-white/50 rounded-xl italic leading-relaxed">
                      "{studentData.learningGoals}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stats & Progress */}
          <div className="space-y-8">
            <div className="bg-coral p-8 rounded-3xl text-white shadow-xl space-y-6">
              <h2 className="text-lg font-black uppercase tracking-tight border-b border-white/10 pb-4 flex items-center gap-2">
                <Target className="text-dark-navy" size={20} /> Learning Progress
              </h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Total Hours</p>
                    <p className="text-3xl font-black">{studentData.stats.hoursLearned}h</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">Courses</p>
                    <p className="text-xl font-bold">{studentData.stats.activeCourses}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">Sessions</p>
                    <p className="text-xl font-bold">{studentData.stats.completedSessions}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-dark-navy/10 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-dark-navy uppercase tracking-tight border-b pb-4 flex items-center gap-2">
                <History className="text-coral" size={20} /> Recent Activity
              </h2>
              <div className="space-y-4">
                {studentData.history && studentData.history.length > 0 ? (
                  studentData.history.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-off-white rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-dark-navy/5">
                        <Award size={18} className="text-coral" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-xs font-black text-dark-navy uppercase truncate">{item.subject}</p>
                        <p className="text-[9px] font-bold text-steel-blue uppercase truncate">{item.tutor}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-steel-blue italic text-center py-4">No recent activity.</p>
                )}
                <button className="w-full py-3 text-[10px] font-black text-steel-blue uppercase tracking-widest hover:text-dark-navy transition-colors">
                  View Full History
                </button>
              </div>
            </div>

            <div className="bg-dark-navy p-8 rounded-3xl text-white shadow-xl">
              <h2 className="text-sm font-black uppercase tracking-widest mb-4">Billing & Credits</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Available Credits</span>
                  <span className="text-xl font-bold">$0.00</span>
                </div>
                <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">
                  Add Learning Credits
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
