"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const HEARTBEAT_INTERVAL = 60 * 1000; // 1 minute

/**
 * Client-side component that tracks user activity and route changes.
 * Should be rendered once at the app layout level for any authenticated page.
 */
export default function UserActivityTracker({ userId }: { userId?: string | null }) {
  const pathname = usePathname();
  const heartbeatTimer = useRef<any>(null);
  const processedRoute = useRef<string | null>(null);

  const reportActivity = async (eventType: "visit" | "heartbeat" = "visit") => {
    if (!userId) return;
    try {
      await fetch("/api/user-activity/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          lastRoute: pathname || window.location.pathname,
          lastPageVisited: document.title,
        }),
        keepalive: true,
      });
    } catch {
      /* swallow errors - activity tracking is non-critical */
    }
  };

  // Report activity on route change
  useEffect(() => {
    if (!pathname || processedRoute.current === pathname) return;
    processedRoute.current = pathname;
    reportActivity("visit");
  }, [pathname, userId]);

  // Heartbeat every minute
  useEffect(() => {
    if (!userId) return;
    reportActivity("heartbeat");
    heartbeatTimer.current = setInterval(() => {
      reportActivity("heartbeat");
    }, HEARTBEAT_INTERVAL);

    const onUnload = async () => {
      try {
        if (userId) {
          await fetch("/api/user-activity/heartbeat", {
            method: "DELETE",
            keepalive: true,
          });
        }
      } catch {
        /* swallow */
      }
    };

    window.addEventListener("beforeunload", onUnload);
    return () => {
      if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [userId]);

  return null;
}
