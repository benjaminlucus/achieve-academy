import React from "react";

interface DashboardCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export const DashboardCard = ({ title, children, className = "", footer }: DashboardCardProps) => {
  return (
    <div className={`bg-white border-2 border-dark-navy p-6 flex flex-col gap-4 ${className}`}>
      {title && (
        <h3 className="text-sm font-bold uppercase tracking-widest text-steel-blue border-b-2 border-dark-navy/5 pb-2">
          {title}
        </h3>
      )}
      <div className="flex-grow">{children}</div>
      {footer && (
        <div className="mt-4 pt-4 border-t-2 border-dark-navy/5 flex justify-end">
          {footer}
        </div>
      )}
    </div>
  );
};
