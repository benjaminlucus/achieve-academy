"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Calendar, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: UserCheck, label: "Tutors Approval", href: "/admin/tutors" },
  { icon: Calendar, label: "Sessions", href: "/admin/sessions" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const {signOut} = useClerk();

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-100 transition-all duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}>
        <div className="flex flex-col h-full relative">
          {/* Collapse Toggle Button (Desktop Only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:hidden flex absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-400 hover:text-dark-navy shadow-sm z-50 transition-transform duration-300"
            style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <ChevronRight size={14} />
          </button>

          {/* Logo Section */}
          <div className={`p-6 border-b border-gray-50 transition-all duration-300 ${isCollapsed ? 'px-4' : ''}`}>
            <Link href="/" className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 bg-dark-navy rounded-lg flex-shrink-0 flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              {!isCollapsed && (
                <span className="font-bold text-gray-900 tracking-tight whitespace-nowrap animate-in fade-in duration-300">
                  Admin Panel
                </span>
              )}
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-grow p-4 space-y-1 overflow-y-auto custom-scrollbar">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group
                    ${isActive 
                      ? 'bg-gray-50 text-dark-navy shadow-sm border border-gray-100' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                    ${isCollapsed ? 'justify-center px-0' : ''}
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon size={18} className={`flex-shrink-0 ${isActive ? 'text-coral' : 'text-gray-400 group-hover:text-dark-navy transition-colors'}`} />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap animate-in fade-in duration-300">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-gray-50">
            <button 
              onClick={()=> signOut()} 
              className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all group ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? 'Logout' : ''}
            >
              <LogOut size={18} className="flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              {!isCollapsed && <span className="whitespace-nowrap animate-in fade-in duration-300">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Adjust Main Content Padding in Layout based on sidebar state */}
      <style jsx global>{`
        main.lg\\:pl-64 {
          padding-left: ${isCollapsed ? '5rem' : '16rem'} !important;
          transition: padding-left 0.3s ease-in-out;
        }
      `}</style>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
