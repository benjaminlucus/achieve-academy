"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, Play, CheckCircle, Loader2, History, Video, RefreshCw, Edit, Trash2, XCircle } from "lucide-react";
import { format, addMinutes } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import ScheduleSessionModal from "./ScheduleSessionModal";
import EditSessionModal from "./EditSessionModal";

interface UserInfo {
  _id: string;
  name: string;
  profileImage?: string;
  email: string;
}

interface Meeting {
  _id: string;
  studentId: UserInfo;
  tutorId: UserInfo;
  title: string;
  subject: string;
  scheduledStart: string;
  duration: number;
  notes?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "expired";
  roomId?: string;
  joinUrl: string;
  actualDuration?: number;
  paymentStatus?: string;
}

type TabType = "in_progress" | "scheduled" | "completed" | "cancelled";

export const SessionSection = ({ userRole }: { userRole: string }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("scheduled");
  const [startingId, setStartingId] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [partnerId, setPartnerId] = useState<string>("");
  const [partnerName, setPartnerName] = useState<string>("");
  const [partnerRole, setPartnerRole] = useState<"student" | "tutor">("student");

  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/meetings");
      if (res.ok) {
        const data = await res.json();
        setMeetings(data.meetings);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleStartSession = async (meetingId: string) => {
    setStartingId(meetingId);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/start`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start session");
      }

      const data = await res.json();
      setMeetings((prev) =>
        prev.map((m) =>
          m._id === meetingId ? { ...m, status: "in_progress", roomId: data.roomId } : m
        )
      );
      toast.success("Session started!");
      window.location.href = `/classroom/meeting/${meetingId}`;
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setStartingId(null);
    }
  };

  const handleCompleteSession = async (meetingId: string) => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}/complete`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to complete session");
      }

      const data = await res.json();
      setMeetings((prev) =>
        prev.map((m) =>
          m._id === meetingId ? { ...m, status: "completed", ...data.meeting } : m
        )
      );
      toast.success("Session completed!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCancelSession = async (meetingId: string) => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}/cancel`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel session");
      }

      const data = await res.json();
      setMeetings((prev) =>
        prev.map((m) =>
          m._id === meetingId ? { ...m, status: "cancelled", ...data.meeting } : m
        )
      );
      toast.success("Session cancelled!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteSession = async (meetingId: string) => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete session");
      }

      setMeetings((prev) => prev.filter((m) => m._id !== meetingId));
      toast.success("Session deleted!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEditSession = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setShowEditModal(true);
  };

  const handleOpenScheduleModal = () => {
    if (meetings.length > 0) {
      const partner = userRole === "student" ? meetings[0].tutorId : meetings[0].studentId;
      setPartnerId(partner._id);
      setPartnerName(partner.name);
      setPartnerRole(userRole === "student" ? "tutor" : "student");
    }
    setShowScheduleModal(true);
  };

  const getDisplayedMeetings = () => {
    switch (activeTab) {
      case "in_progress":
        return meetings.filter((m) => m.status === "in_progress");
      case "scheduled":
        return meetings.filter((m) => m.status === "scheduled");
      case "completed":
        return meetings.filter((m) => m.status === "completed");
      case "cancelled":
        return meetings.filter((m) => m.status === "cancelled");
      default:
        return [];
    }
  };

  const displayedMeetings = getDisplayedMeetings();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-dark-navy" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">
            Study Sessions
          </h2>
          <button
            onClick={fetchMeetings}
            className="p-2 bg-gray-100 text-dark-navy hover:bg-gray-200 rounded-xl transition-all"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("in_progress")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === "in_progress"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-dark-navy"
              }`}
            >
              <Video size={12} />
              In Progress
              {meetings.filter((m) => m.status === "in_progress").length > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 text-[8px] bg-white text-emerald-500 rounded-full">
                  {meetings.filter((m) => m.status === "in_progress").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("scheduled")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "scheduled"
                  ? "bg-dark-navy text-white shadow-sm"
                  : "text-gray-500 hover:text-dark-navy"
              }`}
            >
              Scheduled
              {meetings.filter((m) => m.status === "scheduled").length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[9px] bg-coral text-white rounded-full">
                  {meetings.filter((m) => m.status === "scheduled").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "completed"
                  ? "bg-dark-navy text-white shadow-sm"
                  : "text-gray-500 hover:text-dark-navy"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "cancelled"
                  ? "bg-dark-navy text-white shadow-sm"
                  : "text-gray-500 hover:text-dark-navy"
              }`}
            >
              Cancelled
            </button>
          </div>
          <button
            onClick={handleOpenScheduleModal}
            className="px-4 py-2 bg-dark-navy text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-coral transition-all"
          >
            Book Session
          </button>
        </div>
      </div>

      {displayedMeetings.length === 0 ? (
        <div className="bg-white p-10 rounded-[2.5rem] border border-dark-navy/5 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
            {activeTab === "in_progress" ? (
              <Video className="text-gray-300" size={32} />
            ) : activeTab === "scheduled" ? (
              <Calendar className="text-gray-300" size={32} />
            ) : (
              <History className="text-gray-300" size={32} />
            )}
          </div>
          <p className="text-sm font-black text-steel-blue uppercase tracking-widest">
            No {activeTab.replace("_", " ")} Sessions
          </p>
          {activeTab === "scheduled" && (
            <button
              onClick={handleOpenScheduleModal}
              className="px-4 py-2 bg-dark-navy text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-coral transition-all"
            >
              Book Your First Session
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedMeetings.map((meeting) => {
            const start = new Date(meeting.scheduledStart);
            const end = addMinutes(start, meeting.duration);
            const partner =
              userRole === "student" ? meeting.tutorId : meeting.studentId;
            const isTutor = userRole === "tutor";
            const canEdit =
              isTutor &&
              (meeting.status === "scheduled" || meeting.status === "in_progress");
            const canDelete =
              isTutor &&
              (meeting.status === "scheduled" || meeting.status === "in_progress");
            const canCancel =
              isTutor &&
              (meeting.status === "scheduled" || meeting.status === "in_progress");

            return (
              <motion.div
                key={meeting._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white p-6 rounded-[2rem] border shadow-sm hover:shadow-md transition-all group ${
                  meeting.status === "in_progress"
                    ? "border-emerald-200 shadow-emerald-100"
                    : meeting.status === "cancelled"
                    ? "border-rose-200 bg-rose-50/30"
                    : meeting.status === "completed"
                    ? "border-emerald-200"
                    : "border-dark-navy/5"
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-dark-navy flex items-center justify-center text-white font-black text-sm">
                      {partner?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-black text-dark-navy uppercase tracking-tight">
                        {partner?.name}
                      </p>
                      <p className="text-[10px] font-medium text-steel-blue/60">
                        {meeting.subject}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      meeting.status === "completed"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : meeting.status === "in_progress"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100 animate-pulse"
                        : meeting.status === "cancelled"
                        ? "bg-rose-50 text-rose-600 border border-rose-100"
                        : "bg-blue-50 text-blue-600 border border-blue-100"
                    }`}
                  >
                    {meeting.status}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-xs text-steel-blue">
                    {`${isTutor ? "You" : "You"} have a session with ${partner.name} at ${format(
                      start,
                      "MMM do, h:mm a"
                    )}`}
                  </p>
                  <div className="flex items-center gap-2 text-steel-blue">
                    <Clock size={14} className="text-coral" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {meeting.duration} Minutes
                    </span>
                  </div>
                  {meeting.actualDuration && (
                    <div className="flex items-center gap-2 text-steel-blue">
                      <CheckCircle size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Actual: {meeting.actualDuration} Minutes
                      </span>
                    </div>
                  )}
                  {meeting.notes && (
                    <p className="text-[10px] text-steel-blue/70 italic line-clamp-2">
                      "{meeting.notes}"
                    </p>
                  )}
                  {meeting.paymentStatus && (
                    <div className="flex items-center gap-2 text-steel-blue">
                      <span
                        className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider ${
                          meeting.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : meeting.paymentStatus === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {meeting.paymentStatus}
                      </span>
                    </div>
                  )}
                </div>

                {(activeTab === "scheduled" || activeTab === "in_progress") && (
                  <div className="flex flex-wrap gap-2">
                    {isTutor && meeting.status === "scheduled" ? (
                      <button
                        onClick={() => handleStartSession(meeting._id)}
                        disabled={startingId === meeting._id}
                        className="flex-grow flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-100 transition-all"
                      >
                        {startingId === meeting._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Play size={14} fill="currentColor" />
                        )}
                        Start Session
                      </button>
                    ) : meeting.status === "in_progress" ? (
                      <a
                        href={meeting.joinUrl}
                        className="flex-grow flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-100 transition-all"
                      >
                        <Play size={14} fill="currentColor" />
                        Join Session
                      </a>
                    ) : null}

                    {isTutor && meeting.status === "in_progress" ? (
                      <button
                        onClick={() => handleCompleteSession(meeting._id)}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-500 text-white hover:bg-blue-600 transition-all"
                      >
                        <CheckCircle size={14} fill="currentColor" />
                        End Session
                      </button>
                    ) : null}

                    {canEdit && meeting.status === "scheduled" && (
                      <button
                        onClick={() => handleEditSession(meeting)}
                        className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all border border-gray-200"
                        title="Edit Session"
                      >
                        <Edit size={16} />
                      </button>
                    )}

                    {canCancel && meeting.status === "scheduled" && (
                      <button
                        onClick={() => handleCancelSession(meeting._id)}
                        className="p-3 bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200 transition-all border border-rose-200"
                        title="Cancel Session"
                      >
                        <XCircle size={16} />
                      </button>
                    )}

                    {canDelete && meeting.status === "scheduled" && (
                      <button
                        onClick={() => handleDeleteSession(meeting._id)}
                        className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all border border-red-200"
                        title="Delete Session"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {showScheduleModal && (
        <ScheduleSessionModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          partnerId={partnerId}
          partnerName={partnerName}
          partnerRole={partnerRole}
          myId={""}
          onSuccess={fetchMeetings}
        />
      )}

      {showEditModal && editingMeeting && (
        <EditSessionModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          meeting={editingMeeting}
          onSuccess={fetchMeetings}
        />
      )}
    </div>
  );
};
