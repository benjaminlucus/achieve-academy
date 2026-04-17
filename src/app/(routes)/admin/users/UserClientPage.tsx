"use client";

import React, { useMemo, useState } from 'react'
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
import { SearchBar } from '@/components/SearchBar';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import AllUsersTable from './AllUsersTable';

const UserClient = ({ users, totalCount }: { users: any[]; totalCount: number }) => {
    const [filters, setFilters] = useState({
        search: "",
        status: "All Status",
    });
    const [page, setPage] = useState(1);

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            user.email.toLowerCase().includes(filters.search.toLowerCase());

        const matchesStatus =
            filters.status === "All Status" ||
            user.status.toLowerCase() === filters.status.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const paginatedUsers = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        const slicedUsers = filteredUsers.slice(start, start + ITEMS_PER_PAGE);
        return slicedUsers;
    }, [page, filteredUsers])

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

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

            <SearchBar
                placeholder="Search by name or email..."
                allStatuses={["All Status", "Student", "Tutor", "Admin"]}
                onSearch={(data) => { setFilters(data); setPage(1); }}
            />

            {filters.status !== "All Status" && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-600">
                    <span>Filtered by:</span> {filters.status}
                </div>
            )}
            {filters.search && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-600">
                    <span className='text-blue-500'>Showing results for </span> {filters.search}
                </div>
            )}
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
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-sm font-medium text-gray-500">No users found matching for your search {filters.search}.</p>
                                </div>
                            )}
                            {paginatedUsers.map((user: any) => (
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
                    <span className="text-xs font-medium text-gray-500">Showing 1 to 5 of {totalCount} entries</span>
                    <div className="flex items-center gap-2">
                        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-black uppercase tracking-widest text-gray-400 cursor-not-allowed">Prev</button>
                        <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 bg-dark-navy text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-sm">Next</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserClient;