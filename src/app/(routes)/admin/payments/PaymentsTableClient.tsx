"use client";

import React, { useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Wallet,
  MoreVertical,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";

interface Payment {
  id: string;
  user: string;
  amount: number;
  commission: number;
  tutorEarning: number;
  status: string;
  date: string;
}

interface Stats {
  totalRevenue: number;
  commissionEarned: number;
  tutorEarnings: number;
  pendingPayouts: number;
}

export default function PaymentsTableClient({ 
  initialPayments, 
  stats 
}: { 
  initialPayments: Payment[], 
  stats: Stats 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const filteredPayments = initialPayments.filter((payment) => {
    const matchesSearch = 
      payment.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "All Status" || payment.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const statsCards = [
    { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "bg-blue-500" },
    { label: "Commission", value: `$${stats.commissionEarned.toFixed(2)}`, icon: TrendingUp, color: "bg-emerald-500" },
    { label: "Tutor Earnings", value: `$${stats.tutorEarnings.toFixed(2)}`, icon: Wallet, color: "bg-amber-500" },
    { label: "Pending Payouts", value: `$${stats.pendingPayouts.toFixed(2)}`, icon: Clock, color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg shadow-${stat.color.split('-')[1]}-200/50`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <SearchBar 
        placeholder="Search payments by user or ID..."
        allStatuses={["All Status", "Paid", "Pending", "Refunded"]}
        onSearch={(data) => {
          setSearchTerm(data.search);
          setSelectedStatus(data.status);
        }}
      />

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Commission</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Earnings</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{payment.id.slice(-8)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-700 uppercase tracking-tight">{payment.user}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-gray-900">${payment.amount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-emerald-600">
                      <ArrowUpRight size={14} />
                      <span className="text-xs font-bold">${payment.commission.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-black text-dark-navy">${payment.tutorEarning.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      payment.status === 'paid' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : payment.status === 'pending'
                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${
                        payment.status === 'paid' ? 'bg-emerald-500' : payment.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-medium text-gray-500">{(new Date(payment.date), "MMM dd, yyyy")}</span>
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
