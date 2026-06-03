"use client";

import { Menu } from "lucide-react";

export default function MobileAdminMenuTrigger() {
  return (
    <button 
      onClick={() => {
        console.log("Dispatching toggle event");
        window.dispatchEvent(new CustomEvent('toggle-admin-sidebar'));
      }}
      className="lg:hidden p-2 -ml-2 text-dark-navy hover:text-coral transition-all active:scale-95 flex items-center justify-center"
      aria-label="Toggle Admin Menu"
    >
      <Menu size={28} strokeWidth={2.5} />
    </button>
  );
}
