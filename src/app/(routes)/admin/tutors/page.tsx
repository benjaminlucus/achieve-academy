import React from "react";
import { 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Clock, 
  GraduationCap, 
  Mail, 
  ChevronRight,
  ShieldCheck,
  ShieldX
} from "lucide-react";
import { getCurrentUser } from "@/lib/utils";
import { redirect } from "next/navigation";

const pendingTutors = [
  { 
    id: "1", 
    name: "Sarah Jenkins", 
    email: "sarah.j@example.com", 
    subjects: ["Physics", "Mathematics"], 
    country: "United Kingdom", 
    timezone: "GMT+0", 
    experience: "8 Years", 
    education: "Ph.D. in Theoretical Physics",
    status: "Pending" 
  },
  { 
    id: "2", 
    name: "James Wilson", 
    email: "james.w@example.com", 
    subjects: ["English Literature", "History"], 
    country: "Canada", 
    timezone: "GMT-5", 
    experience: "5 Years", 
    education: "Master's in Literature",
    status: "Pending" 
  },
  { 
    id: "3", 
    name: "Elena Rodriguez", 
    email: "elena.r@example.com", 
    subjects: ["Spanish", "World History"], 
    country: "Spain", 
    timezone: "GMT+1", 
    experience: "12 Years", 
    education: "BA in Education",
    status: "Approved" 
  },
];

export default async function TutorsApprovalPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Tutors Approval</h2>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Review and approve educator applications</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 text-amber-600 border border-amber-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            2 Pending Reviews
          </div>
        </div>
      </div>

      {/* Tutor Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {pendingTutors.map((tutor) => (
          <div key={tutor.id} className="bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
            <div className="p-6 flex flex-col md:flex-row gap-6">
              {/* Profile Side */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-20 h-20 rounded-2xl bg-dark-navy flex items-center justify-center text-white font-black text-3xl shadow-[4px_4px_0px_0px_rgba(255,111,97,1)] mb-4">
                  {tutor.name.charAt(0)}
                </div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border mb-4 ${
                  tutor.status === 'Pending' 
                    ? 'bg-amber-50 text-amber-600 border-amber-100' 
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${tutor.status === 'Pending' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <span className="text-[10px] font-black uppercase">{tutor.status}</span>
                </div>
              </div>

              {/* Info Side */}
              <div className="flex-grow space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase group-hover:text-coral transition-colors">{tutor.name}</h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mt-1">
                      <Mail size={14} className="text-gray-300" /> {tutor.email}
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-dark-navy transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Experience</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <Clock size={14} className="text-coral" /> {tutor.experience}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Education</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <GraduationCap size={14} className="text-coral" /> {tutor.education.split('in')[0]}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects.map(sub => (
                      <span key={sub} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black text-dark-navy uppercase tracking-tight">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <MapPin size={14} className="text-gray-300" /> {tutor.country}
                   </div>
                   <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Clock size={14} className="text-gray-300" /> {tutor.timezone}
                   </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            {tutor.status === 'Pending' && (
              <div className="p-4 bg-gray-50/50 border-t border-gray-100 grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-rose-500 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95 group">
                  <ShieldX size={16} className="group-hover:rotate-12 transition-transform" /> Reject
                </button>
                <button className="flex items-center justify-center gap-2 py-3 bg-dark-navy text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all shadow-sm active:scale-95 group">
                  <ShieldCheck size={16} className="group-hover:scale-110 transition-transform" /> Approve
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
