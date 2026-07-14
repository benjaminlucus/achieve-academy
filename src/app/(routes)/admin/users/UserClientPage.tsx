"use client";

import { useMemo, useState } from 'react'
import Link from 'next/link';
import {
    UserPlus,
    ShieldAlert,
    UserCog,
    Eye,
    CheckCircle,
    Loader2,
    Trash2,
} from "lucide-react";
import { SearchBar } from '@/components/SearchBar';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import { CreateUserDialog } from './CreateUserDialog';
import { toast } from 'react-hot-toast';

const UserClient = ({ users, totalCount }: { users: any[]; totalCount: number }) => {
    const [filters, setFilters] = useState({
        search: "",
        status: "All Status",
    });
    const [page, setPage] = useState(1);
    const [open, setOpen] = useState(false);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
    const [blockReasonInput, setBlockReasonInput] = useState<string>("");
    const [showBlockReasonModal, setShowBlockReasonModal] = useState<string | null>(null);

    const handleStatusChange = async (userId: string, newStatus: string, reason?: string) => {
        setUpdatingUserId(userId);
        try {
            const res = await fetch(`/api/admin/users/${userId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, blockReason: reason }),
            });

            if (!res.ok) {
                throw new Error("Failed to update status");
            }

            toast.success(`Status updated to ${newStatus}`);
            window.location.reload();
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setUpdatingUserId(null);
            setShowBlockReasonModal(null);
            setBlockReasonInput("");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user permanently?")) return;
        
        setDeletingUserId(userId);
        try {
            const res = await fetch(`/api/admin/users/${userId}/status`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete user");
            }

            toast.success("User deleted successfully");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to delete user");
        } finally {
            setDeletingUserId(null);
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            user.email.toLowerCase().includes(filters.search.toLowerCase());

        let matchesStatus = true;
        if (filters.status === "Pending Verification") {
            matchesStatus = ["applied", "reviewing", "interview_pending"].includes(user.status.toLowerCase());
        } else if (filters.status === "Scheduled Interview") {
            matchesStatus = user.status.toLowerCase() === "interview_scheduled";
        } else if (filters.status === "Approved") {
            matchesStatus = user.status.toLowerCase() === "verified";
        } else if (filters.status !== "All Status") {
            matchesStatus = user.status.toLowerCase() === filters.status.toLowerCase();
        }

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
                <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-dark-navy text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-coral transition-all shadow-sm">
                    <UserPlus size={16} /> Add New User
                </button>
            </div>

            {/* 2. Create User Dialog */}
            <CreateUserDialog 
                isOpen={open} 
                onClose={() => setOpen(false)} 
                onSuccess={() => {
                    setOpen(false);
                }} 
            />

            {/* Filters & Search */}

            <SearchBar
                placeholder="Search by name or email..."
                allStatuses={["Pending Verification", "Scheduled Interview", "Approved", "Blocked", "All Status"]}
                initialStatus="Pending Verification"
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
            {filteredUsers.length === 0 && (
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                    <p className="text-sm font-medium text-gray-500">No users found matching for your search {filters.search}.</p>
                </div>
            )}

            {filteredUsers.length > 0 && (
                <>
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
                                    {paginatedUsers.map((user: any) => (
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
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${user.status.toLocaleLowerCase() === "verified"
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : user.status.toLocaleLowerCase() === "blocked"
                                                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                        : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${user.status.toLocaleLowerCase() === 'verified' ? 'bg-emerald-500' : user.status.toLocaleLowerCase() === 'blocked' ? 'bg-rose-500' : 'bg-yellow-500'}`} />
                                                    <span className="text-[10px] font-black uppercase">{user.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link href={`/admin/users/${user.id}`} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-dark-navy hover:text-white transition-all" title="View Profile">
                                                        <Eye size={16} />
                                                    </Link>
                                                    {user.status.toLocaleLowerCase() === "blocked" ? (
                                                        <button 
                                                            onClick={() => handleStatusChange(user.id, "verified")}
                                                            disabled={updatingUserId === user.id}
                                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1" 
                                                            title="Unblock User"
                                                        >
                                                            {updatingUserId === user.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-coral hover:text-white transition-all" title="Change Role">
                                                                <UserCog size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => setShowBlockReasonModal(user.id)}
                                                                disabled={updatingUserId === user.id}
                                                                className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1" 
                                                                title="Block User"
                                                            >
                                                                {updatingUserId === user.id ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
                                                            </button>
                                                        </>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        disabled={deletingUserId === user.id}
                                                        className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all" 
                                                        title="Delete User"
                                                    >
                                                        {deletingUserId === user.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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
                        {paginatedUsers.map((user: any) => (
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
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${user.status.toLocaleLowerCase() === "verified"
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        : user.status.toLocaleLowerCase() === "blocked"
                                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                                            : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${user.status.toLocaleLowerCase() === 'verified' ? 'bg-emerald-500' : user.status.toLocaleLowerCase() === 'blocked' ? 'bg-rose-500' : 'bg-yellow-500'}`} />
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

                                <div className="pt-4 grid grid-cols-2 gap-2 border-t border-gray-50">
                                    <Link
                                        href={`/admin/users/${user.id}`}
                                        className="py-3 bg-gray-50 text-gray-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-dark-navy hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Eye size={14} /> Profile
                                    </Link>
                                    {user.status.toLocaleLowerCase() === "blocked" ? (
                                        <button 
                                            onClick={() => handleStatusChange(user.id, "verified")}
                                            disabled={updatingUserId === user.id}
                                            className="py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            {updatingUserId === user.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Unblock
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => setShowBlockReasonModal(user.id)}
                                            disabled={updatingUserId === user.id}
                                            className="py-3 bg-rose-50 text-rose-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            {updatingUserId === user.id ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />} Block
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="bg-white md:bg-gray-50/10 p-6 rounded-3xl border border-gray-100 md:border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Showing 1 to 5 of {totalCount} entries</span>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="flex-1 sm:flex-none px-6 py-3 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 cursor-not-allowed">Prev</button>
                            <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="flex-1 sm:flex-none px-6 py-3 bg-dark-navy text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-dark-navy/10">Next</button>
                        </div>
                    </div>
                </>
            )}

            {/* Block Reason Modal */}
            {showBlockReasonModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-dark-navy uppercase tracking-tight">
                                Block User
                            </h3>
                            <button 
                                onClick={() => setShowBlockReasonModal(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ShieldAlert size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Reason for Blocking
                                </label>
                                <textarea
                                    value={blockReasonInput}
                                    onChange={(e) => setBlockReasonInput(e.target.value)}
                                    rows={4}
                                    placeholder="Enter the reason why this user is being blocked..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-dark-navy focus:outline-none focus:border-coral transition-all resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setShowBlockReasonModal(null);
                                        setBlockReasonInput("");
                                    }}
                                    className="flex-1 py-3 bg-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleStatusChange(showBlockReasonModal, "blocked", blockReasonInput)}
                                    disabled={updatingUserId === showBlockReasonModal || !blockReasonInput.trim()}
                                    className="flex-1 py-3 bg-coral text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-coral/90 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {updatingUserId === showBlockReasonModal ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Blocking...
                                        </>
                                    ) : (
                                        "Confirm Block"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserClient;