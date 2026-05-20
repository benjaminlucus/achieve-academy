"use client";

import React from "react";
import Link from "next/link";
import { Home, ArrowLeft, Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-coral/5 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose/5 rounded-full -ml-48 -mb-48 blur-3xl animate-pulse" />
      
      <div className="max-w-xl w-full text-center space-y-12 relative z-10">
        <div className="relative inline-block">
          <h1 className="text-[12rem] font-black text-dark-navy leading-none select-none">404</h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12">
            <div className="bg-coral text-white px-6 py-2 rounded-xl text-2xl font-black uppercase tracking-[0.2em] shadow-2xl">
              Lost?
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-dark-navy rounded-[2rem] flex items-center justify-center text-white shadow-2xl animate-bounce">
              <Ghost size={48} />
            </div>
          </div>
          <h2 className="text-4xl font-black text-dark-navy uppercase tracking-tight">Oops! Page Not Found</h2>
          <p className="text-xl text-steel-blue font-medium leading-relaxed max-w-md mx-auto">
            The page you're looking for has either been moved or doesn't exist in our learning universe.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
          <Link 
            href="/" 
            className="w-full sm:w-auto px-10 py-5 bg-dark-navy text-white font-black uppercase tracking-widest rounded-2xl hover:bg-coral transition-all shadow-xl shadow-dark-navy/20 flex items-center justify-center gap-3"
          >
            <Home size={20} /> Back to Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-10 py-5 border-2 border-dark-navy text-dark-navy font-black uppercase tracking-widest rounded-2xl hover:bg-dark-navy hover:text-white transition-all flex items-center justify-center gap-3"
          >
            <ArrowLeft size={20} /> Previous Page
          </button>
        </div>

        <div className="pt-12">
          <p className="text-[10px] font-black text-steel-blue/40 uppercase tracking-[0.4em]">
            Achieve Academy • Navigation Support
          </p>
        </div>
      </div>
    </div>
  );
}
