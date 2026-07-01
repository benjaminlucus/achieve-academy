import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface VerificationBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VerificationBadge = ({ size = 'md', className = '' }: VerificationBadgeProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  return (
    <CheckCircle2 
      className={`${sizeClasses[size]} text-blue-600 fill-blue-500 text-white drop-shadow-sm ${className}`} 
    />
  );
};
