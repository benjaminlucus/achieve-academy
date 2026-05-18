"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  Video, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter,
  MoreVertical,
  CheckCircle,
  Play,
  User as UserIcon,
  AlertCircle
} from "lucide-react";
import { format, formatDistanceToNow, isAfter, isBefore, addMinutes } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { SearchBar } from "@/components/SearchBar";
import { toast } from "react-hot-toast";

interface Interview {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileImage: string;
    status: string;
  };
  scheduledAt: string;
  timezone: string;
  studentJoinLink: string;
  hostJoinLink: string;
  meetingId: string;
  status: string;
  notes: string;
  duration: number;
}

const Countdown = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(targetDate);
      const now = new Date();
      
      if (isBefore(target, now)) {
        const endOfMeeting = addMinutes(target, 30); // Assume 30 min duration
        if (isAfter(endOfMeeting, now)) {
          setTimeLeft("LIVE NOW");
        } else {
          setTimeLeft("ENDED");
        }
        return;
      }

      setTimeLeft(formatDistanceToNow(target, { addSuffix: true }));
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const isLive = timeLeft === "LIVE NOW";
  const isEnded = timeLeft === "ENDED";

  return (
    <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
      isLive ? 'bg-emerald-100 text-emerald-600 animate-pulse' : 
      isEnded ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'
    }`}>
      {timeLeft}
    </div>
  );
};

const InterviewCard = ({ interview, onStatusChange }: { interview: Interview; onStatusChange: (id: string, status: string) => void }) => {
  const isLive = isBefore(new Date(interview.scheduledAt), new Date()) && 
                 isAfter(addMinutes(new Date(interview.scheduledAt), 30), new Date());
  
  const isCompleted = interview.status === "completed";

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
    >
      <div className="p-6">
        {/* Top Section: User Info & Status */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-dark-navy flex items-center justify-center text-white font-black text-lg shadow-inner overflow-hidden">
              {interview.user.profileImage ? (
                <img src={interview.user.profileImage} alt={interview.user.name} className="w-full h-full object-cover" />
              ) : (
                interview.user.name.charAt(0)
              )}
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{interview.user.name}</h3>
              <p className="text-xs font-medium text-gray-400">{interview.user.email}</p>
            </div>
          </div>
          <Countdown targetDate={interview.scheduledAt} />
        </div>

        {/* Middle Section: Time & Links */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Calendar size={14} className="text-coral" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scheduled For</p>
              <p className="text-xs font-bold text-gray-700">
                {format(new Date(interview.scheduledAt), "EEE, MMM do, h:mm a")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Video size={14} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Meeting Platform</p>
              <p className="text-xs font-bold text-gray-700 uppercase">Zoom Meeting</p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
          <a 
            href={interview.hostJoinLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex-grow flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              isCompleted ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
              'bg-dark-navy text-white hover:bg-coral shadow-sm'
            }`}
          >
            <Play size={14} fill="currentColor" /> Join Meeting
          </a>
          
          {!isCompleted && (
            <button 
              onClick={() => onStatusChange(interview.id, "completed")}
              className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
              title="Mark as Completed"
            >
              <CheckCircle size={18} />
            </button>
          )}

          <button 
            className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all"
            title="Options"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>
      
      {/* Footer Notes */}
      {interview.notes && (
        <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-50">
          <p className="text-[10px] font-medium text-gray-500 italic">
            " {interview.notes} "
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default function InterviewsTableClient({ initialInterviews }: { initialInterviews: Interview[] }) {
  const [interviews, setInterviews] = useState(initialInterviews);
  const [filters, setFilters] = useState({ search: "", status: "All Status" });
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "all">("upcoming");

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/interviews/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast.success(`Interview marked as ${status}`);
      setInterviews(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    } catch (error) {
      toast.error("Error updating interview status");
    }
  };

  const filteredInterviews = useMemo(() => {
    return interviews.filter(i => {
      const matchesSearch = i.user.name.toLowerCase().includes(filters.search.toLowerCase()) || 
                            i.user.email.toLowerCase().includes(filters.search.toLowerCase());
      
      const now = new Date();
      const sched = new Date(i.scheduledAt);
      
      if (activeTab === "upcoming") {
        return matchesSearch && i.status === "scheduled" && isAfter(addMinutes(sched, 30), now);
      }
      if (activeTab === "completed") {
        return matchesSearch && (i.status === "completed" || isBefore(addMinutes(sched, 30), now));
      }
      return matchesSearch;
    });
  }, [interviews, filters, activeTab]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Interview Management</h1>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">
            Schedule and manage applicant interviews
          </p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          {(["upcoming", "completed", "all"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? "bg-white text-dark-navy shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <SearchBar 
        placeholder="Search applicants..."
        allStatuses={["All Status", "Scheduled", "Completed", "Live"]}
        onSearch={(data) => setFilters(data)}
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredInterviews.length > 0 ? (
            filteredInterviews.map((interview) => (
              <InterviewCard 
                key={interview.id} 
                interview={interview} 
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 flex flex-col items-center justify-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="text-gray-300" size={32} />
              </div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">No interviews found</h3>
              <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest">Try adjusting your filters or search query</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
