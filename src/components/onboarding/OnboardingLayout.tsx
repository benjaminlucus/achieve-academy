'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-dark-navy">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-10"
        style={{ 
          backgroundImage: 'url(/onboarding-bg.png)',
          filter: 'blur(40px) brightness(0.6)' 
        }}
      />
      
      {/* Soft Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-dark-navy/40 to-black/20" />

      {/* Centered Content Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-20 w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-8 md:p-12">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingLayout;
