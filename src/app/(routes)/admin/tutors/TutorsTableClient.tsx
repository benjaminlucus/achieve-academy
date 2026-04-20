"use client";

import React, { useState } from "react";
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
import { SearchBar } from "@/components/SearchBar";
import { useRouter } from "next/navigation";

interface Tutor {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  country: string;
  timezone: string;
  experience: string;
  education: string;
  status: string;
}

export default function TutorsTableClient({ initialTutors }: { initialTutors: Tutor[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [date, setDate] = useState("");
  const [zoomLink, setZoomLink] = useState("");

  const handleSchedule = async () => {
    await fetch("/api/interview/schedule", {
      method: "POST",
      body: JSON.stringify({
        userId: selectedTutor?.id,
        scheduledAt: date,
        zoomLink,
      }),
    });

    setSelectedTutor(null);
    router.refresh();
  };

  const router = useRouter();

  const filteredTutors = initialTutors.filter((tutor) => {
    const matchesSearch =
      tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.subjects.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === "All Status" || tutor.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });


  const updateStatus = async (userId: string, status: string) => {
    await fetch(`/api/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <SearchBar
        placeholder="Search tutors by name, email or subject..."
        allStatuses={["All Status", "Pending", "Approved", "Rejected"]}
        onSearch={(data) => {
          setSearchTerm(data.search);
          setSelectedStatus(data.status);
        }}
      />

      {/* Tutor Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredTutors.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-sm font-medium text-gray-500">No tutors found matching your search.</p>
          </div>
        )}
        {filteredTutors.map((tutor) => (
          <div key={tutor.id} className="bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
            <div className="p-6 flex flex-col md:flex-row gap-6">
              {/* Profile Side */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-20 h-20 rounded-2xl bg-dark-navy flex items-center justify-center text-white font-black text-3xl shadow-[4px_4px_0px_0px_rgba(255,111,97,1)] mb-4">
                  {tutor.name.charAt(0)}
                </div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border mb-4 ${tutor.status === 'Pending'
                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                  : tutor.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${tutor.status === 'Pending' ? 'bg-amber-500' : tutor.status === 'Approved' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`} />
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
            <div className="p-4 bg-gray-50/50 border-t border-gray-100 grid grid-cols-2 gap-3">
              {tutor.status === "applied" && (
                <button onClick={() => updateStatus(tutor.id, "reviewing")}>
                  Start Review
                </button>
              )}
              {tutor.status === "reviewing" && (
                <button onClick={() => setSelectedTutor(tutor)}>
                  Schedule Interview
                </button>
              )}

              {tutor.status === "interview_scheduled" && (
                <button onClick={() => updateStatus(tutor.id, "interviewed")}>
                  Mark Interview Done
                </button>
              )}

              {tutor.status === "interviewed" && (
                <>
                  <button className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-rose-500 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95 group" onClick={() => updateStatus(tutor.id, "approved")}>
                    Approve
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 bg-dark-navy text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all shadow-sm active:scale-95 group" onClick={() => updateStatus(tutor.id, "rejected")}>
                    Reject
                  </button>
                </>
              )}
            </div>
            {selectedTutor && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">

                  <h2 className="text-lg font-bold">Schedule Interview</h2>

                  <input
                    type="datetime-local"
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border p-3 rounded"
                  />

                  <input
                    type="text"
                    placeholder="Zoom Link"
                    onChange={(e) => setZoomLink(e.target.value)}
                    className="w-full border p-3 rounded"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleSchedule}
                      className="flex-1 bg-dark-navy text-white py-2 rounded"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => setSelectedTutor(null)}
                      className="flex-1 border py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
