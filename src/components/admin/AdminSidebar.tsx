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
  X,
  ChevronRight,
  GraduationCap,
  Link as LinkIcon,
  MessageSquare,
  HelpCircle,
  MessageCircle,
  Video,
  Trophy,
  Search
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useAdminSidebar } from "../../contexts/AdminSidebarContext";

const sidebarItems: Array<{
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  countKey?: keyof SidebarCounts;
}> = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin", countKey: "reportsPending" },
  { icon: Search, label: "Tutor Requests", href: "/admin/tutor-requests" },     
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: UserCheck, label: "Tutors Approval", href: "/admin/tutors", countKey: "tutorsPending" },
  { icon: GraduationCap, label: "Students Approval", href: "/admin/students", countKey: "studentsPending" },
  { icon: Calendar, label: "Interviews", href: "/admin/interviews", countKey: "interviewsScheduled" },
  { icon: LinkIcon, label: "Connections", href: "/admin/connections", countKey: "connectionsPending" },
  { icon: MessageSquare, label: "All Messages", href: "/admin/messages" },      
  { icon: Calendar, label: "Sessions", href: "/admin/sessions" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments", countKey: "paymentsPending" },
  { icon: DollarSign, label: "Tutor Payouts", href: "/admin/payouts", countKey: "payoutsPending" },
  { icon: Trophy, label: "Achievements", href: "/admin/achievements" },
  { icon: MessageCircle, label: "Feedbacks", href: "/admin/feedbacks" },        
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: HelpCircle, label: "Admin Guide", href: "/admin/guide" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

interface SidebarCounts {
  tutorsPending: number;
  studentsPending: number;
  interviewsScheduled: number;
  connectionsPending: number;
  paymentsPending: number;
  payoutsPending: number;
  reportsPending: number;
}

interface AdminSidebarProps {
  zoomConnected?: boolean;
}

export default function AdminSidebar({ zoomConnected = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const { isSidebarOpen: isOpen, closeSidebar, toggleSidebar } = useAdminSidebar();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [counts, setCounts] = useState<SidebarCounts | null>(null);
  const { signOut } = useClerk();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/admin/sidebar-counts");
        if (res.ok) {
          setCounts(await res.json());
        }
      } catch {
        // Non-critical — badges stay hidden on failure
      }
    };
    void fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isOpen) {
      closeSidebar();
    }
  }, [pathname, isOpen, closeSidebar]);

  if (!isMounted) return null;

  return (
    <>
      {/* Sidebar Aside */}
      <aside className={`
        fixed inset-y-0 left-0 z-[50] bg-white border-r border-gray-100 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}      
        ${isCollapsed ? 'lg:w-20' : 'w-72 lg:w-72'}
        shadow-2xl lg:shadow-none
      `}
      style={{
        '--sidebar-width': isCollapsed ? '5rem' : '18rem'
      } as React.CSSProperties}>
        <div className="flex flex-col h-full relative">

          {/* Collapse Toggle Button (Desktop Only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-10 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-400 hover:text-deep-black hover:border-deep-black transition-all z-10"
            style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <ChevronRight size={14} />
          </button>

          {/* Logo Section */}
          <div className={`p-6 border-b border-gray-50 transition-all duration-300 flex items-center justify-between ${isCollapsed ? 'px-4' : ''}`}>
            <Link href="/" className="flex items-center gap-3 overflow-hidden"> 
              <div className="w-10 h-10 bg-deep-black rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-deep-black/10">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              {!isCollapsed && (
                <span className="font-black text-gray-900 tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300 uppercase text-sm">
                  Admin Panel
                </span>
              )}
            </Link>

            {/* Mobile Close Button */}
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-deep-black transition-colors"
              onClick={closeSidebar}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-grow p-4 space-y-2 overflow-y-auto custom-scrollbar pt-8 lg:pt-6">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              const badgeCount = item.countKey && counts ? counts[item.countKey] : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all group relative
                    ${isActive
                      ? 'bg-gray-50 text-deep-black shadow-sm border border-gray-100'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}   
                    ${isCollapsed ? 'justify-center px-0' : ''}
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon size={20} className={`flex-shrink-0 ${isActive ? 'text-purple-primary' : 'text-gray-400 group-hover:text-deep-black transition-colors'}`} />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap animate-in fade-in duration-300 uppercase tracking-tight text-[11px] flex-grow">
                      {item.label}
                    </span>
                  )}
                  {badgeCount > 0 && (
                    <span className={`${isCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-purple-primary text-white text-[9px] font-black rounded-full`}>
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 w-1 h-6 bg-purple-primary rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Zoom Connection Section */}
          <div className="p-4 border-t border-gray-50">
            {zoomConnected ? (
              <div className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                {!isCollapsed && (
                  <span className="text-[10px] font-bold uppercase tracking-tight text-emerald-700">
                    Zoom Connected
                  </span>
                )}
              </div>
            ) : (
              <Link
                href="/api/auth/zoom"
                className={`flex items-center gap-3 w-full px-4 py-3 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl transition-all group ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? "Connect Zoom" : ""}
              >
                <Video size={18} className="flex-shrink-0" />
                {!isCollapsed && (
                  <span className="whitespace-nowrap animate-in fade-in duration-300 uppercase tracking-tight text-[11px] font-bold">
                    Connect Zoom
                  </span>
                )}
              </Link>
            )}
          </div>

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
        @media (min-width: 1024px) {
          main.lg\\:pl-72 {
            padding-left: calc(${isCollapsed ? '5rem' : '18rem'} + 3rem) !important;
          }
        }
        main {
          transition: padding-left 0.3s ease-in-out;
        }
      `}</style>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[45] bg-deep-black/20 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}
