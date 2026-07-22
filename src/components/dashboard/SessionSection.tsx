"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, Play, CheckCircle, Loader2, History, Video } from "lucide-react";
import { format, isAfter, isBefore, addMinutes } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

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
  status: "upcoming" | "live" | "completed" | "expired";
  roomId?: string;
  joinUrl: string;
}

type TabType = "live" | "upcoming" | "completed";

export const SessionSection = ({ userRole }: { userRole: string }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
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
          m._id === meetingId ? { ...m, status: "live", roomId: data.roomId } : m
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

      if (!res.ok) throw new Error("Failed to update session");

      toast.success("Session marked as completed!");
      setMeetings((prev) =>
        prev.map((m) =>
          m._id === meetingId ? { ...m, status: "completed" } : m
        )
      );
    } catch (error: unknown) {
      console.error("Error updating session:", error);
      toast.error("Error updating session");
    }
  };

  const now = new Date();

  const getDisplayedMeetings = () => {
    switch (activeTab) {
      case "live":
        return meetings.filter((m) => m.status === "live");
      case "upcoming":
        return meetings.filter((m) => m.status === "upcoming");
      case "completed":
        return meetings.filter(
          (m) => m.status === "completed" || m.status === "expired"
        );
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

  if (meetings.length === 0) {
    return (
      <div className="bg-white p-10 rounded-[2.5rem] border border-dark-navy/5 text-center space-y-4">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
          <Calendar className="text-gray-300" size={32} />
        </div>
        <p className="text-sm font-black text-steel-blue uppercase tracking-widest">
          No sessions scheduled yet
        </p>
        <p className="text-xs text-steel-blue/60 max-w-xs mx-auto">
          Book your first session with one of your connections.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">
          Study Sessions
        </h2>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === "live"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-gray-500 hover:text-dark-navy"
            }`}
          >
            <Video size={12} />
            Live
            {meetings.filter((m) => m.status === "live").length > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 text-[8px] bg-white text-emerald-500 rounded-full">
                {meetings.filter((m) => m.status === "live").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "upcoming"
                ? "bg-dark-navy text-white shadow-sm"
                : "text-gray-500 hover:text-dark-navy"
            }`}
          >
            Upcoming
            {meetings.filter((m) => m.status === "upcoming").length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[9px] bg-coral text-white rounded-full">
                {meetings.filter((m) => m.status === "upcoming").length}
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
        </div>
      </div>

      {displayedMeetings.length === 0 ? (
        <div className="bg-white p-10 rounded-[2.5rem] border border-dark-navy/5 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
            {activeTab === "live" ? (
              <Video className="text-gray-300" size={32} />
            ) : activeTab === "upcoming" ? (
              <Calendar className="text-gray-300" size={32} />
            ) : (
              <History className="text-gray-300" size={32} />
            )}
          </div>
          <p className="text-sm font-black text-steel-blue uppercase tracking-widest">
            No {activeTab} Sessions
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedMeetings.map((meeting) => {
            const start = new Date(meeting.scheduledStart);
            const end = addMinutes(start, meeting.duration);
            const isLive = activeTab === "live";
            const partner =
              userRole === "student" ? meeting.tutorId : meeting.studentId;
            const isTutor = userRole === "tutor";

            const viewerPerspectiveLabel = `${
              userRole === "student" ? "You" : "You"
            } have a session with ${partner.name} at ${format(
              start,
              "MMM do, h:mm a"
            )}`;

            return (
              <motion.div
                key={meeting._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white p-6 rounded-[2rem] border shadow-sm hover:shadow-md transition-all group ${
                  isLive
                    ? "border-emerald-200 shadow-emerald-100"
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
                        : meeting.status === "live"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100 animate-pulse"
                        : meeting.status === "expired"
                        ? "bg-gray-50 text-gray-600 border border-gray-100"
                        : "bg-blue-50 text-blue-600 border border-blue-100"
                    }`}
                  >
                    {meeting.status}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-xs text-steel-blue">{viewerPerspectiveLabel}</p>
                  <div className="flex items-center gap-2 text-steel-blue">
                    <Clock size={14} className="text-coral" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {meeting.duration} Minutes
                    </span>
                  </div>
                  {meeting.notes && (
                    <p className="text-[10px] text-steel-blue/70 italic line-clamp-2">
                      "{meeting.notes}"
                    </p>
                  )}
                </div>

                {(activeTab === "upcoming" || activeTab === "live") && (
                  <div className="flex gap-2">
                    {isTutor && meeting.status === "upcoming" ? (
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
                    ) : isLive || meeting.status === "live" ? (
                      <a
                        href={meeting.joinUrl}
                        className="flex-grow flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-100 transition-all"
                      >
                        <Play size={14} fill="currentColor" />
                        Join Session
                      </a>
                    ) : (
                      <button
                        disabled
                        className="flex-grow flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-400 cursor-not-allowed"
                      >
                        Waiting for tutor to start
                      </button>
                    )}

                    {activeTab === "upcoming" &&
                      !isLive &&
                      meeting.status !== "live" && (
                        <button
                          onClick={() => handleCompleteSession(meeting._id)}
                          className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                          title="Mark as Completed"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
