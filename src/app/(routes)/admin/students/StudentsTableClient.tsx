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
  ShieldX,
  BookOpen,
  Calendar,
  Video,
  X,
  AlertCircle
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { UserStatusBadge } from "@/components/admin/UserStatusBadge";
import { normalizeUserStatus } from "@/lib/user-status";

interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: string;
  profileImage?: string;
  whichClass: string;
  subjects: string[];
  learningGoals: string;
  country: string;
  timezone: string;
  interviewDate?: string;
  interviewLink?: string;
}

export default function StudentsTableClient({ initialStudents }: { initialStudents: Student[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Scheduling State
  const [date, setDate] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [notes, setNotes] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  const filteredStudents = initialStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.subjects.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === "All Status" || student.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (userId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success(`Student status updated to ${status}`);
      router.refresh();
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  const handleSchedule = async () => {
    if (!date || !zoomLink) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsScheduling(true);
    try {
      const res = await fetch("/api/admin/schedule-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedStudent?.userId,
          scheduledAt: new Date(date).toISOString(),
          interviewLink: zoomLink,
          notes
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Failed to schedule");

      toast.success("Interview scheduled and email sent!");
      setSelectedStudent(null);
      setDate("");
      setZoomLink("");
      setNotes("");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Error scheduling interview");
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      <SearchBar
        placeholder="Search students by name, email or grade..."
        allStatuses={["All Status", "applied", "interview_scheduled", "verified", "blocked"]}
        onSearch={(data) => {
          setSearchTerm(data.search);
          setSelectedStatus(data.status);
        }}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
            <div className="p-6 flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <div className="w-20 h-20 rounded-2xl bg-dark-navy flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-dark-navy/10 mb-4 overflow-hidden">
                  {student.profileImage ? (
                    <Image src={student.profileImage} alt={student.name} width={80} height={80} className="w-full h-full object-cover" />
                  ) : (
                    student.name.charAt(0)
                  )}
                </div>
                <UserStatusBadge status={student.status} />
              </div>

              <div className="flex-grow space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase group-hover:text-coral transition-colors">{student.name}</h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mt-1">
                      <Mail size={14} className="text-gray-300" /> {student.email}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Current Grade</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <GraduationCap size={14} className="text-coral" /> {student.whichClass}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <MapPin size={14} className="text-coral" /> {student.country}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Learning Goals</p>
                  <p className="text-xs text-steel-blue font-medium line-clamp-2 italic">"{student.learningGoals}"</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-wrap gap-2">
              {normalizeUserStatus(student.status) === "applied" && (
                <button
                  onClick={() => setSelectedStudent(student)}
                  className="flex-grow py-3 bg-coral text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-dark-navy transition-all"
                >
                  Schedule Interview
                </button>
              )}

              {normalizeUserStatus(student.status) === "interview_scheduled" && (
                <>
                  <button
                    onClick={() => updateStatus(student.userId, "verified")}
                    className="flex-grow py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all"
                  >
                    Verify Student
                  </button>
                  <button
                    onClick={() => updateStatus(student.userId, "blocked")}
                    className="flex-grow py-3 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-600 transition-all"
                  >
                    Block
                  </button>
                </>
              )}

              {normalizeUserStatus(student.status) === "verified" && (
                <button
                  onClick={() => updateStatus(student.userId, "blocked")}
                  className="flex-grow py-3 bg-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                >
                  Block Student
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Scheduling Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-dark-navy/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg space-y-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">Schedule Interview</h2>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">For {selectedStudent.name}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Calendar size={12} /> Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-coral/20 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all"
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Video size={12} /> Zoom Meeting Link
                </label>
                <input
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-coral/20 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all"
                  onChange={(e) => setZoomLink(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest ml-1 flex items-center gap-2">
                  <AlertCircle size={12} /> Interview Notes (Optional)
                </label>
                <textarea
                  placeholder="Mention topics to discuss..."
                  rows={3}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-coral/20 rounded-2xl focus:outline-none font-bold text-dark-navy transition-all resize-none"
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={isScheduling}
              onClick={handleSchedule}
              className="w-full py-5 bg-dark-navy text-white text-xs font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-coral transition-all shadow-xl shadow-dark-navy/20 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isScheduling ? "Sending Email & Saving..." : "Confirm & Send Email"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
