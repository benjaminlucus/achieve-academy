"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert, LogOut, Video, Clock } from "lucide-react";

export default function ClassroomPage() {
  const params = useParams<{ type: string; id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [classroomConfig, setClassroomConfig] = useState<any>(null);
  const [waiting, setWaiting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchConfig = async () => {
      try {
        const res = await fetch(`/api/classroom/${params.type}/${params.id}/join`);
        const data = await res.json();

        if (data.waiting) {
          setWaiting(true);
          // Poll every 2 seconds
          interval = setInterval(fetchConfig, 2000);
          return;
        }

        if (!res.ok) {
          setError({
            title: data.error || "Access Denied",
            message: data.message || "You do not have permission to join this classroom at this time.",
          });
          setLoading(false);
          return;
        }

        setWaiting(false);
        setClassroomConfig(data);

        // Start countdown
        const start = new Date(data.startDate);
        const end = new Date(start.getTime() + data.duration * 60 * 1000);
        const updateCountdown = () => {
          const now = new Date();
          const diff = end.getTime() - now.getTime();
          if (diff <= 0) {
            setTimeLeft(0);
            clearInterval(interval);
          } else {
            setTimeLeft(Math.floor(diff / 1000));
          }
        };
        updateCountdown();
        interval = setInterval(updateCountdown, 1000);
      } catch (err) {
        console.error("Failed to load classroom config:", err);
        setError({
          title: "Connection Error",
          message: "Failed to connect to the classroom authorization service. Please check your connection and try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();

    return () => {
      if (interval) clearInterval(interval);
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, [params]);

  useEffect(() => {
    if (!classroomConfig || !jitsiContainerRef.current) return;

    // Load Jitsi External API script dynamically
    const scriptId = "jitsi-external-api-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initJitsi = () => {
      if (!(window as any).JitsiMeetExternalAPI) {
        console.error("Jitsi Meet External API not loaded");
        setError({
          title: "Loading Error",
          message: "Could not initialize Jitsi Meet client library.",
        });
        return;
      }

      // Clean up previous instance if any
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }

      const domain = new URL(classroomConfig.jitsiServer).host;
      const options = {
        roomName: classroomConfig.roomName,
        width: "100%",
        height: "100%",
        parentNode: jitsiContainerRef.current,
        jwt: classroomConfig.jwt || undefined,
        configOverwrite: {
          prejoinPageEnabled: false,
          requireDisplayName: false,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          watermarkDisabled: true,
          disableDeepLinking: true,
          logoClickSafeUrl: false,
          readOnlyNameShare: true,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            "microphone", "camera", "closedcaptions", "desktop", "embedmeeting", "fullscreen",
            "fodeviceselection", "hangup", "profile", "chat", "recording",
            "livestreaming", "etherpad", "sharedvideo", "settings", "raisehand",
            "videoquality", "filmstrip", "invite", "feedback", "stats", "shortcuts",
            "tileview", "videobackgroundblur", "download", "help", "mute-everyone",
            "mute-video-everyone", "security"
          ],
        },
        userInfo: {
          displayName: classroomConfig.user.name,
          email: classroomConfig.user.email,
        },
      };

      try {
        const api = new (window as any).JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;

        // Auto-fill displayName and email
        api.executeCommand("displayName", classroomConfig.user.name);
        api.executeCommand("email", classroomConfig.user.email);

        // Redirect back on hangup
        api.addEventListener("readyToClose", () => {
          router.push("/dashboard");
        });

        api.addEventListener("videoConferenceLeft", () => {
          router.push("/dashboard");
        });
      } catch (err) {
        console.error("Jitsi instantiation error:", err);
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `${classroomConfig.jitsiServer}/external_api.js`;
      script.async = true;
      script.onload = () => {
        initJitsi();
      };
      script.onerror = () => {
        setError({
          title: "Loading Error",
          message: "Failed to load Jitsi Meet classroom client script.",
        });
      };
      document.body.appendChild(script);
    } else {
      // Script is already loaded, initialize directly
      if ((window as any).JitsiMeetExternalAPI) {
        initJitsi();
      } else {
        script.onload = () => {
          initJitsi();
        };
      }
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [classroomConfig, router]);

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center font-sans">
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">
              {waiting ? "Waiting for Tutor" : "Verifying Permissions"}
            </h2>
            <p className="text-sm text-slate-400 font-medium">
              {waiting
                ? "Your tutor hasn't started the session yet. Please wait..."
                : "Securing connection to Ravencrest Academy Classroom..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-[#020617] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-lg bg-[#0F172A] border border-[#8B5CF6]/10 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl space-y-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-[#8B5CF6]"></div>

          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-[1.25rem] flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert size={32} />
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-black text-white uppercase tracking-tight leading-tight">
              {error.title}
            </h2>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              {error.message}
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-[#0F172A] text-white border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all font-bold text-xs uppercase tracking-widest rounded-2xl shadow-lg"
          >
            <ArrowLeft size={16} /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Classroom Active Screen
  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col font-sans select-none">
      {/* Top Header Bar */}
      <header className="h-16 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] flex-shrink-0">
            <Video size={16} />
          </div>
          <span className="text-sm font-black text-white uppercase tracking-wider truncate">
            {classroomConfig?.title || "Tutoring Classroom"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white text-sm font-bold">
            <Clock size={16} className="text-coral" />
            <span>{formatTimeLeft()}</span>
          </div>
          <button
            onClick={() => {
              if (jitsiApiRef.current) {
                jitsiApiRef.current.executeCommand("hangup");
              } else {
                router.push("/dashboard");
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase tracking-widest transition-all rounded-xl shadow-lg"
          >
            <LogOut size={12} /> Leave Class
          </button>
        </div>
      </header>

      {/* Classroom Video Container */}
      <div className="flex-1 w-full bg-[#020617] relative">
        <div ref={jitsiContainerRef} className="w-full h-full" id="jitsi-container"></div>
      </div>
    </div>
  );
}
