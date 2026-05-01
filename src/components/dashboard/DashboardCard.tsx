import React from "react";

interface DashboardCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const DashboardCard = ({ children, title, className = "" }: DashboardCardProps) => {
  return (
    <div className={`bg-white border-2 border-dark-navy p-6 shadow-[4px_4px_0px_0px_rgba(43,65,98,1)] ${className}`}>
      {title && (
        <h3 className="text-xl font-bold text-dark-navy mb-6 pb-2 border-b-2 border-dark-navy/10 uppercase tracking-tight">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
