import React from "react";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock3
} from "lucide-react";
import { getCurrentUser } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function PaymentsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  const res = await fetch(`${process.env.NEXT_URL}/api/admin/payments`, {
    cache: "no-store"
  });

  const data = await res.json();
  console.log(data)

  const paymentStats = [
    { label: "Total Revenue", value: `$${data.stats.totalRevenue}`, growth: "+12.5%", isPositive: true },
    { label: "Commission Earned", value: `$${data.stats.commissionEarned}`, growth: "+8.2%", isPositive: true },
    { label: "Tutor Earnings", value: `$${data.stats.tutorEarnings}`, growth: "+14.1%", isPositive: true },
    { label: "Pending Payouts", value: `$${data.stats.pendingPayouts}`, growth: "-2.5%", isPositive: false },
  ];

  const allPayments = data.payments.slice(0, 5);
  console.log(allPayments)

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Payments Management</h2>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Track revenue, commissions and payouts</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {paymentStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${stat.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stat.growth}
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-navy/5 text-sm font-medium transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all flex-1 md:flex-none">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Platform Comm.</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Tutor Earnings</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allPayments.map((payment: any) => (
                <tr key={payment.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-gray-50 border border-gray-100 text-gray-400">
                        <CreditCard size={12} />
                      </div>
                      <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{payment.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-700 uppercase tracking-tight">{payment.user}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-black text-gray-900 tracking-widest">{payment.amount}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-bold text-emerald-600 tracking-widest">{payment.commission}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-bold text-blue-600 tracking-widest">{payment.earnings}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${payment.status === 'Paid'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : payment.status === 'Failed'
                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                      {payment.status === 'Paid' && <CheckCircle2 size={12} />}
                      {payment.status === 'Processing' && <Clock3 size={12} />}
                      <span className="text-[10px] font-black uppercase tracking-widest">{payment.status}</span>
                    </div>
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
  );
}
