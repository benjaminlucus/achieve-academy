import React from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  MoreVertical,
  UserPlus
} from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/utils";
import { redirect } from "next/navigation";

// Mock Recent Users
const recentUsers = [
  { id: "1", name: "Alex Rivera", email: "alex.r@example.com", role: "Student", status: "Active", joined: "2 hours ago" },
  { id: "2", name: "Sarah Jenkins", email: "sarah.j@example.com", role: "Tutor", status: "Pending", joined: "5 hours ago" },
  { id: "3", name: "Maya Chen", email: "maya.c@example.com", role: "Student", status: "Active", joined: "1 day ago" },
  { id: "4", name: "Jordan Smith", email: "jordan.s@example.com", role: "Tutor", status: "Approved", joined: "2 days ago" },
];

// Mock Recent Payments
const recentPayments = [
  { id: "P1", user: "Alex Rivera", amount: "$150.00", commission: "$15.00", status: "Paid", date: "Mar 15, 2024" },
  { id: "P2", user: "Maya Chen", amount: "$80.00", commission: "$8.00", status: "Processing", date: "Mar 14, 2024" },
  { id: "P3", user: "Alex Rivera", amount: "$120.00", commission: "$12.00", status: "Paid", date: "Mar 12, 2024" },
];

export default async function AdminDashboard() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/onboarding");
  }

  if (user.role !== "admin") {
    // If they are a tutor or student, redirect to their dashboard
    if (user.role === "tutor" || user.role === "student") {
      return redirect("/dashboard");
    }
    // Otherwise force onboarding
    return redirect("/onboarding");
  }

  const res = await fetch(`${process.env.NEXT_URL}/api/admin/statistics`, {
    cache: "no-store"
  });

  const data = await res.json();

  const stats = [
    { label: "Total Users", value: data.totalUsers, growth: "+12.5%", isPositive: true, icon: Users, color: "bg-blue-50 text-blue-600 border-blue-100" },
    { label: "Total Tutors", value: data.totalTutors, growth: "+4.2%", isPositive: true, icon: GraduationCap, color: "bg-purple-50 text-purple-600 border-purple-100" },
    { label: "Total Students", value: data.totalStudents, growth: "+14.1%", isPositive: true, icon: BookOpen, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { label: "Total Revenue", value: data.totalRevenue, growth: "+22.4%", isPositive: true, icon: DollarSign, color: "bg-amber-50 text-amber-600 border-amber-100" },
    { label: "Total Sessions", value: data.totalSessions, growth: "-2.5%", isPositive: false, icon: Calendar, color: "bg-rose-50 text-rose-600 border-rose-100" },
  ];
  return (
    <div className="space-y-8 pb-12">

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl border ${stat.color} transition-colors group-hover:bg-white`}>
                <stat.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${stat.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.growth}
              </div>
            </div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</h3>
            <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Recent Users Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full transition-all">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Recent Users</h3>
              <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-widest">Latest signups & updates</p>
            </div>
            <Link href="/admin/users" className="text-xs font-black text-coral uppercase tracking-widest hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-dark-navy flex items-center justify-center text-white text-xs font-black">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">{user.name}</p>
                          <p className="text-xs font-medium text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border ${user.role === 'Tutor' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-[10px] font-black uppercase text-gray-600">{user.status}</span>
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

        {/* Recent Payments Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full transition-all">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Recent Payments</h3>
              <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-widest">Platform transactions</p>
            </div>
            <Link href="/admin/payments" className="text-xs font-black text-coral uppercase tracking-widest hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <DollarSign size={16} />
                        </div>
                        <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">{payment.user}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-gray-900">{payment.amount}</p>
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Comm: {payment.commission}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border ${payment.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">{payment.date}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
