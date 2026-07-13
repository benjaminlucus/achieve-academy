"use client";

import React, { useState } from "react";
import {
  Mail,
  User,
  BookOpen,
  DollarSign,
  Clock,
  CheckCircle2,
  X,
  Edit3,
  MessageSquare,
  Users,
  Send,
  Archive,
  Loader2
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface TutorRequest {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  classLevel: string;
  budget: string;
  preferredLanguage: string[];
  description: string;
  preferredSchedule?: string;
  preferredGender?: string;
  additionalNotes?: string;
  status: string;
  assignedTutor?: any;
  internalNotes?: string[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  "Pending",
  "Reviewing",
  "Tutor Found",
  "Contacted",
  "Connected",
  "Closed"
];

export default function TutorRequestsTableClient({ initialRequests = [] }: { initialRequests?: TutorRequest[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedRequest, setSelectedRequest] = useState<TutorRequest | null>(null);
  
  // Modal State
  const [modalMode, setModalMode] = useState<"view" | "update-status" | "add-note" | "assign-tutor" | "send-email" | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tutors, setTutors] = useState<any[]>([]);
  const [selectedTutorId, setSelectedTutorId] = useState("");
  // Email modal state
  const [emailData, setEmailData] = useState({
    subject: "",
    message: ""
  });

  const filteredRequests = (initialRequests || []).filter((request) => {
    const matchesSearch =
      (request.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.subject || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "All Status" ||
      request.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Reviewing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Tutor Found":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Contacted":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Connected":
        return "bg-green-50 text-green-700 border-green-200";
      case "Closed":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !newStatus) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tutor-requests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedRequest.id, action: "update-status", status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Status updated to ${newStatus}`);
      setSelectedRequest(null);
      setModalMode(null);
      setNewStatus("");
      router.refresh();
    } catch (error) {
      toast.error("Error updating status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddInternalNote = async () => {
    if (!selectedRequest || !internalNote.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tutor-requests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedRequest.id, action: "add-note", internalNote: internalNote.trim() }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      toast.success("Internal note added successfully");
      setSelectedRequest(null);
      setModalMode(null);
      setInternalNote("");
      router.refresh();
    } catch (error) {
      toast.error("Error adding note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignTutor = async () => {
    if (!selectedRequest || !selectedTutorId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tutor-requests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedRequest.id, action: "assign-tutor", assignedTutorId: selectedTutorId }),
      });
      if (!res.ok) throw new Error("Failed to assign tutor");
      toast.success("Tutor assigned successfully");
      setSelectedRequest(null);
      setModalMode(null);
      setSelectedTutorId("");
      router.refresh();
    } catch (error) {
      toast.error("Error assigning tutor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedRequest || !emailData.subject || !emailData.message) {
      toast.error("Subject and message are required");
      return;
    }
    setIsSubmitting(true);
    try {
      // Send email using existing contact API endpoint
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Ravencrest Admin",
          email: selectedRequest.email,
          subject: emailData.subject,
          message: emailData.message,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send email");
      }

      toast.success("Email sent successfully!");
      setSelectedRequest(null);
      setModalMode(null);
      setEmailData({ subject: "", message: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error sending email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadTutors = async () => {
    try {
      const res = await fetch("/api/admin/users/list");
      if (res.ok) {
        const data = await res.json();
        setTutors(data.users?.filter((u: any) => u.role === "tutor" && u.status === "verified") || []);
      }
    } catch (error) {
      console.error("Failed to load tutors");
    }
  };

  const openModal = (request: TutorRequest, mode: any) => {
    setSelectedRequest(request);
    setModalMode(mode);
    if (mode === "assign-tutor") {
      loadTutors();
    }
    if (mode === "send-email") {
      // Pre-fill the subject
      setEmailData({ 
        subject: `Re: Your Tutor Request - ${request.subject}`, 
        message: `Hi ${request.fullName},\n\n` 
      });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <SearchBar
        placeholder="Search requests by student name, email or subject..."
        allStatuses={["All Status", ...STATUS_OPTIONS]}
        onSearch={(data) => {
          setSearchTerm(data.search);
          setSelectedStatus(data.status);
        }}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white border-2 border-[#0F172A] rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(15,23,42,0.1)] hover:shadow-[12px_12px_0px_0px_rgba(255,111,97,0.1)] transition-all overflow-hidden flex flex-col group">
            <div className="p-6 flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <div className="w-20 h-20 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-[#0F172A]/10 mb-4 overflow-hidden">
                  {(request.fullName || "S").charAt(0)}
                </div>
                <span className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>

              <div className="flex-grow space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-[#0F172A] tracking-tight uppercase">{request.fullName}</h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mt-1">
                      <Mail size={14} className="text-gray-400" /> {request.email}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <BookOpen size={12} className="text-coral" /> Subject
                    </p>
                    <div className="text-xs font-bold text-[#0F172A]">{request.subject}</div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <User size={12} className="text-coral" /> Class
                    </p>
                    <div className="text-xs font-bold text-[#0F172A]">{request.classLevel}</div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <DollarSign size={12} className="text-coral" /> Budget
                    </p>
                    <div className="text-xs font-bold text-[#0F172A]">{request.budget}</div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} className="text-coral" /> Submitted
                    </p>
                    <div className="text-xs font-bold text-[#0F172A]">{new Date(request.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {request.preferredLanguage.map((lang, i) => (
                      <span key={i} className="px-3 py-2 bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-tight rounded-xl">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-3">
              <button
                onClick={() => openModal(request, "view")}
                className="py-3 bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-coral transition-all flex items-center justify-center gap-2"
              >
                <Edit3 size={14} /> View
              </button>
              <button
                onClick={() => openModal(request, "update-status")}
                className="py-3 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-200 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={14} /> Update Status
              </button>
              <button
                onClick={() => openModal(request, "add-note")}
                className="py-3 bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-200 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={14} /> Add Note
              </button>
              <button
                onClick={() => openModal(request, "assign-tutor")}
                className="py-3 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-200 transition-all flex items-center justify-center gap-2"
              >
                <Users size={14} /> Assign Tutor
              </button>
              <button
                onClick={() => openModal(request, "send-email")}
                className="py-3 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-200 transition-all flex items-center justify-center gap-2"
              >
                <Send size={14} /> Send Email
              </button>
              <button
                onClick={() => {
                  setSelectedRequest(request);
                  setNewStatus("Closed");
                  openModal(request, "update-status");
                }}
                className="py-3 bg-gray-200 text-gray-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
              >
                <Archive size={14} /> Mark Complete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedRequest && modalMode && (
        <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md flex items-center justify-center z-[999] p-4 overflow-y-auto">
          <div className="bg-[#0F172A] border border-[#8B5CF6]/15 max-w-2xl w-full rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden my-4">
            {/* Top color strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-[#8B5CF6]" />

            <div className="flex justify-between items-start pt-2">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  {modalMode === "view" ? "Request Details" :
                   modalMode === "update-status" ? "Update Status" :
                   modalMode === "add-note" ? "Add Internal Note" :
                   modalMode === "assign-tutor" ? "Assign Tutor" :
                   "Send Email"}
                </h2>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">For {selectedRequest.fullName}</p>
              </div>
              <button 
                onClick={() => { 
                  setSelectedRequest(null); 
                  setModalMode(null); 
                  setInternalNote(""); 
                  setSelectedTutorId("");
                  setEmailData({ subject: "", message: "" });
                }} 
                className="p-2 hover:bg-slate-800 rounded-full transition-all"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {modalMode === "view" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                    <p className="text-sm font-bold text-white">{selectedRequest.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                    <p className="text-sm font-bold text-white">{selectedRequest.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subject</p>
                    <p className="text-sm font-bold text-white">{selectedRequest.subject}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Class Level</p>
                    <p className="text-sm font-bold text-white">{selectedRequest.classLevel}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Budget</p>
                    <p className="text-sm font-bold text-white">{selectedRequest.budget}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                    <p className={`text-sm font-black uppercase tracking-wider ${
                      selectedRequest.status === "Pending" ? "text-amber-500" :
                      selectedRequest.status === "Reviewing" ? "text-blue-500" :
                      selectedRequest.status === "Tutor Found" ? "text-emerald-500" :
                      selectedRequest.status === "Contacted" ? "text-purple-500" :
                      selectedRequest.status === "Connected" ? "text-green-500" :
                      "text-slate-400"
                    }`}>{selectedRequest.status}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</p>
                  <div className="bg-[#020617]/50 p-4 rounded-2xl text-sm text-slate-300 border border-slate-800">
                    {selectedRequest.description}
                  </div>
                </div>

                {selectedRequest.preferredSchedule && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Preferred Schedule</p>
                    <p className="text-sm font-bold text-white">{selectedRequest.preferredSchedule}</p>
                  </div>
                )}

                {selectedRequest.preferredGender && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Preferred Tutor Gender</p>
                    <p className="text-sm font-bold text-white">{selectedRequest.preferredGender}</p>
                  </div>
                )}

                {selectedRequest.additionalNotes && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Additional Notes</p>
                    <div className="bg-[#020617]/50 p-4 rounded-2xl text-sm text-slate-300 border border-slate-800">
                      {selectedRequest.additionalNotes}
                    </div>
                  </div>
                )}

                {selectedRequest.internalNotes && selectedRequest.internalNotes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Internal Notes</p>
                    <div className="space-y-2">
                      {selectedRequest.internalNotes.map((note, i) => (
                        <div key={i} className="bg-[#8B5CF6]/10 p-3 rounded-xl text-xs text-[#8B5CF6] border border-[#8B5CF6]/20">
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {modalMode === "update-status" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">New Status</p>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-4 bg-[#020617] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <button
                  disabled={isSubmitting}
                  onClick={handleUpdateStatus}
                  className="w-full px-6 py-5 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest border-2 border-emerald-600 hover:bg-emerald-600 hover:border-emerald-700 transition-all rounded-2xl shadow-[2px_2px_0px_0px_rgba(5,150,105,1)] hover:shadow-none hover:translate-y-[1px] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                  {isSubmitting ? "Updating..." : "Save Changes"}
                </button>
              </div>
            )}

            {modalMode === "add-note" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Internal Note</p>
                  <p className="text-xs text-slate-300 font-medium mb-2">
                    These are private, internal notes for the admin team only. The student won't see these.
                  </p>
                  <textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Add your internal note here..."
                    rows={5}
                    className="w-full px-4 py-4 bg-[#020617] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none font-medium"
                  />
                </div>
                <button
                  disabled={isSubmitting || !internalNote.trim()}
                  onClick={handleAddInternalNote}
                  className="w-full px-6 py-5 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest border-2 border-emerald-600 hover:bg-emerald-600 hover:border-emerald-700 transition-all rounded-2xl shadow-[2px_2px_0px_0px_rgba(5,150,105,1)] hover:shadow-none hover:translate-y-[1px] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                  {isSubmitting ? "Adding Note..." : "Add Note"}
                </button>
              </div>
            )}

            {modalMode === "assign-tutor" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Tutor</p>
                  <select
                    value={selectedTutorId}
                    onChange={(e) => setSelectedTutorId(e.target.value)}
                    className="w-full px-4 py-4 bg-[#020617] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold"
                  >
                    <option value="">Select a tutor...</option>
                    {tutors.map((tutor) => (
                      <option key={tutor._id || tutor.id} value={tutor._id || tutor.id}>
                        {tutor.name} ({tutor.email})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  disabled={isSubmitting || !selectedTutorId}
                  onClick={handleAssignTutor}
                  className="w-full px-6 py-5 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest border-2 border-emerald-600 hover:bg-emerald-600 hover:border-emerald-700 transition-all rounded-2xl shadow-[2px_2px_0px_0px_rgba(5,150,105,1)] hover:shadow-none hover:translate-y-[1px] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                  {isSubmitting ? "Assigning..." : "Assign Tutor"}
                </button>
              </div>
            )}

            {modalMode === "send-email" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">To</p>
                  <p className="text-sm font-bold text-white">{selectedRequest.fullName} &lt;{selectedRequest.email}&gt;</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subject</p>
                  <input
                    type="text"
                    required
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                    className="w-full px-4 py-4 bg-[#020617] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Message</p>
                  <textarea
                    required
                    value={emailData.message}
                    onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-4 bg-[#020617] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none font-medium"
                  />
                </div>
                <button
                  disabled={isSubmitting || !emailData.subject || !emailData.message}
                  onClick={handleSendEmail}
                  className="w-full px-6 py-5 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest border-2 border-emerald-600 hover:bg-emerald-600 hover:border-emerald-700 transition-all rounded-2xl shadow-[2px_2px_0px_0px_rgba(5,150,105,1)] hover:shadow-none hover:translate-y-[1px] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {isSubmitting ? "Sending..." : "Send Email"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
