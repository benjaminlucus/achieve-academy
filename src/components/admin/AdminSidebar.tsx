"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Calendar, 
  CreditCard,
  DollarSign,
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  GraduationCap,
  Link as LinkIcon,
  MessageSquare,
  HelpCircle,
  MessageCircle
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: UserCheck, label: "Tutors Approval", href: "/admin/tutors" },
  { icon: GraduationCap, label: "Students Approval", href: "/admin/students" },
  { icon: Calendar, label: "Interviews", href: "/admin/interviews" },
  { icon: LinkIcon, label: "Connections", href: "/admin/connections" },
  { icon: MessageSquare, label: "All Messages", href: "/admin/messages" },
  { icon: Calendar, label: "Sessions", href: "/admin/sessions" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
  { icon: DollarSign, label: "Tutor Payouts", href: "/admin/payouts" },
  { icon: MessageCircle, label: "Feedbacks", href: "/admin/feedbacks" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: HelpCircle, label: "Admin Guide", href: "/admin/guide" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut } = useClerk();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="lg:hidden fixed top-5 left-4 z-[60] p-2 bg-white rounded-xl shadow-md border border-gray-100 text-dark-navy hover:text-coral transition-all active:scale-95"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Aside */}
      <aside className={`
        fixed inset-y-0 left-0 z-[50] bg-white border-r border-gray-100 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'w-72 lg:w-72'}
        shadow-2xl lg:shadow-none
      `}>
        <div className="flex flex-col h-full relative">
          
          {/* Collapse Toggle Button (Desktop Only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-10 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-400 hover:text-dark-navy hover:border-dark-navy shadow-sm z-50 transition-all duration-300"
            style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <ChevronRight size={14} />
          </button>

          {/* Logo Section */}
          <div className={`p-6 border-b border-gray-50 transition-all duration-300 ${isCollapsed ? 'px-4' : ''}`}>
            <Link href="/" className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 bg-dark-navy rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-dark-navy/10">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              {!isCollapsed && (
                <span className="font-black text-gray-900 tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300 uppercase text-sm">
                  Admin Panel
                </span>
              )}
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-grow p-4 space-y-1 overflow-y-auto custom-scrollbar pt-8 lg:pt-6">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group relative
                    ${isActive 
                      ? 'bg-gray-50 text-dark-navy shadow-sm border border-gray-100' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                    ${isCollapsed ? 'justify-center px-0' : ''}
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon size={18} className={`flex-shrink-0 ${isActive ? 'text-coral' : 'text-gray-400 group-hover:text-dark-navy transition-colors'}`} />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap animate-in fade-in duration-300 uppercase tracking-tight text-[11px]">
                      {item.label}
                    </span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 w-1 h-6 bg-coral rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-gray-50">
            <button 
              onClick={()=> signOut()} 
              className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all group ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? 'Logout' : ''}
            >
              <LogOut size={18} className="flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              {!isCollapsed && <span className="whitespace-nowrap animate-in fade-in duration-300 uppercase tracking-tight text-[11px]">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Dynamic Content Spacing */}
      <style jsx global>{`
        :root {
          --sidebar-width: ${isCollapsed ? '5rem' : '18rem'};
        }
        @media (min-width: 1024px) {
          main.lg\\:pl-72 {
            padding-left: calc(var(--sidebar-width) + 3rem) !important;
          }
        }
        main {
          transition: padding-left 0.3s ease-in-out;
        }
      `}</style>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[45] bg-dark-navy/20 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
