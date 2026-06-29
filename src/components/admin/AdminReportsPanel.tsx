"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Video, X, Mail, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import { useChat } from "@/lib/chat-context";
import { sendPersonalizedEmail } from "@/app/(routes)/messages/actions";

interface ReportParticipant {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminReport {
  _id: string;
  reason: string;
  details: string;
  status: string;
  createdAt: string;
  conversationId: string;
  reporter: ReportParticipant | null;
  participants: ReportParticipant[];
}

interface AdminReportsPanelProps {
  zoomConnected: boolean;
}

export default function AdminReportsPanel({ zoomConnected }: AdminReportsPanelProps) {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleTarget, setScheduleTarget] = useState<ReportParticipant | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [emailTarget, setEmailTarget] = useState<ReportParticipant | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [isEmailing, setIsEmailing] = useState(false);
  const { openAdminMonitor } = useChat();

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/admin/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
      }
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReports();
  }, []);

  const resolveReport = async (reportId: string) => {
    const res = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status: "resolved" }),
    });
    if (res.ok) {
      setReports((prev) => prev.filter((r) => r._id !== reportId));
      toast.success("Report resolved");
    } else {
      toast.error("Failed to resolve report");
    }
  };

  const handleScheduleZoom = async () => {
    if (!scheduleTarget || !scheduleDate) {
      toast.error("Select a date and user");
      return;
    }

    setIsScheduling(true);
    try {
      const res = await fetch("/api/admin/schedule-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: scheduleTarget._id,
          scheduledAt: new Date(scheduleDate).toISOString(),
          autoCreateZoom: zoomConnected,
          notes: scheduleNotes || `Follow-up regarding reported conversation`,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to schedule");
      toast.success("Zoom meeting scheduled");
      setScheduleTarget(null);
      setScheduleDate("");
      setScheduleNotes("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailTarget || !emailSubject || !emailContent) {
      toast.error("Please fill in subject and content");
      return;
    }

    setIsEmailing(true);
    try {
      // Create simple HTML for the email
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1f2937;">${emailSubject}</h2>
          <p style="color: #374151; white-space: pre-line;">${emailContent}</p>
        </div>
      `;
      
      const result = await sendPersonalizedEmail({
        toUserId: emailTarget._id,
        subject: emailSubject,
        htmlContent: html,
      });
      
      if (!result.success) throw new Error(result.error);
      
      toast.success("Email sent successfully!");
      setEmailTarget(null);
      setEmailSubject("");
      setEmailContent("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setIsEmailing(false);
    }
  };

  const formatReason = (reason: string) =>
    reason.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
        Loading reports...
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Pending Reports
            </h3>
            <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-widest">
              User-submitted conversation complaints
            </p>
          </div>
          <span className="text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-full uppercase">
            {reports.length} pending
          </span>
        </div>

        {reports.length === 0 ? (
          <div className="p-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            No pending reports
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reports.map((report) => {
              const student = report.participants.find((p) => p.role === "student");
              const tutor = report.participants.find((p) => p.role === "tutor");

              return (
                <div key={report._id} className="p-6 space-y-4 hover:bg-gray-50/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase bg-rose-50 text-rose-600 border border-rose-100 px-2 py-1 rounded-md">
                          {formatReason(report.reason)}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          {new Date(report.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-dark-navy">
                        {student?.name || "?"} ↔ {tutor?.name || "?"}
                      </p>
                      <p className="text-xs text-steel-blue">
                        Reported by {report.reporter?.name || "Unknown"} ({report.reporter?.role})
                      </p>
                      {report.details && (
                        <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 border border-gray-100">
                          {report.details}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          void openAdminMonitor({
                            studentId: student?._id,
                            tutorId: tutor?._id,
                          })
                        }
                        className="px-3 py-2 text-[10px] font-black uppercase tracking-widest bg-dark-navy text-white rounded-xl hover:bg-coral transition-all"
                      >
                        View Chat
                      </button>
                      <button
                        onClick={() => setScheduleTarget(student || report.participants[0])}
                        className="flex items-center gap-1 px-3 py-2 text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-100 transition-all"
                      >
                        <Video size={12} /> Schedule Zoom
                      </button>
                      <button
                        onClick={() => setEmailTarget(student || tutor || report.participants[0])}
                        className="flex items-center gap-1 px-3 py-2 text-[10px] font-black uppercase tracking-widest bg-purple-50 text-purple-600 border border-purple-100 rounded-xl hover:bg-purple-100 transition-all"
                      >
                        <Mail size={12} /> Send Email
                      </button>
                      <button
                        onClick={() => void resolveReport(report._id)}
                        className="flex items-center gap-1 px-3 py-2 text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all"
                      >
                        <CheckCircle size={12} /> Resolve
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {scheduleTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-dark-navy rounded-[2rem] shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-black text-dark-navy uppercase tracking-tight">
                Schedule Zoom
              </h3>
              <button
                onClick={() => setScheduleTarget(null)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-steel-blue mb-4">
              Schedule a meeting with <strong>{scheduleTarget.name}</strong>
              {zoomConnected ? " (auto-create Zoom)" : " — connect Zoom in sidebar first"}
            </p>
            <div className="space-y-3">
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
              />
              <textarea
                placeholder="Notes (optional)"
                value={scheduleNotes}
                onChange={(e) => setScheduleNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold resize-none"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setScheduleTarget(null)}
                className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl text-[10px] font-black uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleScheduleZoom()}
                disabled={isScheduling}
                className="flex-1 py-3 bg-dark-navy text-white rounded-xl text-[10px] font-black uppercase disabled:opacity-50"
              >
                {isScheduling ? "Scheduling..." : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {emailTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-dark-navy rounded-[2rem] shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-black text-dark-navy uppercase tracking-tight">
                Send Personalized Email
              </h3>
              <button
                onClick={() => setEmailTarget(null)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-steel-blue mb-4">
              Send an email to <strong>{emailTarget.name}</strong> ({emailTarget.email})
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Email Subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
              />
              <textarea
                placeholder="Email Content"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold resize-none"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEmailTarget(null)}
                className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl text-[10px] font-black uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSendEmail()}
                disabled={isEmailing}
                className="flex-1 py-3 bg-dark-navy text-white rounded-xl text-[10px] font-black uppercase disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isEmailing ? "Sending..." : (
                  <>
                    <Send size={12} /> Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
