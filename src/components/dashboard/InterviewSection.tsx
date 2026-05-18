"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, Video, Play, ExternalLink, AlertCircle } from "lucide-react";
import { format, formatDistanceToNow, isAfter, isBefore, addMinutes } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface InterviewData {
  status: string;
  interviewDate?: string;
  interviewLink?: string;
  interviewTimezone?: string;
  meetingProvider?: string;
}

export const InterviewSection = ({ data }: { data: InterviewData }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    if (!data.interviewDate) return;

    const updateCountdown = () => {
      const target = new Date(data.interviewDate!);
      const now = new Date();
      
      if (isBefore(target, now)) {
        const endOfMeeting = addMinutes(target, 30);
        if (isAfter(endOfMeeting, now)) {
          setIsLive(true);
          setTimeLeft("LIVE NOW");
        } else {
          setIsLive(false);
          setIsEnded(true);
          setTimeLeft("ENDED");
        }
        return;
      }

      setIsLive(false);
      setIsEnded(false);
      setTimeLeft(formatDistanceToNow(target, { addSuffix: true }));
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [data.interviewDate]);

  const showInterview = data.status === "interview_scheduled" || 
                        data.status === "interview_live" || 
                        (data.status === "interview_pending" && data.interviewDate);

  if (!showInterview || !data.interviewDate) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-dark-navy/5 space-y-8"
    >
      <div className="flex items-center justify-between border-b border-gray-50 pb-6">
        <div>
          <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">Your Interview</h2>
          <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mt-1">Verification Process</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          isLive ? 'bg-emerald-50 text-emerald-600 border-emerald-100 animate-pulse' : 
          isEnded ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-blue-50 text-blue-600 border-blue-100'
        }`}>
          {timeLeft}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-2xl">
              <Calendar size={20} className="text-coral" />
            </div>
            <div>
              <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Date & Time</p>
              <p className="text-sm font-bold text-dark-navy">
                {format(new Date(data.interviewDate), "EEEE, MMMM do")}
              </p>
              <p className="text-xs font-medium text-steel-blue/60">
                {format(new Date(data.interviewDate), "h:mm a")} ({data.interviewTimezone || "UTC"})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-2xl">
              <Video size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Meeting Platform</p>
              <p className="text-sm font-bold text-dark-navy uppercase">
                {data.meetingProvider || "Zoom"} Meeting
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-dark-navy/5 flex flex-col justify-center items-center text-center space-y-4">
          <div className="p-4 bg-white rounded-2xl shadow-sm">
            <AlertCircle size={24} className="text-coral" />
          </div>
          <div>
            <p className="text-xs font-bold text-dark-navy uppercase tracking-tight">Ready to join?</p>
            <p className="text-[10px] font-medium text-steel-blue/60 mt-1">The button will be active when the meeting starts.</p>
          </div>
          
          <a 
            href={data.interviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              isEnded ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 
              'bg-dark-navy text-white hover:bg-coral shadow-xl shadow-dark-navy/10'
            }`}
            onClick={(e) => {
              if (isEnded) e.preventDefault();
            }}
          >
            <Play size={16} fill="currentColor" /> Join Interview
          </a>
        </div>
      </div>
    </motion.div>
  );
};
