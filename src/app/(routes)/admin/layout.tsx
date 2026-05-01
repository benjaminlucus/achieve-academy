import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-gray-50/50 mt-20 isolate">
      <AdminSidebar />
      <main className="flex-1 lg:pl-64 p-4 lg:p-8 overflow-y-auto">
        {/* Top Header/Status Bar (optional) */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">Admin Panel</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Welcome back, Admin. System is running normally.
            </p>
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
