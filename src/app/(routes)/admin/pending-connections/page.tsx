import React from "react";
import { connectDB } from "@/database/connect";
import Connection from "@/database/models/connection.model";
import User from "@/database/models/user.model";
import MobileVerification from "@/database/models/mobile-verification.model";
import { getCurrentUser } from "@/lib/utils";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import PendingConnectionsClient from "./PendingConnectionsClient";

export const dynamic = "force-dynamic";

interface MobileInfo {
  countryCode?: string;
  mobileNumber?: string;
  whatsappNumber?: string;
  whatsappSameAsMobile?: boolean;
  isVerified?: boolean;
}

function fullMobile(mi?: MobileInfo | null) {
  if (!mi) return "";
  const cc = mi.countryCode || "";
  const num = mi.mobileNumber || "";
  if (!num) return "";
  return `${cc}${num}`;
}

function fullWhatsapp(mi?: MobileInfo | null) {
  if (!mi) return "";
  if (mi.whatsappSameAsMobile) return fullMobile(mi);
  const cc = mi.countryCode || "";
  const wa = mi.whatsappNumber || "";
  if (!wa) return "";
  return `${cc}${wa}`;
}

async function getPendingConnections() {
  await connectDB();

  const pending = await Connection.find({ status: "pending" })
    .populate("student", "_id name email profileImage role country")
    .populate("tutor", "_id name email profileImage role country")
    .populate("initiatedBy", "_id name role")
    .sort({ createdAt: -1 })
    .lean();

  if (pending.length === 0) return [];

  const allUserIds = new Set<string>();
  for (const c of pending as any[]) {
    if (c.student && c.student._id) allUserIds.add(String(c.student._id));
    if (c.tutor && c.tutor._id) allUserIds.add(String(c.tutor._id));
  }

  const mobiles = await MobileVerification.find({
    user: { $in: Array.from(allUserIds) },
  }).lean();

  const mobileByUserId: Record<string, MobileInfo> = {};
  for (const m of mobiles as any[]) {
    mobileByUserId[String(m.user)] = {
      countryCode: m.countryCode,
      mobileNumber: m.mobileNumber,
      whatsappNumber: m.whatsappNumber,
      whatsappSameAsMobile: !!m.whatsappSameAsMobile,
      isVerified: !!m.isVerified,
    };
  }

  return (pending as any[]).map((c) => {
    const studentMobile = mobileByUserId[String(c.student._id)] || null;
    const tutorMobile = mobileByUserId[String(c.tutor._id)] || null;
    const recipientId =
      String(c.initiatedBy._id || c.initiatedBy) === String(c.student._id)
        ? c.tutor._id
        : c.student._id;
    const recipientRole =
      recipientId === c.student._id ? c.student.role : c.tutor.role;
    const recipientName =
      recipientId === c.student._id ? c.student.name : c.tutor.name;

    return {
      _id: String(c._id),
      status: c.status,
      message: c.message || "",
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      initiatedBy: c.initiatedBy
        ? {
            _id: String(c.initiatedBy._id || c.initiatedBy),
            name: (c.initiatedBy as any).name,
            role: (c.initiatedBy as any).role,
          }
        : null,
      recipient: {
        _id: String(recipientId),
        role: recipientRole,
        name: recipientName,
      },
      direction:
        String(c.initiatedBy._id || c.initiatedBy) === String(c.student._id)
          ? ("student-to-tutor" as const)
          : ("tutor-to-student" as const),
      student: {
        _id: String(c.student._id),
        name: c.student.name,
        email: c.student.email,
        profileImage: c.student.profileImage,
        role: c.student.role,
        country: c.student.country,
        mobile: fullMobile(studentMobile),
        whatsapp: fullWhatsapp(studentMobile),
        mobileVerified: !!studentMobile?.isVerified,
      },
      tutor: {
        _id: String(c.tutor._id),
        name: c.tutor.name,
        email: c.tutor.email,
        profileImage: c.tutor.profileImage,
        role: c.tutor.role,
        country: c.tutor.country,
        mobile: fullMobile(tutorMobile),
        whatsapp: fullWhatsapp(tutorMobile),
        mobileVerified: !!tutorMobile?.isVerified,
      },
    };
  });
}

export default async function AdminPendingConnectionsPage() {
  const { userId } = await auth();
  const user = await getCurrentUser(userId || undefined);

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  const pending = await getPendingConnections();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-[10px] font-black text-amber-700 uppercase tracking-[0.15em]">
              Follow-up Queue — {pending.length} pending
            </span>
          </div>
          <h2 className="text-xl font-black text-dark-navy tracking-tight uppercase">
            Pending Connection Requests
          </h2>
          <p className="text-xs font-bold text-steel-blue uppercase tracking-widest mt-1">
            Personally follow up and accept outstanding requests on behalf of recipients
          </p>
        </div>
      </div>

      <PendingConnectionsClient initialPending={pending} />
    </div>
  );
}
