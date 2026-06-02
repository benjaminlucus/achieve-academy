import { Eye, ShieldAlert, UserCog } from 'lucide-react';
import React from 'react'

const AllUsersTable = ({ users, totalCount }: { users: any[]; totalCount: number }) => {
    return (
        <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all">
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
                            {users.map((user: any) => (
                                <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-dark-navy flex items-center justify-center text-white font-black text-sm">
                                                {(user.name || "U").charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">{user.name}</p>
                                                <p className="text-xs font-medium text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${user.role.toLocaleLowerCase() === 'tutor'
                                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                                            : user.role.toLocaleLowerCase() === 'admin'
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
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${user.status.toLocaleLowerCase() === "active"
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-rose-50 text-rose-600 border-rose-100'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            <span className="text-[10px] font-black uppercase">{user.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-dark-navy hover:text-white transition-all" title="View Profile">
                                                <Eye size={16} />
                                            </button>
                                            <button className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-dark-navy hover:text-white transition-all" title="Change Role">
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
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {users.map((user: any) => (
                    <div key={user.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-dark-navy flex items-center justify-center text-white font-black text-lg">
                                    {(user.name || "U").charAt(0)}
                                </div>
                                <div>
                                    <p className="text-base font-black text-gray-900 uppercase tracking-tight">{user.name}</p>
                                    <p className="text-xs font-medium text-gray-400">{user.email}</p>
                                </div>
                            </div>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${user.status.toLocaleLowerCase() === "active"
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : 'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <span className="text-[10px] font-black uppercase">{user.status}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</p>
                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${user.role.toLocaleLowerCase() === 'tutor'
                                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                                    : user.role.toLocaleLowerCase() === 'admin'
                                        ? 'bg-orange-50 text-orange-600 border-orange-100'
                                        : 'bg-purple-50 text-purple-600 border-purple-100'
                                    }`}>
                                    {user.role}
                                </span>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined</p>
                                <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">{user.joined}</p>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center gap-2 border-t border-gray-50">
                            <button className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-dark-navy hover:text-white transition-all flex items-center justify-center gap-2">
                                <Eye size={14} /> Profile
                            </button>
                            <button className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-dark-navy hover:text-white transition-all flex items-center justify-center gap-2">
                                <UserCog size={14} /> Role
                            </button>
                            <button className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                                <ShieldAlert size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="bg-white md:bg-gray-50/10 p-6 rounded-3xl border border-gray-100 md:border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Showing 1 to 5 of {totalCount} entries</span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none px-6 py-3 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 cursor-not-allowed">Prev</button>
                    <button className="flex-1 sm:flex-none px-6 py-3 bg-dark-navy text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-dark-navy/10">Next</button>
                </div>
            </div>
        </div>
    )
}

export default AllUsersTable
