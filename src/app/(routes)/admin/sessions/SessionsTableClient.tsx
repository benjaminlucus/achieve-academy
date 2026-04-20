"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  GraduationCap,
  MoreVertical,
  ChevronRight
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";

interface Session {
  id: string;
  student: string;
  tutor: string;
  subject: string;
  date: string;
  time: string;
  status: string;
  price: string;
}

export default function SessionsTableClient({ initialSessions }: { initialSessions: Session[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const filteredSessions = initialSessions.filter((session) => {
    const matchesSearch = 
      session.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.tutor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "All Status" || !selectedStatus || session.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <SearchBar 
        placeholder="Search sessions..."
        allStatuses={["All Status", "Active", "Completed", "Cancelled"]}
        onSearch={(data) => {
          setSearchTerm(data.search);
          setSelectedStatus(data.status);
        }}
      />

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
              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm font-medium text-gray-500">
                    No sessions found
                  </td>
                </tr>
              )}
              {filteredSessions.map((session) => (
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
                    <span className="text-sm font-black text-gray-900 tracking-tight">{session.price}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                      session.status === 'Completed' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : session.status === 'Cancelled'
                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        session.status === 'Completed' ? 'bg-emerald-500' : 
                        session.status === 'Cancelled' ? 'bg-rose-500' : 'bg-blue-500'
                      }`} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{session.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-dark-navy hover:bg-gray-50 rounded-lg transition-all">
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
