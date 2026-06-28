"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/lib/chat-context";

interface AdminChatInitializerProps {
  adminUser: { _id: string; role: string } | null;
}

export default function AdminChatInitializer({
  adminUser,
}: AdminChatInitializerProps) {
  const { setCurrentUser } = useChat();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (adminUser && !initializedRef.current) {
      setCurrentUser(adminUser);
      initializedRef.current = true;
    }
  }, [adminUser, setCurrentUser]);

  return null;
}
