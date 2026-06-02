import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SidebarTrigger from "@/components/admin/SidebarTrigger";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50/50 isolate">
      <AdminSidebar />
      <main className="flex-1 lg:pl-72 p-4 md:p-8 lg:p-12 overflow-y-auto">
        {/* Top Header/Status Bar */}
        <header className="mb-8 md:mb-14 flex flex-col md:flex-row md:items-center justify-between gap-6 pt-16 lg:pt-0">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="space-y-2 md:space-y-3">
              <h1 className="text-3xl md:text-4xl font-black text-dark-navy tracking-tight uppercase">Admin Panel</h1>
              <p className="text-[10px] md:text-[11px] font-black text-steel-blue uppercase tracking-[0.2em] md:tracking-[0.4em] leading-relaxed">
                Welcome back, Admin. System is running normally.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-gray-900">Administrator</span>
                <span className="text-xs font-medium text-gray-500 italic">Super User</span>
             </div>
             <div className="w-10 h-10 bg-dark-navy rounded-xl border border-gray-100 flex items-center justify-center text-white font-black">
                A
             </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
