"use client";

import { Menu } from "lucide-react";
import { useAdminSidebar } from "../../contexts/AdminSidebarContext";

export default function MobileAdminMenuTrigger() {
  const { toggleSidebar } = useAdminSidebar();
  return (
    <button
      onClick={toggleSidebar}
      className="lg:hidden p-3 -ml-3 text-dark-navy hover:text-coral transition-all active:scale-95 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100"
      aria-label="Toggle Admin Menu"
    >
      <Menu size={30} strokeWidth={2.5} />
    </button>
  );
}
