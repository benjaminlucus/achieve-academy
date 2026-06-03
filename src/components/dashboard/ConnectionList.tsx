"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Calendar, Loader2, Clock, AlertCircle, CreditCard } from "lucide-react";
import { ScheduleSessionModal } from "./ScheduleSessionModal";
import { differenceInDays, isAfter } from "date-fns";

interface ConnectionListProps {
  userRole: "student" | "tutor";
  myId: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Connection {
  _id: string;
  status: string;
  subscriptionStatus: string;
  trialEndsAt?: string | Date;
  student: User;
  tutor: User;
}

export const ConnectionList = ({ userRole, myId }: ConnectionListProps) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchConnections = async () => {
      try {
        const res = await fetch("/api/connections");
        if (res.ok) {
          const data = await res.json();
          // Filter only accepted connections
          setConnections(data.connections.filter((c: Connection) => c.status === "accepted"));
        }
      } catch (error) {
        console.error("Error fetching connections:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConnections();
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-dark-navy" size={32} />
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="bg-white p-10 rounded-[2.5rem] border border-dark-navy/5 text-center space-y-4">
        <p className="text-sm font-bold text-steel-blue uppercase tracking-widest">No Connections Yet</p>
        <p className="text-xs text-steel-blue/60 max-w-xs mx-auto">Browse the directory and connect with {userRole === 'student' ? 'tutors' : 'students'} to start learning.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">Your Connections</h2>
        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          {connections.length} Active
        </span>
      </div>

      <div className="space-y-4">
        {connections.map((conn) => {
          const partner = userRole === "student" ? conn.tutor : conn.student;
          const trialEndsAt = conn.trialEndsAt ? new Date(conn.trialEndsAt) : null;
          const isExpired = trialEndsAt && isAfter(new Date(), trialEndsAt);
          const isPaid = conn.subscriptionStatus === "active";

          return (
            <div key={conn._id} className="bg-white p-6 rounded-[2rem] border border-dark-navy/5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-dark-navy flex items-center justify-center text-white font-black text-lg">
                    {partner.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-dark-navy uppercase tracking-tight">{partner.name}</h4>
                    <p className="text-[10px] text-steel-blue uppercase font-bold tracking-widest">{partner.email}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedPartner(partner)}
                    disabled={!!isExpired && !isPaid}
                    className={`p-3 rounded-xl border transition-all ${
                      isExpired && !isPaid 
                        ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' 
                        : 'bg-coral/5 text-coral border-coral/10 hover:bg-coral hover:text-white'
                    }`}
                    title={isExpired && !isPaid ? "Trial Expired - Payment Required" : "Schedule Session"}
                  >
                    <Calendar size={18} />
                  </button>
                  <button 
                    className={`p-3 rounded-xl border transition-all ${
                      isExpired && !isPaid 
                        ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' 
                        : 'bg-gray-50 text-steel-blue border-dark-navy/5 hover:bg-dark-navy hover:text-white'
                    }`}
                    title={isExpired && !isPaid ? "Trial Expired - Payment Required" : "Message"}
                  >
                    <MessageSquare size={18} />
                  </button>
                </div>
              </div>

              {/* Status Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  {isPaid ? (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[8px] font-black uppercase tracking-tight">
                      <CreditCard size={10} /> Active Subscription
                    </div>
                  ) : trialEndsAt ? (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tight ${
                      isExpired ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {isExpired ? <AlertCircle size={10} /> : <Clock size={10} />}
                      {isExpired ? 'Trial Expired' : `${differenceInDays(trialEndsAt, new Date())} Days Left`}
                    </div>
                  ) : null}
                </div>
                {isExpired && !isPaid && userRole === "student" && (
                  <button className="text-[9px] font-black text-coral uppercase tracking-widest hover:underline">
                    Pay to Unlock
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedPartner && (
        <ScheduleSessionModal 
          isOpen={!!selectedPartner}
          onClose={() => setSelectedPartner(null)}
          partnerId={selectedPartner._id}
          partnerName={selectedPartner.name}
          partnerRole={userRole === "student" ? "tutor" : "student"}
          myId={myId}
        />
      )}
    </div>
  );
};
