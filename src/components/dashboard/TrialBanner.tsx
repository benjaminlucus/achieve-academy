"use client";

import React, { useState, useEffect } from "react";
import { Clock, AlertCircle, CreditCard } from "lucide-react";
import { differenceInDays, isAfter } from "date-fns";
import { motion } from "framer-motion";

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
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrialStatus = async () => {
      try {
        const res = await fetch("/api/connections");
        if (res.ok) {
          const data = await res.json();
          // Find connections that are in trial or expired but not paid
          const trialConnections = data.connections.filter((c: Connection) => 
            c.status === "accepted" && 
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
  }, []);

  if (isLoading || connections.length === 0) return null;

  return (
    <div className="space-y-4">
      {connections.map((conn) => {
        const partner = userRole === "student" ? conn.tutor : conn.student;
        const trialEndsAt = new Date(conn.trialEndsAt);
        const now = new Date();
        const daysLeft = differenceInDays(trialEndsAt, now);
        const isExpired = isAfter(now, trialEndsAt);

        if (userRole === "tutor" && !isExpired) return null; // Tutors only see expired trials needing payment

        return (
          <motion.div 
            key={conn._id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-[2rem] border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${
              isExpired 
                ? 'bg-rose-50 border-rose-100' 
                : daysLeft <= 2 
                  ? 'bg-amber-50 border-amber-100' 
                  : 'bg-blue-50 border-blue-100'
            }`}
          >
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                isExpired ? 'bg-rose-100 text-rose-600' : 'bg-white text-blue-600'
              }`}>
                {isExpired ? <AlertCircle size={28} /> : <Clock size={28} />}
              </div>
              <div>
                <h4 className={`text-sm font-black uppercase tracking-tight ${
                  isExpired ? 'text-rose-700' : 'text-blue-900'
                }`}>
                  {isExpired 
                    ? `Trial Expired with ${partner.name}` 
                    : `${daysLeft} Days Remaining in Trial`}
                </h4>
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
                  isExpired ? 'text-rose-600/70' : 'text-blue-600/70'
                }`}>
                  {isExpired 
                    ? "Complete payment to continue learning and messaging" 
                    : `Enjoy your 7-day trial period with ${partner.name}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {userRole === "student" ? (
                <button 
                  className={`flex-grow md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isExpired 
                      ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                  }`}
                >
                  <CreditCard size={16} /> Continue Learning
                </button>
              ) : (
                <div className="px-6 py-3 bg-white/50 rounded-xl border border-rose-200 text-[10px] font-black text-rose-600 uppercase tracking-widest">
                  Awaiting Student Payment
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
