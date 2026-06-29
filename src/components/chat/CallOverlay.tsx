"use client";

import React, { useState, useEffect } from "react";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";

interface CallOverlayProps {
  roomName: string;
  token: string;
  serverUrl: string;
  onClose: (durationSeconds: number) => void;
  callerName: string;
}

export default function CallOverlay({
  roomName,
  token,
  serverUrl,
  onClose,
  callerName,
}: CallOverlayProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <LiveKitRoom
      audio={!isMuted}
      video={false}
      token={token}
      serverUrl={serverUrl}
      connect={true}
      onDisconnected={() => onClose(duration)}
      className="fixed inset-0 bg-dark-navy/95 text-white flex flex-col items-center justify-center p-6 z-[80] animate-in fade-in duration-300"
    >
      <RoomAudioRenderer />
      
      <div className="flex-grow flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center animate-ping absolute inset-0 duration-1000" />
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center relative shadow-2xl">
            <Phone size={36} className="text-white" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">
            Voice Call
          </p>
          <h4 className="text-lg font-black uppercase tracking-tight">
            {callerName}
          </h4>
          <p className="text-xs font-bold text-gray-400 font-mono">
            {formatDuration(duration)}
          </p>
        </div>
      </div>

      <div className="w-full max-w-xs flex items-center justify-center gap-6 pb-12">
        {/* Mute Button */}
        <button
          onClick={() => {
            setIsMuted(!isMuted);
          }}
          className={`p-4 rounded-full border-2 transition-all ${
            isMuted
              ? "bg-rose-500/20 border-rose-500 text-rose-500 hover:bg-rose-500/30"
              : "bg-white/10 border-white/20 text-white hover:bg-white/20"
          }`}
          title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* End Call Button */}
        <button
          onClick={() => onClose(duration)}
          className="p-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-all shadow-xl shadow-rose-600/30 hover:scale-105 duration-200"
          title="End Call"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </LiveKitRoom>
  );
}
