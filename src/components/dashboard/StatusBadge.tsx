import React from "react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className = "" }: StatusBadgeProps) => {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "paid":
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
      case "assigned":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "inactive":
      case "rejected":
      case "blocked":
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border rounded-sm ${getStatusStyles(status)} ${className}`}>
      {status}
    </span>
  );
};
