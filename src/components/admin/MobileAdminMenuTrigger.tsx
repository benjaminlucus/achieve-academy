"use client";

import { Menu } from "lucide-react";

export default function MobileAdminMenuTrigger() {
  const handleClick = () => {
    console.log("Mobile admin menu trigger clicked - dispatching toggle event!");
    window.dispatchEvent(new CustomEvent('toggle-admin-sidebar'));
  };

  return (
    <button 
      onClick={handleClick}
      className="lg:hidden p-3 -ml-3 text-dark-navy hover:text-coral transition-all active:scale-95 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100"
      aria-label="Toggle Admin Menu"
    >
      <Menu size={30} strokeWidth={2.5} />
    </button>
  );
}
