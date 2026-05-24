import React from "react";

export default function StudentDashboardLoading() {
  return (
    <div className="bg-slate-950 min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Banner Skeleton */}
        <div className="h-20 bg-white/5 rounded-[1.5rem] w-full" />

        {/* Profile Header Skeleton */}
        <div className="relative">
          <div className="h-64 md:h-80 w-full rounded-[3rem] bg-white/5 border border-white/5" />
          <div className="px-8 md:px-12 -mt-20 md:-mt-24 relative z-10 flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="flex flex-col md:flex-row items-end gap-8">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] bg-slate-950 p-2">
                <div className="w-full h-full rounded-[2rem] bg-white/5" />
              </div>
              <div className="pb-4 space-y-4">
                <div className="h-10 bg-white/5 rounded-2xl w-64" />
                <div className="flex gap-3">
                  <div className="h-8 bg-white/5 rounded-xl w-32" />
                  <div className="h-8 bg-white/5 rounded-xl w-32" />
                </div>
              </div>
            </div>
            <div className="pb-4 h-14 bg-white/5 rounded-2xl w-48" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-white/10 space-y-4">
              <div className="w-14 h-14 bg-white/5 rounded-2xl mx-auto" />
              <div className="h-3 bg-white/5 rounded-full w-20 mx-auto" />
              <div className="h-8 bg-white/5 rounded-xl w-24 mx-auto" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-zinc-900/40 rounded-[3rem] border border-white/10" />
            ))}
          </div>
          <div className="lg:col-span-4 space-y-12">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-96 bg-zinc-900/40 rounded-[3rem] border border-white/10" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
