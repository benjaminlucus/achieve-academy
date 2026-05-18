import React from "react";
import { CheckCircle2 } from "lucide-react";

interface VerifiedTickProps {
  level?: "none" | "green" | "blue";
  status?: string;
  size?: number;
  className?: string;
}

export const VerifiedTick = ({ level = "none", status, size = 16, className = "" }: VerifiedTickProps) => {
  // If status is approved but level is none, it's a green tick (standard verification)
  const isGreen = level === "green" || (status === "approved" && level === "none");
  const isBlue = level === "blue";

  if (!isGreen && !isBlue) return null;

  return (
    <div className={`inline-flex items-center ${className}`} title={isBlue ? "Senior Verified Member" : "Platform Verified"}>
      <CheckCircle2 
        size={size} 
        className={`${isBlue ? "text-blue-500" : "text-emerald-500"} fill-current bg-white rounded-full`} 
      />
    </div>
  );
};
