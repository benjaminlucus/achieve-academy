"use client";

import { useState } from "react";
import { 
  Search, 
  MessageSquare, 
  UserX, 
  CheckCircle, 
  Clock, 
  Filter,
  MoreVertical,
  CreditCard,
  AlertCircle,
  Plus
} from "lucide-react";
import Image from "next/image";
import { differenceInDays, isAfter } from "date-fns";
import { toast, Toaster } from "react-hot-toast";

interface ConnectionUser {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface Connection {
  _id: string;
  student: ConnectionUser;
  tutor: ConnectionUser;
  status: string;
  subscriptionStatus: string;
  trialEndsAt: string | Date;
}

interface ConnectionsTableClientProps {
  initialConnections: Connection[];
}

export default function ConnectionsTableClient({ initialConnections }: ConnectionsTableClientProps) {
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleUpdateTrial = async (id: string, updates: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/admin/connections/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success("Connection updated successfully");
        // Update local state
        const updated = connections.map((c) => 
          c._id === id ? { ...c, ...updates as Partial<Connection> } : c
        );
        setConnections(updated);
      }
    } catch (_error) {
      toast.error("Failed to update connection");
    }
  };

  const filteredConnections = connections.filter((conn) => {
    const studentName = conn.student?.name || "";
    const tutorName = conn.tutor?.name || "";
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         tutorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || conn.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Toaster />
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            placeholder="Search by student or tutor name..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-dark-navy focus:outline-none focus:border-dark-navy/20 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-100 rounded-2xl shadow-sm">
          <Filter size={16} className="text-gray-400" />
          <select 
            className="bg-transparent text-xs font-black uppercase tracking-widest text-dark-navy outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Accepted</option>
            <option>Rejected</option>
            <option>Blocked</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredConnections.map((conn) => {
          const trialEndsAt = conn.trialEndsAt ? new Date(conn.trialEndsAt) : null;
          const isExpired = trialEndsAt && isAfter(new Date(), trialEndsAt);
          const daysLeft = trialEndsAt ? differenceInDays(trialEndsAt, new Date()) : null;

          return (
            <div key={conn._id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between gap-4">
                {/* Student */}
                <div className="flex-1 flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    {conn.student?.profileImage ? (
                      <Image src={conn.student.profileImage} alt="Student" width={64} height={64} className="w-16 h-16 rounded-2xl object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-dark-navy flex items-center justify-center text-white font-black text-xl">
                        {conn.student?.name?.charAt(0)}
                      </div>
                    )}
                    <span className="absolute -top-2 -left-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded-full border border-blue-100">Student</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-dark-navy uppercase truncate w-full">{conn.student?.name}</h4>
                    <p className="text-[10px] text-steel-blue truncate w-full">{conn.student?.email}</p>
                  </div>
                </div>

                {/* Connection Status & Trial Info */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="h-0.5 w-6 bg-gray-100" />
                    <div className={`p-2 rounded-full border ${
                      conn.status === 'accepted' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                      conn.status === 'pending' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                      'bg-gray-50 text-gray-500 border-gray-100'
                    }`}>
                      {conn.status === 'accepted' ? <CheckCircle size={16} /> : <Clock size={16} />}
                    </div>
                    <div className="h-0.5 w-6 bg-gray-100" />
                  </div>
                  
                  <div className="text-center space-y-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                      conn.status === 'accepted' ? 'text-emerald-500' :
                      conn.status === 'pending' ? 'text-amber-500' :
                      'text-gray-400'
                    }`}>
                      {conn.status}
                    </span>
                    
                    {conn.status === 'accepted' && trialEndsAt && (
                      <div className={`flex items-center justify-center gap-1 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tight ${
                        isExpired && conn.subscriptionStatus !== 'active' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {isExpired && conn.subscriptionStatus !== 'active' ? <AlertCircle size={10} /> : <Clock size={10} />}
                        {isExpired && conn.subscriptionStatus !== 'active' ? 'Expired' : `${daysLeft}d left`}
                      </div>
                    )}
                    
                    {conn.subscriptionStatus === 'active' && (
                      <div className="flex items-center justify-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[8px] font-black uppercase tracking-tight">
                        <CreditCard size={10} /> Paid
                      </div>
                    )}
                  </div>
                </div>

                {/* Tutor */}
                <div className="flex-1 flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    {conn.tutor?.profileImage ? (
                      <Image src={conn.tutor.profileImage} alt="Tutor" width={64} height={64} className="w-16 h-16 rounded-2xl object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-coral flex items-center justify-center text-white font-black text-xl">
                        {conn.tutor?.name?.charAt(0)}
                      </div>
                    )}
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-purple-50 text-purple-600 text-[8px] font-black uppercase rounded-full border border-purple-100">Tutor</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-dark-navy uppercase truncate w-full">{conn.tutor?.name}</h4>
                    <p className="text-[10px] text-steel-blue truncate w-full">{conn.tutor?.email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-dark-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-coral transition-all">
                      <MessageSquare size={14} /> Monitor Chat
                    </button>
                    {isExpired && conn.subscriptionStatus !== 'active' && (
                      <button 
                        onClick={() => handleUpdateTrial(conn._id, { subscriptionStatus: 'active', paymentStatus: 'paid' })}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all"
                      >
                        <CheckCircle size={14} /> Verify Payment
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUpdateTrial(conn._id, { extendDays: 7 })}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                      title="Extend Trial (7 Days)"
                    >
                      <Plus size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Block Connection">
                      <UserX size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-dark-navy hover:bg-gray-50 rounded-lg transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
