"use client";

import React, { useState } from "react";
import { MessageSquare, Users, ShieldAlert, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { confirmWhatsAppJoined } from "@/app/(routes)/dashboard/actions";

interface WhatsAppOnboardingProps {
  userId: string;
  hasJoinedInitial: boolean;
  onSuccess: () => void;
}

export function WhatsAppOnboarding({ userId, hasJoinedInitial, onSuccess }: WhatsAppOnboardingProps) {
  const [hasJoined, setHasJoined] = useState(hasJoinedInitial);
  const [isConfirming, setIsConfirming] = useState(false);
  const [dismissedModal, setDismissedModal] = useState(false);

  // Read channel URL from public environment variable (from .env)
  const communityUrl = process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL || "https://whatsapp.com/channel/0029VbDOxJoJUM2RyR3K2T1N";

  const handleJoinClick = () => {
    window.open(communityUrl, "_blank", "noopener,noreferrer");
  };

  const handleConfirmClick = async () => {
    setIsConfirming(true);
    try {
      const res = await confirmWhatsAppJoined(userId);
      if (res.success) {
        toast.success("Welcome to the Ravencrest Academy Community!");
        setHasJoined(true);
        onSuccess();
      } else {
        toast.error(res.error || "Failed to update onboarding status. Please try again.");
      }
    } catch (err: any) {
      console.error("WhatsApp confirmation error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  if (hasJoined) return null;

  return (
    <div className="space-y-6 font-sans">
      {/* Prominent Banner at the top of the dashboard */}
      <div className="bg-[#0F172A] border border-emerald-500/20 p-6 rounded-[2rem] shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500"></div>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <MessageSquare size={22} className="animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              {dismissedModal ? "Join WhatsApp Community Later" : "Mandatory WhatsApp Community Onboarding"}
            </h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Join to receive announcements, payment updates, and session notifications
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={handleJoinClick}
            className="flex-1 md:flex-none px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-500/10"
          >
            Join Community
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={isConfirming}
            className="flex-1 md:flex-none px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest rounded-xl border border-slate-700 transition-all"
          >
            {isConfirming ? "Confirming..." : "I've Joined"}
          </button>
        </div>
      </div>

      {/* Blocking Fullscreen Modal Overlay */}
      {!dismissedModal && (
        <div className="fixed inset-0 z-[999] bg-[#020617]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0F172A] border border-[#8B5CF6]/15 max-w-lg w-full rounded-[2.5rem] p-8 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
            {/* Top color strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-[#8B5CF6]"></div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-[1.25rem] flex items-center justify-center shadow-inner">
                <Users size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  Join the Ravencrest Academy Community
                </h2>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  Mandatory Onboarding Flow
                </p>
              </div>
              <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-md">
                To keep our tutoring ecosystem organized and ensure you receive critical platform notifications, joining the official WhatsApp Community is required. Until you join and confirm, access to your dashboard remains restricted.
              </p>
            </div>

            {/* Benefits Bullet List */}
            <div className="bg-[#020617]/50 rounded-[1.75rem] border border-slate-800 p-6 space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Required to receive:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  "Platform Announcements",
                  "Payment Updates",
                  "Session Notifications",
                  "Important Warnings",
                  "New Feature Releases",
                  "Support Announcements"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300 font-semibold">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleJoinClick}
                className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest border-2 border-emerald-600 hover:bg-emerald-600 hover:border-emerald-700 transition-all rounded-2xl shadow-[2px_2px_0px_0px_rgba(5,150,105,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
              >
                Join WhatsApp Community <ArrowRight size={16} />
              </button>
              
              <button
                onClick={handleConfirmClick}
                disabled={isConfirming}
                className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-[#0F172A] text-white border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all font-bold text-xs uppercase tracking-widest rounded-2xl shadow-lg disabled:opacity-50"
              >
                {isConfirming ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-[#8B5CF6]" /> Confirming...
                  </>
                ) : (
                  "I've Joined"
                )}
              </button>

              <button
                onClick={() => setDismissedModal(true)}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-transparent text-slate-400 hover:text-slate-300 transition-all font-medium text-xs uppercase tracking-widest"
              >
                Join Later
              </button>
            </div>

            <div className="flex justify-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center pt-2">
              <ShieldAlert size={12} className="text-[#8B5CF6]" />
              <span>Clicking "I've Joined" will update your profile status.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
