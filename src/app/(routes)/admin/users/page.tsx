import React from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  Mail, 
  ShieldAlert, 
  UserCog,
  Eye
} from "lucide-react";
import { getCurrentUser } from "@/lib/utils";
import { redirect } from "next/navigation";

const allUsers = [
  { id: "1", name: "Alex Rivera", email: "alex.r@example.com", role: "Student", status: "Active", joined: "Mar 10, 2024" },
  { id: "2", name: "Sarah Jenkins", email: "sarah.j@example.com", role: "Tutor", status: "Active", joined: "Mar 08, 2024" },
  { id: "3", name: "Maya Chen", email: "maya.c@example.com", role: "Student", status: "Active", joined: "Mar 05, 2024" },
  { id: "4", name: "Jordan Smith", email: "jordan.s@example.com", role: "Tutor", status: "Banned", joined: "Feb 28, 2024" },
  { id: "5", name: "David Wilson", email: "david.w@example.com", role: "Admin", status: "Active", joined: "Jan 15, 2024" },
];

export default async function UsersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">User Management</h2>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Manage all platform members</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-dark-navy text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-coral transition-all shadow-sm">
          <UserPlus size={16} /> Add New User
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-navy/5 text-sm font-medium transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all flex-1 md:flex-none">
            <Filter size={16} /> Filters
          </button>
          <select className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 outline-none hover:bg-gray-50 transition-all flex-1 md:flex-none">
            <option>All Roles</option>
            <option>Student</option>
            <option>Tutor</option>
            <option>Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-dark-navy flex items-center justify-center text-white font-black text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">{user.name}</p>
                        <p className="text-xs font-medium text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${
                      user.role === 'Tutor' 
                        ? 'bg-blue-50 text-blue-600 border-blue-100' 
                        : user.role === 'Admin'
                        ? 'bg-orange-50 text-orange-600 border-orange-100'
                        : 'bg-purple-50 text-purple-600 border-purple-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-tight">
                    {user.joined}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                      user.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="text-[10px] font-black uppercase">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-dark-navy hover:text-white transition-all" title="View Profile">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-coral hover:text-white transition-all" title="Change Role">
                        <UserCog size={16} />
                      </button>
                      <button className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all" title="Ban User">
                        <ShieldAlert size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/10">
           <span className="text-xs font-medium text-gray-500">Showing 1 to 5 of 2,420 entries</span>
           <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-black uppercase tracking-widest text-gray-400 cursor-not-allowed">Prev</button>
              <button className="px-4 py-2 bg-dark-navy text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-sm">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
}
