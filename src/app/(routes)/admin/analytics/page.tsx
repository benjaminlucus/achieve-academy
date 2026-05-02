import React from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart,
  LineChart,
  TrendingDown
} from "lucide-react";
import { getCurrentUser } from "@/lib/utils";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Platform Analytics</h2>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Growth and performance insights</p>
        </div>
        <div className="flex items-center gap-2">
           <select className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 outline-none hover:bg-gray-50 transition-all">
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>Year to Date</option>
           </select>
        </div>
      </div>

      {/* Chart Skeletons / Mock Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Chart Mock */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-80">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Revenue Growth</h3>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                  <TrendingUp size={12} /> +15.4% this month
                </p>
             </div>
             <LineChart className="text-gray-300" size={24} />
          </div>
          <div className="flex-grow flex items-end gap-2">
             {[40, 60, 45, 70, 55, 90, 65, 80, 50, 85, 95, 75].map((h, i) => (
               <div key={i} className="flex-1 bg-gray-50 hover:bg-coral/20 transition-colors rounded-t-lg group relative" style={{ height: `${h}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark-navy text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                    ${h * 10}
                  </div>
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-4 px-2 text-[8px] font-black text-gray-400 uppercase tracking-widest">
             <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>

        {/* Sessions Chart Mock */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-80">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Sessions Activity</h3>
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                  <TrendingDown size={12} /> -2.5% vs last month
                </p>
             </div>
             <BarChart3 className="text-gray-300" size={24} />
          </div>
          <div className="flex-grow flex items-end gap-4 px-4">
             {[60, 80, 40, 100].map((h, i) => (
               <div key={i} className="flex-1 bg-dark-navy/5 hover:bg-dark-navy/10 transition-colors rounded-xl flex flex-col items-center justify-end group relative" style={{ height: `${h}%` }}>
                  <div className={`w-full rounded-xl transition-all ${i === 3 ? 'bg-coral shadow-lg' : 'bg-dark-navy'}`} style={{ height: `${h}%` }}></div>
                  <div className="absolute -top-8 bg-gray-900 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                    {h * 5} sessions
                  </div>
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-4 px-8 text-[8px] font-black text-gray-400 uppercase tracking-widest">
             <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
          </div>
        </div>

        {/* User Growth Mock */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-80">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">User Distribution</h3>
             <PieChart className="text-gray-300" size={24} />
           </div>
           <div className="flex-grow flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border-[20px] border-dark-navy relative flex items-center justify-center">
                 <div className="absolute inset-0 rounded-full border-[20px] border-coral border-t-transparent border-r-transparent -rotate-45" />
                 <div className="text-center">
                    <p className="text-2xl font-black text-gray-900">2.4k</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total Users</p>
                 </div>
              </div>
           </div>
           <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-dark-navy rounded-full" />
                 <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Students (85%)</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-coral rounded-full" />
                 <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Tutors (15%)</span>
              </div>
           </div>
        </div>

        {/* Popular Subjects Mock */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-80">
           <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">Popular Subjects</h3>
           <div className="space-y-6 flex-grow overflow-y-auto pr-2">
              {[
                { name: "Mathematics", value: 85, color: "bg-dark-navy" },
                { name: "Physics", value: 65, color: "bg-coral" },
                { name: "English", value: 45, color: "bg-dark-navy" },
                { name: "Computer Science", value: 35, color: "bg-dark-navy" },
              ].map((sub, i) => (
                <div key={i} className="space-y-2">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-gray-600">{sub.name}</span>
                      <span className="text-gray-900">{sub.value}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                      <div className={`h-full ${sub.color} rounded-full transition-all duration-1000`} style={{ width: `${sub.value}%` }} />
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
