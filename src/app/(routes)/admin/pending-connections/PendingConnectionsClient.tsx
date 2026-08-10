"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  UserCheck,
  ArrowLeftRight,
  Mail,
  Phone,
  MessageCircle,
  ExternalLink,
  Clock,
  ShieldCheck,
  User,
  GraduationCap,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { toast, Toaster } from "react-hot-toast";

export interface PendingConnectionUser {
  _id: string;
  name: string;
  email?: string;
  profileImage?: string;
  role?: string;
  country?: string;
  mobile?: string;
  whatsapp?: string;
  mobileVerified?: boolean;
}

export interface PendingConnectionRow {
  _id: string;
  status: string;
  message?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  initiatedBy?: { _id: string; name?: string; role?: string } | null;
  recipient?: { _id: string; name?: string; role?: string };
  direction?: "student-to-tutor" | "tutor-to-student";
  student: PendingConnectionUser;
  tutor: PendingConnectionUser;
}

interface Props {
  initialPending: PendingConnectionRow[];
}

function RoleBadge({ role }: { role?: string }) {
  const isTutor = role === "tutor";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${
        isTutor
          ? "bg-purple-50 text-purple-600 border-purple-100"
          : "bg-blue-50 text-blue-600 border-blue-100"
      }`}
    >
      {isTutor ? <GraduationCap size={10} /> : <User size={10} />}
      {role || "user"}
    </span>
  );
}

function UserCard({
  user,
  label,
  highlight,
}: {
  user: PendingConnectionUser;
  label: "Requester" | "Recipient";
  highlight?: boolean;
}) {
  const initials = (user.name || "??")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const profileLink = user.role
    ? user.role === "tutor"
      ? `/tutors/${user._id}`
      : `/admin/users/${user._id}`
    : `/admin/users/${user._id}`;

  return (
    <div
      className={`flex-1 rounded-2xl p-4 border ${
        highlight
          ? "bg-amber-50/60 border-amber-200"
          : "bg-gray-50/60 border-gray-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 relative">
          {user.profileImage ? (
            <Image
              src={user.profileImage}
              alt={user.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-dark-navy text-white font-black text-sm flex items-center justify-center">
              {initials}
            </div>
          )}
          {label === "Requester" && (
            <span className="absolute -top-1 -left-1 px-1.5 py-0.5 rounded-full bg-coral text-white text-[7px] font-black uppercase tracking-widest border border-white">
              Out
            </span>
          )}
          {label === "Recipient" && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-purple-primary text-white text-[7px] font-black uppercase tracking-widest border border-white">
              In
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-black text-dark-navy uppercase truncate min-w-0">
              {user.name || "Unnamed user"}
            </h4>
            <RoleBadge role={user.role} />
          </div>

          <div className="space-y-1">
            {user.email && (
              <a
                href={`mailto:${user.email}`}
                className="flex items-center gap-1.5 text-[11px] text-steel-blue hover:text-coral font-medium truncate w-full group"
                title={user.email}
              >
                <Mail size={11} className="flex-shrink-0 text-dark-navy/50 group-hover:text-coral" />
                <span className="truncate">{user.email}</span>
              </a>
            )}
            {user.mobile && (
              <div className="flex items-center gap-1.5 text-[11px] text-dark-navy font-bold truncate">
                <Phone size={11} className="flex-shrink-0 text-emerald-600" />
                <a
                  href={`tel:${user.mobile}`}
                  className="hover:text-coral truncate"
                >
                  {user.mobile}
                </a>
                {user.mobileVerified && (
                  <ShieldCheck size={11} className="text-emerald-500 flex-shrink-0" />
                )}
              </div>
            )}
            {user.whatsapp && user.whatsapp !== user.mobile && (
              <div className="flex items-center gap-1.5 text-[11px] text-dark-navy font-bold truncate">
                <MessageCircle size={11} className="flex-shrink-0 text-[#25D366]" />
                <a
                  href={`https://wa.me/${user.whatsapp.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-coral truncate"
                  title={`WhatsApp ${user.whatsapp}`}
                >
                  WA: {user.whatsapp}
                </a>
              </div>
            )}
            {!user.mobile && !user.whatsapp && (
              <p className="text-[10px] text-steel-blue/60 italic">
                No mobile / WhatsApp on file
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200/70">
        <Link
          href={profileLink}
          className="inline-flex items-center gap-1 text-[10px] font-black text-purple-primary uppercase tracking-widest hover:text-coral transition-colors"
        >
          View Profile <ExternalLink size={10} />
        </Link>
      </div>
    </div>
  );
}

export default function PendingConnectionsClient({ initialPending }: Props) {
  const [pending, setPending] = useState<PendingConnectionRow[]>(initialPending);
  const [searchTerm, setSearchTerm] = useState("");
  const [directionFilter, setDirectionFilter] = useState<
    "all" | "student-to-tutor" | "tutor-to-student"
  >("all");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const filtered = pending.filter((row) => {
    const terms = [
      row.student.name,
      row.student.email,
      row.student.mobile,
      row.tutor.name,
      row.tutor.email,
      row.tutor.mobile,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch = !searchTerm || terms.includes(searchTerm.toLowerCase());
    const matchesDir = directionFilter === "all" || row.direction === directionFilter;
    return matchesSearch && matchesDir;
  });

  async function handleAcceptOnBehalf(row: PendingConnectionRow) {
    const recipientName = row.recipient?.name || row.tutor.name;
    const ok = confirm(
      `Accept on behalf of recipient?\n\nYou are accepting this connection request ON BEHALF OF ${recipientName}.\n\nThis action:\n• Changes status to Accepted\n• Starts their 7-day trial\n• Records that an admin performed the acceptance\n\nAre you sure you want to accept this connection request on behalf of ${recipientName}?`
    );
    if (!ok) return;

    setAcceptingId(row._id);
    try {
      const res = await fetch(`/api/admin/connections/${row._id}/accept-on-behalf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setPending((prev) => prev.filter((p) => p._id !== row._id));
          toast.success(
            `Request already ${data.currentStatus || "processed"} — removed from pending list.`
          );
          return;
        }
        toast.error(data.error || "Failed to accept on behalf");
        return;
      }
      setPending((prev) => prev.filter((p) => p._id !== row._id));
      toast.success(
        `Accepted on behalf of ${recipientName}. Both users are now connected.`
      );
    } catch (e) {
      toast.error("Network error — please try again");
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <Toaster />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            placeholder="Search by name, email, or mobile number..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-dark-navy focus:outline-none focus:border-dark-navy/20 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-100 rounded-2xl shadow-sm">
          <Filter size={16} className="text-gray-400" />
          <select
            className="bg-transparent text-xs font-black uppercase tracking-widest text-dark-navy outline-none"
            value={directionFilter}
            onChange={(e) =>
              setDirectionFilter(
                e.target.value as "all" | "student-to-tutor" | "tutor-to-student"
              )
            }
          >
            <option value="all">All directions</option>
            <option value="student-to-tutor">Student → Tutor</option>
            <option value="tutor-to-student">Tutor → Student</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6">
            <UserCheck size={36} />
          </div>
          <h3 className="text-xl font-black text-dark-navy uppercase mb-2">
            {pending.length === 0
              ? "No pending connection requests"
              : "Nothing matches your filters"}
          </h3>
          <p className="text-xs font-bold text-steel-blue uppercase tracking-widest max-w-md mx-auto">
            {pending.length === 0
              ? "Great job — every outstanding request has been handled. New requests will appear here the moment they are sent."
              : "Try clearing the filters or search bar above."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map((row) => {
            const createdAt = new Date(row.createdAt);
            const requesterIsStudent = row.direction === "student-to-tutor";
            const requester = requesterIsStudent ? row.student : row.tutor;
            const recipient = requesterIsStudent ? row.tutor : row.student;
            const accepting = acceptingId === row._id;

            return (
              <div
                key={row._id}
                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                      <Clock size={12} className="text-amber-500" />
                      <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                        Status: Pending
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-dark-navy/80">
                      <span>{requester.role === "tutor" ? "Tutor" : "Student"}</span>
                      <ArrowLeftRight size={14} className="text-coral" />
                      <span>{recipient.role === "tutor" ? "Tutor" : "Student"}</span>
                    </div>

                    <div className="text-[10px] font-bold text-steel-blue uppercase tracking-widest">
                      Sent {format(createdAt, "d MMM yyyy")}
                      <span className="mx-1.5 text-gray-300">·</span>
                      {format(createdAt, "h:mm a")}
                    </div>
                  </div>

                  <button
                    disabled={accepting}
                    onClick={() => handleAcceptOnBehalf(row)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[11px] font-black uppercase tracking-widest hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/15 transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <UserCheck size={14} />
                    {accepting ? "Accepting..." : `Accept on behalf of ${row.recipient?.name || "recipient"}`}
                  </button>
                </div>

                <div className="p-5 sm:p-7 space-y-5">
                  {row.message && (
                    <div className="p-4 rounded-2xl bg-dark-navy/5 border border-dark-navy/10">
                      <p className="text-[9px] font-black text-dark-navy/60 uppercase tracking-[0.18em] mb-2">
                        Personal message from requester
                      </p>
                      <p className="text-sm font-bold text-dark-navy leading-relaxed">
                        "{row.message}"
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col lg:flex-row gap-4">
                    <UserCard user={requester} label="Requester" />
                    <div className="flex lg:flex-col items-center justify-center py-2">
                      <div className="hidden lg:block w-12 h-12 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center shadow-sm">
                        <ArrowLeftRight
                          size={18}
                          className="text-coral"
                        />
                      </div>
                      <div className="lg:hidden flex items-center gap-2 text-coral">
                        <div className="h-0.5 w-6 bg-coral/20" />
                        <ArrowLeftRight size={16} />
                        <div className="h-0.5 w-6 bg-coral/20" />
                      </div>
                    </div>
                    <UserCard user={recipient} label="Recipient" highlight />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
