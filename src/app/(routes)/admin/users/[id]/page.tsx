"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Clock,
  MapPin,
  Users,
  MessageSquare,
  DollarSign,
  Eye,
  Edit,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  Video,
  ShieldAlert,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";

type UserDetails = {
  user: any;
  profile: any;
  connections: any[];
  sessions: any[];
  payments: any[];
  payouts: any[];
  meetings: any[];
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account");
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);
  const [isResettingWhatsApp, setIsResettingWhatsApp] = useState(false);

  const handleResetWhatsApp = async () => {
    setIsResettingWhatsApp(true);
    try {
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-whatsapp" }),
      });
      if (res.ok) {
        toast.success("WhatsApp onboarding status reset successfully!");
        const resData = await fetch(`/api/admin/users/${params.id}`);
        if (resData.ok) {
          const json = await resData.json();
          setData(json);
        }
      } else {
        toast.error("Failed to reset WhatsApp status");
      }
    } catch (error) {
      console.error("Error resetting WhatsApp status:", error);
      toast.error("Error resetting WhatsApp status");
    } finally {
      setIsResettingWhatsApp(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/admin/users/${params.id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) fetchData();
  }, [params.id]);

  const handleBlockUser = async () => {
    if (!blockReason.trim()) return;
    
    setIsBlocking(true);
    try {
      const res = await fetch(`/api/admin/users/${params.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "blocked", blockReason: blockReason.trim() }),
      });
      if (res.ok) {
        setShowBlockModal(false);
        setBlockReason("");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error blocking user:", error);
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${params.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "verified" }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-dark-navy" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-bold text-steel-blue">User not found</p>
      </div>
    );
  }

  const tabs = [
    { id: "account", label: "Account Info", icon: User },
    { id: "connections", label: "Connections", icon: Users },
    { id: "academic", label: "Academic", icon: Calendar },
    { id: "sessions", label: "Sessions", icon: Clock },
    { id: "payments", label: "Payments", icon: DollarSign },
    { id: "meetings", label: "Meetings", icon: Video },
  ];

  return (
    <div className="space-y-8">
      <Toaster />
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-50 text-steel-blue rounded-xl hover:bg-gray-100 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-dark-navy uppercase tracking-tight">
            {data.user.name}
          </h1>
          <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest">
            {data.user.email} • {data.user.role.toUpperCase()}
          </p>
        </div>

        <div className="flex gap-3">
          {data.user.status !== "blocked" ? (
            <button
              onClick={() => setShowBlockModal(true)}
              className="px-6 py-3 bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-widest rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all"
            >
              Block User
            </button>
          ) : (
            <button
              onClick={handleUnblockUser}
              className="px-6 py-3 bg-emerald-50 text-emerald-600 font-black text-[10px] uppercase tracking-widest rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all"
            >
              Unblock User
            </button>
          )}
        </div>
      </div>

      {/* Block Reason Banner if blocked */}
      {data.user.status === "blocked" && data.user.blockReason && (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-[2rem]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 flex-shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="font-black text-rose-800 uppercase tracking-tight">User is Blocked</h3>
              <p className="text-sm text-rose-700 mt-2 leading-relaxed">
                <span className="font-bold">Reason:</span> {data.user.blockReason}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* User Header */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-dark-navy/5 shadow-sm flex flex-col md:flex-row items-start gap-8">
        <div className="w-24 h-24 rounded-[2rem] bg-dark-navy flex items-center justify-center text-3xl font-black text-white overflow-hidden">
          {data.user.profileImage ? (
            <Image
              src={data.user.profileImage}
              alt={data.user.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            data.user.name.charAt(0)
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap gap-4">
            <span
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                data.user.status === "verified"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : data.user.status === "blocked"
                  ? "bg-rose-50 text-rose-600 border-rose-100"
                  : "bg-amber-50 text-amber-600 border-amber-100"
              }`}
            >
              {data.user.status}
            </span>
            <span
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                data.user.role === "tutor"
                  ? "bg-blue-50 text-blue-600 border-blue-100"
                  : data.user.role === "admin"
                  ? "bg-orange-50 text-orange-600 border-orange-100"
                  : "bg-purple-50 text-purple-600 border-purple-100"
              }`}
            >
              {data.user.role}
            </span>
            <span
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                data.user.isOnboarded
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-gray-50 text-gray-500 border-gray-100"
              }`}
            >
              {data.user.isOnboarded ? "Onboarded" : "Not Onboarded"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 bg-white rounded-t-[2.5rem] px-8 py-4">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-dark-navy text-white"
                    : "text-steel-blue hover:bg-gray-50"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-[2.5rem] border-t border-gray-50 p-8">
        {activeTab === "account" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <h3 className="text-sm font-black text-dark-navy uppercase tracking-widest flex items-center gap-3">
                <User size={18} />
                Basic Information
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <span className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
                    Name
                  </span>
                  <span className="text-sm font-bold text-dark-navy">
                    {data.user.name}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <span className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
                    Email
                  </span>
                  <span className="text-sm font-bold text-dark-navy">
                    {data.user.email}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <span className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
                    Timezone
                  </span>
                  <span className="text-sm font-bold text-dark-navy">
                    {data.user.timezone || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <span className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
                    Country
                  </span>
                  <span className="text-sm font-bold text-dark-navy">
                    {data.user.country || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <span className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
                    Registration Date
                  </span>
                  <span className="text-sm font-bold text-dark-navy">
                    {new Date(data.user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <span className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
                    Last Login
                  </span>
                  <span className="text-sm font-bold text-dark-navy">
                    {data.user.lastLogin
                      ? new Date(data.user.lastLogin).toLocaleString()
                      : "Never"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <span className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
                    WhatsApp Onboarding
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold uppercase ${data.user.hasJoinedWhatsAppCommunity ? "text-emerald-600" : "text-amber-600"}`}>
                      {data.user.hasJoinedWhatsAppCommunity ? "Joined" : "Not Joined"}
                    </span>
                    {data.user.hasJoinedWhatsAppCommunity && (
                      <button
                        onClick={handleResetWhatsApp}
                        disabled={isResettingWhatsApp}
                        className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-100 transition-all disabled:opacity-50"
                      >
                        Reset Status
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-sm font-black text-dark-navy uppercase tracking-widest flex items-center gap-3">
                <Shield size={18} />
                Verification & Payout Info
              </h3>

              {data.profile?.payoutDetails && (
                <div className="p-6 bg-gray-50 rounded-2xl space-y-4">
                  <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
                    Payout Method
                  </p>
                  <p className="text-sm font-bold text-dark-navy">
                    {data.profile.payoutDetails.method}
                  </p>
                  {data.profile.payoutDetails.accountTitle && (
                    <p className="text-xs text-steel-blue">
                      Account Title: {data.profile.payoutDetails.accountTitle}
                    </p>
                  )}
                  {data.profile.payoutDetails.accountNumber && (
                    <p className="text-xs text-steel-blue">
                      Account Number: {data.profile.payoutDetails.accountNumber}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "connections" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-6 bg-gray-50 rounded-2xl text-center">
                <p className="text-2xl font-black text-dark-navy">
                  {data.connections.length}
                </p>
                <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
                  Total Connections
                </p>
              </div>
              <div className="p-6 bg-amber-50 rounded-2xl text-center">
                <p className="text-2xl font-black text-amber-600">
                  {
                    data.connections.filter((c) => c.status === "pending")
                      .length
                  }
                </p>
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                  Pending
                </p>
              </div>
              <div className="p-6 bg-emerald-50 rounded-2xl text-center">
                <p className="text-2xl font-black text-emerald-600">
                  {
                    data.connections.filter((c) => c.status === "accepted")
                      .length
                  }
                </p>
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                  Accepted
                </p>
              </div>
              <div className="p-6 bg-rose-50 rounded-2xl text-center">
                <p className="text-2xl font-black text-rose-600">
                  {
                    data.connections.filter((c) => c.status === "rejected")
                      .length
                  }
                </p>
                <p className="text-[10px] font-black text-rose-700 uppercase tracking-widest">
                  Rejected
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {data.connections.map((conn) => {
                const otherUser =
                  data.user.role === "student" ? conn.tutor : conn.student;
                return (
                  <Link
                    key={conn._id}
                    href={`/admin/users/${otherUser._id}`}
                    className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-dark-navy flex items-center justify-center text-white font-black text-sm">
                        {otherUser.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-dark-navy">
                          {otherUser.name}
                        </p>
                        <p className="text-xs text-steel-blue">
                          {otherUser.email}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        conn.status === "accepted"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : conn.status === "pending"
                          ? "bg-amber-50 text-amber-600 border-amber-100"
                          : "bg-rose-50 text-rose-600 border-rose-100"
                      }`}
                    >
                      {conn.status}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "academic" && (
          <div className="space-y-8">
            {data.user.role === "tutor" && data.profile && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
                    Subjects
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(data.profile.subjects || []).map((subject: string) => (
                      <span
                        key={subject}
                        className="px-4 py-2 bg-dark-navy text-white text-[10px] font-black uppercase rounded-xl"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
                    Experience & Rate
                  </h4>
                  <p className="text-lg font-black text-dark-navy">
                    {data.profile.experienceYears} Years Experience
                  </p>
                  <p className="text-lg font-black text-coral">
                    ${data.profile.hourlyRate}/hr
                  </p>
                </div>
              </div>
            )}

            {data.user.role === "student" && data.profile && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
                    Subjects
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(data.profile.subjects || []).map((subject: string) => (
                      <span
                        key={subject}
                        className="px-4 py-2 bg-purple-600 text-white text-[10px] font-black uppercase rounded-xl"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                {data.profile.learningGoals && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
                      Learning Goals
                    </h4>
                    <p className="text-sm text-dark-navy">
                      {data.profile.learningGoals}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-3">
            {data.sessions.map((session) => {
              const otherUser =
                data.user.role === "student" ? session.tutor : session.student;
              return (
                <div
                  key={session._id}
                  className="p-6 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-bold text-dark-navy">
                        {otherUser?.name || "Unknown User"}
                      </p>
                      <p className="text-xs text-steel-blue">
                        {session.subject}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        session.status === "completed"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : session.status === "active"
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : "bg-rose-50 text-rose-600 border-rose-100"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-steel-blue">Start:</span>{" "}
                      {new Date(session.startDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-steel-blue">Rate:</span> $
                      {session.rate}/hr
                    </div>
                    {session.meetingLink && (
                      <div className="col-span-2">
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-coral font-bold"
                        >
                          Join Session →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-8">
            {data.user.role === "tutor" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-6 bg-gray-50 rounded-2xl text-center">
                  <p className="text-2xl font-black text-dark-navy">
                    $
                    {data.payments
                      .reduce((acc: number, p: any) => acc + p.tutorEarning, 0)
                      .toFixed(2)}
                  </p>
                  <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
                    Total Earnings
                  </p>
                </div>
                <div className="p-6 bg-emerald-50 rounded-2xl text-center">
                  <p className="text-2xl font-black text-emerald-600">
                    $
                    {data.payouts
                      .filter((p: any) => p.status === "paid")
                      .reduce((acc: number, p: any) => acc + p.payoutAmount, 0)
                      .toFixed(2)}
                  </p>
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                    Paid Out
                  </p>
                </div>
              </div>
            )}

            <h4 className="text-sm font-black text-dark-navy uppercase tracking-widest">
              Transaction History
            </h4>
            <div className="space-y-3">
              {data.payments.map((payment) => (
                <div
                  key={payment._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
                >
                  <div>
                    <p className="text-sm font-bold text-dark-navy">
                      Payment #{payment._id.slice(-8)}
                    </p>
                    <p className="text-xs text-steel-blue">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-dark-navy">
                      ${payment.amount.toFixed(2)}
                    </p>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${
                        payment.status === "paid"
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "meetings" && (
          <div className="space-y-3">
            {data.meetings.map((meeting) => {
              const otherUser =
                data.user.role === "student" ? meeting.tutor : meeting.student;
              return (
                <div
                  key={meeting._id}
                  className="p-6 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-bold text-dark-navy">
                        {meeting.title}
                      </p>
                      <p className="text-xs text-steel-blue">
                        with {otherUser?.name}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        meeting.status === "scheduled"
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : meeting.status === "completed"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-rose-50 text-rose-600 border-rose-100"
                      }`}
                    >
                      {meeting.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4">
                    <div>
                      <span className="text-steel-blue">Date:</span>{" "}
                      {new Date(meeting.date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-steel-blue">Time:</span> {meeting.time}
                    </div>
                    <div className="col-span-2">
                      <a
                        href={meeting.joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-coral font-bold"
                      >
                        Join Meeting →
                      </a>
                    </div>
                  </div>
                  {meeting.notes && (
                    <p className="text-xs text-steel-blue italic">{meeting.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Block Reason Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-dark-navy uppercase tracking-tight">
                Block User
              </h3>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason("");
                }}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Reason for Blocking
                </label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  rows={4}
                  placeholder="Enter the reason why this user is being blocked..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-dark-navy focus:outline-none focus:border-coral transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowBlockModal(false);
                    setBlockReason("");
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockUser}
                  disabled={isBlocking || !blockReason.trim()}
                  className="flex-1 py-3 bg-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-rose-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isBlocking ? (
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
  );
}
