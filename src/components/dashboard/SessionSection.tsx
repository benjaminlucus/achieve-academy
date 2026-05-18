"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, BookOpen, Play, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { format, isAfter, isBefore, addMinutes } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

interface Session {
  _id: string;
  student: any;
  tutor: any;
  startDate: string;
  duration: number;
  subject: string;
  status: string;
  notes?: string;
  frequency: string;
  meetingLink?: string;
}

export const SessionSection = ({ userRole }: { userRole: string }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      setSessions(prev => prev.filter(s => s._id !== sessionId));
    } catch (error) {
      toast.error("Error updating session");
    }
  };

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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">Upcoming Sessions</h2>
        <span className="text-[10px] font-black text-coral uppercase tracking-widest bg-coral/5 px-3 py-1 rounded-full border border-coral/10">
          {sessions.length} Scheduled
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map((session) => {
          const start = new Date(session.startDate);
          const end = addMinutes(start, session.duration);
          const now = new Date();
          const isLive = isBefore(start, now) && isAfter(end, now);
          const isUpcoming = isAfter(start, now);
          const partner = userRole === "student" ? session.tutor : session.student;

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
                  isLive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 animate-pulse' : 
                  'bg-blue-50 text-blue-600 border border-blue-100'
                }`}>
                  {isLive ? 'Live Now' : format(start, "MMM do, h:mm a")}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-steel-blue">
                  <Clock size={14} className="text-coral" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{session.duration} Minutes • {session.frequency}</span>
                </div>
                {session.notes && (
                  <p className="text-[10px] text-steel-blue/70 italic line-clamp-2">"{session.notes}"</p>
                )}
              </div>

              <div className="flex gap-2">
                {session.meetingLink ? (
                  <a 
                    href={session.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-grow flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      isLive ? 'bg-dark-navy text-white hover:bg-coral shadow-lg shadow-dark-navy/10' : 
                      'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={(e) => {
                      if (!isLive) e.preventDefault();
                    }}
                  >
                    <Play size={14} fill="currentColor" /> Join Session
                  </a>
                ) : (
                  <button 
                    disabled
                    className="flex-grow flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-400 cursor-not-allowed"
                  >
                    <Play size={14} fill="currentColor" /> Link Pending
                  </button>
                )}
                <button 
                  onClick={() => handleCompleteSession(session._id)}
                  className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                  title="Mark as Completed"
                >
                  <CheckCircle size={16} />
                </button>
                <button className="p-3 bg-gray-50 text-steel-blue rounded-xl hover:bg-gray-100 transition-all border border-dark-navy/5">
                  <Calendar size={16} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
