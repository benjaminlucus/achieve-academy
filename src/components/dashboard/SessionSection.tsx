"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, Play, CheckCircle, Loader2, History } from "lucide-react";
import { format, isAfter, isBefore, addMinutes } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

interface UserInfo {
  _id: string;
  name: string;
  profileImage?: string;
  email: string;
}

interface Session {
  _id: string;
  student: UserInfo;
  tutor: UserInfo;
  startDate: string;
  duration: number;
  subject: string;
  status: string;
  notes?: string;
  frequency: string;
  meetingLink?: string;
  attendance?: {
    date: Date;
    present: boolean;
  }[];
}

type TabType = "upcoming" | "previous";

export const SessionSection = ({ userRole }: { userRole: string }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/sessions");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleCompleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      if (!res.ok) throw new Error("Failed to update session");

      toast.success("Session marked as completed!");
      setSessions(prev => prev.map(s => 
        s._id === sessionId ? { ...s, status: "completed" } : s
      ));
    } catch (error: unknown) {
      console.error("Error updating session:", error);
      toast.error("Error updating session");
    }
  };

  const now = new Date();

  const upcomingSessions = sessions.filter(session => {
    const start = new Date(session.startDate);
    return isAfter(start, now) || session.status === "active";
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const previousSessions = sessions.filter(session => {
    const start = new Date(session.startDate);
    return isBefore(start, now) || session.status === "completed";
  }).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const displayedSessions = activeTab === "upcoming" ? upcomingSessions : previousSessions;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-dark-navy" size={32} />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white p-10 rounded-[2.5rem] border border-dark-navy/5 text-center space-y-4">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
          <Calendar className="text-gray-300" size={32} />
        </div>
        <p className="text-sm font-bold text-steel-blue uppercase tracking-widest">No Study Sessions Scheduled</p>
        <p className="text-xs text-steel-blue/60 max-w-xs mx-auto">Once you connect with a {userRole === 'student' ? 'tutor' : 'student'}, you can schedule sessions here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">Study Sessions</h2>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "upcoming" 
                ? "bg-dark-navy text-white shadow-sm" 
                : "text-gray-500 hover:text-dark-navy"
            }`}
          >
            Upcoming
            {upcomingSessions.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[9px] bg-coral text-white rounded-full">
                {upcomingSessions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("previous")}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "previous" 
                ? "bg-dark-navy text-white shadow-sm" 
                : "text-gray-500 hover:text-dark-navy"
            }`}
          >
            Previous
            {previousSessions.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[9px] bg-steel-blue text-white rounded-full">
                {previousSessions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {displayedSessions.length === 0 ? (
        <div className="bg-white p-10 rounded-[2.5rem] border border-dark-navy/5 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
            {activeTab === "upcoming" ? <Calendar className="text-gray-300" size={32} /> : <History className="text-gray-300" size={32} />}
          </div>
          <p className="text-sm font-bold text-steel-blue uppercase tracking-widest">
            No {activeTab} Sessions
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedSessions.map((session) => {
            const start = new Date(session.startDate);
            const end = addMinutes(start, session.duration);
            const isLive = isBefore(start, now) && isAfter(end, now);
            const hasStarted = isBefore(start, now);
            const partner = userRole === "student" ? session.tutor : session.student;
            const partnerRole = userRole === "student" ? "tutor" : "student";
            
            const sessionLabel = `${session.student.name} has a session with ${session.tutor.name} at ${format(start, "MMM do, h:mm a")}`;
            const viewerPerspectiveLabel = userRole === "admin" 
              ? sessionLabel 
              : `${userRole === "student" ? "You" : "You"} have a session with ${partner.name} (${partnerRole}) at ${format(start, "MMM do, h:mm a")}`;

            const wasJoined = session.attendance && session.attendance.length > 0 && session.attendance.some(a => a.present);

            return (
              <motion.div 
                key={session._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-[2rem] border border-dark-navy/5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-dark-navy flex items-center justify-center text-white font-black text-sm">
                      {partner?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-black text-dark-navy uppercase tracking-tight">{partner?.name}</p>
                      <p className="text-[10px] font-medium text-steel-blue/60">{session.subject}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    activeTab === "previous" 
                      ? (session.status === "completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-gray-50 text-gray-600 border border-gray-100")
                      : isLive 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 animate-pulse' 
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {activeTab === "previous" 
                      ? (session.status === "completed" ? "Completed" : format(start, "MMM do, h:mm a"))
                      : isLive ? 'Live Now' : format(start, "MMM do, h:mm a")}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-xs text-steel-blue">{viewerPerspectiveLabel}</p>
                  <div className="flex items-center gap-2 text-steel-blue">
                    <Clock size={14} className="text-coral" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{session.duration} Minutes • {session.frequency}</span>
                  </div>
                  {activeTab === "previous" && (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className={wasJoined ? "text-emerald-500" : "text-gray-300"} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${wasJoined ? "text-emerald-600" : "text-gray-500"}`}>
                        {wasJoined ? "Attended" : "Not Joined"}
                      </span>
                    </div>
                  )}
                  {session.notes && (
                    <p className="text-[10px] text-steel-blue/70 italic line-clamp-2">"{session.notes}"</p>
                  )}
                </div>

                {activeTab === "upcoming" && (
                  <div className="flex gap-2">
                    {session.meetingLink ? (
                      <a 
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-grow flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          hasStarted 
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald/10' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={(e) => {
                          if (!hasStarted) e.preventDefault();
                        }}
                      >
                        <Play size={14} fill="currentColor" /> 
                        {hasStarted ? "Start" : "Join Session"}
                      </a>
                    ) : (
                      <button 
                        disabled
                        className="flex-grow flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-400 cursor-not-allowed"
                      >
                        <Play size={14} fill="currentColor" /> Link Pending
                      </button>
                    )}
                    {!isLive && (
                      <button 
                        onClick={() => handleCompleteSession(session._id)}
                        className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                        title="Mark as Completed"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button className="p-3 bg-gray-50 text-steel-blue rounded-xl hover:bg-gray-100 transition-all border border-dark-navy/5">
                      <Calendar size={16} />
                    </button>
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
