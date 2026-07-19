"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AdminSidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const AdminSidebarContext = createContext<AdminSidebarContextType | undefined>(
  undefined
);

export function AdminSidebarProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  console.log('AdminSidebarProvider - isSidebarOpen:', isSidebarOpen);

  const toggleSidebar = () => {
    console.log('AdminSidebarProvider - toggleSidebar called');
    setIsSidebarOpen((prev) => !prev);
  };
  const closeSidebar = () => {
    console.log('AdminSidebarProvider - closeSidebar called');
    setIsSidebarOpen(false);
  };

  return (
    <AdminSidebarContext.Provider
      value={{ isSidebarOpen, toggleSidebar, closeSidebar }}
    >
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const context = useContext(AdminSidebarContext);
  if (context === undefined) {
    throw new Error("useAdminSidebar must be used within an AdminSidebarProvider");
  }
  return context;
}
