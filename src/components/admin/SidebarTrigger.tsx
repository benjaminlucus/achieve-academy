"use client";

import { Menu } from "lucide-react";

export default function SidebarTrigger() {
  return (
    <button 
      onClick={() => window.dispatchEvent(new CustomEvent('toggle-admin-sidebar'))}
      className="lg:hidden p-2 -ml-2 text-dark-navy hover:text-coral transition-all active:scale-95"
      aria-label="Toggle Admin Menu"
    >
      <Menu size={28} strokeWidth={2.5} />
    </button>
  );
}
