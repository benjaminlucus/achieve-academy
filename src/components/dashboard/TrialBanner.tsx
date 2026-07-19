"use client";

import React, { useState, useEffect } from "react";
import { Clock, AlertCircle, CreditCard, UserX, CheckCircle } from "lucide-react";
import { differenceInDays, isAfter } from "date-fns";
import { motion } from "framer-motion";
import { useRealtime } from "@/lib/realtime-context";

interface TrialBannerProps {
  userRole: "student" | "tutor";
  myId: string;
} 

interface ConnectionPartner {
  name: string;
}

interface Connection {
  _id: string;
  status: string;
  subscriptionStatus: string;
  trialEndsAt: string;
  student: ConnectionPartner;
  tutor: ConnectionPartner;
}

export const TrialBanner = ({ userRole }: TrialBannerProps) => {
  const { lastUpdate } = useRealtime();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrialStatus = async () => {
      try {
        const res = await fetch("/api/connections");
        if (res.ok) {
          const data = await res.json();
          // Find all connections (accepted or blocked with expired status) only for students
          const trialConnections = data.connections.filter((c: Connection) => 
            (c.status === "accepted" || c.status === "blocked") &&
            (c.subscriptionStatus === "trial" || c.subscriptionStatus === "expired" || (c.subscriptionStatus === "none" && c.trialEndsAt))
          );
          setConnections(trialConnections);
        }
      } catch (error) {
        console.error("Error fetching trial status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrialStatus();
  }, [lastUpdate]);

  // Tutors can see which students have expired trials but no restrictions on them
  if (userRole === "tutor") {
    // Only show expired/blocked connections for tutors
    const expiredConnections = connections.filter(conn => {
      const trialEndsAt = new Date(conn.trialEndsAt);
      return isAfter(new Date(), trialEndsAt) || conn.status === "blocked";
    });

    if (expiredConnections.length === 0) {
      return null;
    }

    return (
      <div className="space-y-4">
        {expiredConnections.map((conn) => {
          const partner = conn.student;
          const trialEndsAt = new Date(conn.trialEndsAt);
          const isExpired = isAfter(new Date(), trialEndsAt);
          const isBlocked = conn.status === "blocked";

          return (
            <motion.div 
              key={conn._id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-[2rem] border border-gray-200 bg-gray-50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center shadow-inner">
                  <AlertCircle size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-gray-700">
                    Trial Expired with {partner.name}
                  </h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-gray-600/70">
                    You can't message this student until their trial is extended or they pay.
                  </p>
                </div>
              </div>
              <div className="px-6 py-3 bg-white/50 rounded-xl border border-gray-200 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                Awaiting Student Payment
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  const now = new Date();
  
  // Show the top banner only if there are any expired connections (status blocked or subscription expired)
  const hasExpiredConnection = connections.some(conn => {
    const trialEndsAt = new Date(conn.trialEndsAt);
    return isAfter(now, trialEndsAt) || conn.status === "blocked";
  });

  return (
    <div className="space-y-4">
      {hasExpiredConnection && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[2rem] border border-rose-100 bg-rose-50 shadow-sm"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
                <UserX size={28} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-tight text-rose-700">
                  Your Free Trial Has Ended
                </h4>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-rose-600/70">
                  Your profile has been hidden from public search, so new tutors cannot find you.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                className="flex-grow md:flex-none px-8 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all"
              >
                <CreditCard size={16} /> Upgrade Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
      {connections.map((conn) => {
        const partner = conn.tutor; // Students only have tutor partners
        const trialEndsAt = new Date(conn.trialEndsAt);
        const daysLeft = differenceInDays(trialEndsAt, now);
        const isExpired = isAfter(now, trialEndsAt);
        const isBlocked = conn.status === "blocked";
        const isActive = !isExpired && conn.status === "accepted";

        return (
          <motion.div 
            key={conn._id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-[2rem] border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${
              isExpired || isBlocked 
                ? 'bg-gray-50 border-gray-100' 
                : daysLeft <= 2 
                  ? 'bg-amber-50 border-amber-100' 
                  : 'bg-emerald-50 border-emerald-100'
            }`}
          >
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                isExpired || isBlocked ? 'bg-gray-100 text-gray-600' : 'bg-white text-emerald-600'
              }`}>
                {isExpired || isBlocked ? <AlertCircle size={28} /> : <CheckCircle size={28} />}
              </div>
              <div>
                <h4 className={`text-sm font-black uppercase tracking-tight ${
                  isExpired || isBlocked ? 'text-gray-700' : 'text-emerald-900'
                }`}>
                  {isExpired || isBlocked 
                    ? `Trial Expired with ${partner.name}` 
                    : `${daysLeft} Days Remaining in Trial`}
                </h4>
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
                  isExpired || isBlocked ? 'text-gray-600/70' : 'text-emerald-600/70'
                }`}>
                  {isExpired || isBlocked 
                    ? "Complete payment or wait for admin to extend to continue learning and messaging" 
                    : `Enjoy your trial period with ${partner.name} - Connection Active!`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                className={`flex-grow md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isExpired || isBlocked
                    ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-gray-200' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                }`}
              >
                <CreditCard size={16} /> Continue Learning
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
