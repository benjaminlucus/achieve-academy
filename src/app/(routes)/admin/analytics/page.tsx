import { getCurrentUser, getAdminStatistics } from "@/lib/utils";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { BarChart3, Calendar, LineChart, PieChart, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { userId } = await auth();
  const user = await getCurrentUser(userId || undefined);

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  const data = await getAdminStatistics();
  const { analytics } = data;

  const maxRevenue = Math.max(...analytics.revenueByMonth, 1);
  const maxSessions = Math.max(...analytics.sessionsByMonth, 1);

  const renderRevenueBars = () => {
    return analytics.revenueByMonth.map((val: number, i: number) => {
      const height = (val / maxRevenue) * 100;
      return (
        <div key={i} className="flex-1 bg-gray-50 hover:bg-coral/20 transition-colors rounded-t-lg group relative" style={{ height: `${height}%` }}>
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark-navy text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap">
            ${val.toLocaleString()}
          </div>
        </div>
      );
    });
  };

  const renderSessionBars = () => {
    return analytics.sessionsByMonth.map((val: number, i: number) => {
      const height = (val / maxSessions) * 100;
      return (
        <div key={i} className="flex-1 bg-dark-navy/5 hover:bg-dark-navy/10 transition-colors rounded-xl flex flex-col items-center justify-end group relative" style={{ height: `${height}%` }}>
          <div className={`w-full rounded-xl transition-all ${height > 50 ? 'bg-coral shadow-lg' : 'bg-dark-navy'}`} style={{ height: `${height}%` }}></div>
          <div className="absolute -top-8 bg-gray-900 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap">
            {val} sessions
          </div>
        </div>
      );
    });
  };

  const renderSubjectList = () => {
    const total = analytics.popularSubjects.reduce((acc: number, s: any) => acc + s.count, 0) || 1;
    return analytics.popularSubjects.map((sub: any, i: number) => {
      const percentage = Math.round((sub.count / total) * 100);
      return (
        <div key={i} className="space-y-2">
           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-gray-600">{sub.name}</span>
              <span className="text-gray-900">{sub.count} Sessions</span>
           </div>
           <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
              <div className={`h-full ${i % 2 === 0 ? 'bg-dark-navy' : 'bg-coral'} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }} />
           </div>
        </div>
      );
    });
  };

  const studentPercentage = Math.round((analytics.userDistribution.students / (data.totalUsers || 1)) * 100);
  const tutorPercentage = 100 - studentPercentage;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Platform Analytics</h2>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Growth and performance insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Chart */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-80">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Revenue Overview</h3>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                  <TrendingUp size={12} /> Real-time Earnings
                </p>
             </div>
             <LineChart className="text-gray-300" size={24} />
          </div>
          <div className="flex-grow flex items-end gap-2">
             {renderRevenueBars()}
          </div>
          <div className="flex justify-between mt-4 px-2 text-[8px] font-black text-gray-400 uppercase tracking-widest">
             {analytics.monthNames.map((m: string) => <span key={m}>{m}</span>)}
          </div>
        </div>

        {/* Sessions Activity */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-80">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Sessions Activity</h3>
                <p className="text-[10px] font-bold text-dark-navy uppercase tracking-widest flex items-center gap-1 mt-1">
                  <Calendar size={12} /> Monthly Volume
                </p>
             </div>
             <BarChart3 className="text-gray-300" size={24} />
          </div>
          <div className="flex-grow flex items-end gap-2">
             {renderSessionBars()}
          </div>
          <div className="flex justify-between mt-4 px-2 text-[8px] font-black text-gray-400 uppercase tracking-widest">
             {analytics.monthNames.map((m: string) => <span key={m}>{m}</span>)}
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-80">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">User Distribution</h3>
             <PieChart className="text-gray-300" size={24} />
           </div>
           <div className="flex-grow flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border-[20px] border-dark-navy relative flex items-center justify-center shadow-inner">
                 <div className="absolute inset-0 rounded-full border-[20px] border-coral border-t-transparent border-r-transparent -rotate-45" style={{ borderTopColor: 'transparent', borderRightColor: 'transparent', transform: `rotate(${studentPercentage * 3.6}deg)` }} />
                 <div className="text-center">
                    <p className="text-2xl font-black text-gray-900">{data.totalUsers}</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total Users</p>
                 </div>
              </div>
           </div>
           <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-dark-navy rounded-full" />
                 <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Students ({studentPercentage}%)</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-coral rounded-full" />
                 <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Tutors ({tutorPercentage}%)</span>
              </div>
           </div>
        </div>

        {/* Popular Subjects */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-80">
           <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">Popular Subjects</h3>
           <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
              {analytics.popularSubjects.length > 0 ? renderSubjectList() : (
                <div className="h-full flex items-center justify-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  No session data available
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
}
