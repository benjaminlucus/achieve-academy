"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { getPusherClient } from "@/lib/pusher";
import { getUserChannelName } from "@/lib/realtime-events";

interface RealtimeContextType {
  lastUpdate: Date | null;
  forceRefresh: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({
  children,
  currentUserId,
}: {
  children: ReactNode;
  currentUserId: string;
}) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const forceRefresh = useCallback(() => {
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    try {
      const pusherClient = getPusherClient();
      const channel = pusherClient.subscribe(getUserChannelName(currentUserId));

      channel.bind("user-update", (data: any) => {
        setLastUpdate(new Date());
      });

      return () => {
        pusherClient.unsubscribe(getUserChannelName(currentUserId));
      };
    } catch (err) {
      console.warn("Failed to subscribe to realtime updates:", err);
    }
  }, [currentUserId]);

  return (
    <RealtimeContext.Provider value={{ lastUpdate, forceRefresh }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
}

