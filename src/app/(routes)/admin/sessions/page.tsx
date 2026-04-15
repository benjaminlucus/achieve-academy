import React from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  DollarSign, 
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock3,
  XCircle,
  GraduationCap
} from "lucide-react";
import { getCurrentUser } from "@/lib/utils";
import { redirect } from "next/navigation";

const allSessions = [
  { id: "S101", student: "Alex Rivera", tutor: "Dr. Sarah Jenkins", subject: "Physics", date: "Mar 20, 2024", time: "10:00 AM", status: "Scheduled", price: "$45.00" },
  { id: "S102", student: "Maya Chen", tutor: "James Wilson", subject: "English", date: "Mar 18, 2024", time: "02:00 PM", status: "Completed", price: "$35.00" },
  { id: "S103", student: "Jordan Smith", tutor: "Elena Rodriguez", subject: "Spanish", date: "Mar 15, 2024", time: "11:30 AM", status: "Cancelled", price: "$30.00" },
  { id: "S104", student: "Alex Rivera", tutor: "Dr. Sarah Jenkins", subject: "Mathematics", date: "Mar 12, 2024", time: "09:00 AM", status: "Completed", price: "$45.00" },
];

export default async function SessionsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Sessions Management</h2>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Monitor and manage all tutoring sessions</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search sessions..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-navy/5 text-sm font-medium transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all flex-1 md:flex-none">
            <Filter size={16} /> Filters
          </button>
          <select className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 outline-none hover:bg-gray-50 transition-all flex-1 md:flex-none">
            <option>All Status</option>
            <option>Scheduled</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID & Subject</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student / Tutor</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Price</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-dark-navy/5 text-dark-navy border border-dark-navy/10">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-900 uppercase tracking-widest">{session.id}</p>
                        <p className="text-sm font-bold text-gray-700 uppercase tracking-tight">{session.subject}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-coral" />
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-tight">{session.student}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap size={12} className="text-gray-400" />
                        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">{session.tutor}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-xs font-bold text-gray-600 uppercase tracking-tight">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-gray-400" /> {session.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-gray-400" /> {session.time}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-black text-gray-900 tracking-widest">{session.price}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                      session.status === 'Completed' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : session.status === 'Cancelled'
                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {session.status === 'Completed' && <CheckCircle2 size={12} />}
                      {session.status === 'Cancelled' && <XCircle size={12} />}
                      {session.status === 'Scheduled' && <Clock3 size={12} />}
                      <span className="text-[10px] font-black uppercase tracking-widest">{session.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-dark-navy transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
