"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Clock,
  Wallet,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  Send
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { approvePayment, rejectPayment, sendPersonalizedEmail } from "@/app/(routes)/messages/actions";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface HistoryEntry {
  action: string;
  timestamp: string;
  notes?: string;
  adminId?: string;
}

interface Payment {
  id: string;
  student: User;
  tutor: User;
  amount: number;
  commission: number;
  tutorEarning: number;
  status: string;
  date: string;
  paymentMethod?: string;
  transactionId?: string;
  screenshot?: string;
  notes?: string;
  rejectionReason?: string;
  history: HistoryEntry[];
  monthNumber: number;
  session?: any;
}

interface Stats {
  totalRevenue: number;
  commissionEarned: number;
  tutorEarnings: number;
  pendingPayouts: number;
}

const emailTemplates = [
  {
    name: "Template 1 - Booking Confirmed",
    subject: "Payment Confirmed – Your Booking is Confirmed",
    body: (studentName: string, tutorName: string) => `
Hello ${studentName},

We have successfully received and verified your payment.

Your booking with ${tutorName} has now been confirmed.

Thank you for choosing Encrusted Academy.

Best Regards,
Encrusted Academy Team
`
  },
  {
    name: "Template 2 - Payment Verified",
    subject: "Payment Successfully Verified",
    body: (studentName: string) => `
Hello ${studentName},

Great news!

Your payment has been verified successfully.

Your tutoring session has now been confirmed.

Thank you for learning with Encrusted Academy.

We wish you a wonderful learning experience.

Regards,
Encrusted Academy Team
`
  }
];

export default function PaymentsTableClient({
  initialPayments = [],
  stats = {
    totalRevenue: 0,
    commissionEarned: 0,
    tutorEarnings: 0,
    pendingPayouts: 0
  }
}: {
  initialPayments?: Payment[],
  stats?: Stats
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredPayments = (initialPayments || []).filter((payment) => {
    const matchesSearch =
      payment.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.tutor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "All Status" || payment.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const statsCards = [
    { label: "Total Revenue", value: `$${(stats?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, color: "bg-blue-500" },
    { label: "Commission", value: `$${(stats?.commissionEarned || 0).toFixed(2)}`, icon: TrendingUp, color: "bg-emerald-500" },
    { label: "Tutor Earnings", value: `$${(stats?.tutorEarnings || 0).toFixed(2)}`, icon: Wallet, color: "bg-amber-500" },
    { label: "Pending Payouts", value: `$${(stats?.pendingPayouts || 0).toFixed(2)}`, icon: Clock, color: "bg-rose-500" },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "awaiting_payment": return { icon: Clock, color: "text-gray-500", bg: "bg-gray-100", label: "Awaiting Payment" };
      case "submitted": return { icon: Clock, color: "text-blue-500", bg: "bg-blue-100", label: "Submitted" };
      case "under_review": return { icon: Clock, color: "text-amber-500", bg: "bg-amber-100", label: "Under Review" };
      case "confirmed":
      case "paid": return { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-100", label: "Confirmed" };
      case "rejected": return { icon: XCircle, color: "text-rose-500", bg: "bg-rose-100", label: "Rejected" };
      default: return { icon: Clock, color: "text-gray-500", bg: "bg-gray-100", label: status };
    }
  };

  const handleApprove = async () => {
    if (!selectedPayment) return;
    setIsProcessing(true);
    try {
      const result = await approvePayment(selectedPayment.id, {
        subject: emailSubject,
        htmlContent: `<div style={{ whiteSpace: "pre-line" }}>${emailBody}</div>`
      });
      if (result.success) {
        toast.success("Payment approved and email sent!");
        setApproveModal(false);
        setSelectedPayment(null);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to approve payment");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment) return;
    setIsProcessing(true);
    try {
      const result = await rejectPayment(selectedPayment.id, rejectionReason);
      if (result.success) {
        toast.success("Payment rejected!");
        setRejectModal(false);
        setSelectedPayment(null);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to reject payment");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendEmail = async (payment: Payment) => {
    const subject = emailTemplates[0].subject;
    const body = emailTemplates[0].body(payment.student.name, payment.tutor.name);
    sendPersonalizedEmail({
      toUserId: payment.student._id,
      subject,
      htmlContent: `<div style={{ whiteSpace: "pre-line" }}>${body}</div>`
    }).then((result) => {
      if (result.success) {
        toast.success("Email resent successfully!");
      } else {
        toast.error("Failed to resend email");
      }
    }).catch((err) => {
      console.error(err);
      toast.error("Failed to resend email");
    });
  };

  const openApproveModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setSelectedTemplate(0);
    setEmailSubject(emailTemplates[0].subject);
    setEmailBody(emailTemplates[0].body(payment.student.name, payment.tutor.name));
    setApproveModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <SearchBar
        placeholder="Search payments by user or ID..."
        allStatuses={["All Status", "Awaiting Payment", "Submitted", "Under Review", "Confirmed", "Rejected"]}
        onSearch={(data) => {
          setSearchTerm(data.search);
          setSelectedStatus(data.status);
        }}
      />

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Tutor</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm font-medium text-gray-500">
                    No payments found
                  </td>
                </tr>
              )}
              {filteredPayments.map((payment) => {
                const statusConfig = getStatusConfig(payment.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <tr key={payment.id} className="hover:bg-gray-50/30 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-gray-900">{payment.student?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{payment.student?.email || "N/A"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-gray-900">{payment.tutor?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{payment.tutor?.email || "N/A"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-gray-900">${payment.amount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon size={12} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500">
                        {new Date(payment.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"
                        >
                          <Eye size={12} />
                          View
                        </button>
                        {(payment.status === "submitted" || payment.status === "under_review") && (
                          <>
                            <button
                              onClick={() => openApproveModal(payment)}
                              className="px-3 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"
                            >
                              <CheckCircle size={12} />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setRejectModal(true);
                              }}
                              className="px-3 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"
                            >
                              <XCircle size={12} />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Payment Details Modal */}
      {selectedPayment && !approveModal && !rejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-dark-navy uppercase tracking-tight">
                  Payment Review
                </h3>
                <button onClick={() => setSelectedPayment(null)}>
                  <XCircle size={24} className="text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Student</p>
                  <p className="text-sm font-bold">{selectedPayment.student?.name || "Unknown"}</p>
                  <p className="text-xs text-gray-500">{selectedPayment.student?.email}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tutor</p>
                  <p className="text-sm font-bold">{selectedPayment.tutor?.name || "Unknown"}</p>
                  <p className="text-xs text-gray-500">{selectedPayment.tutor?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</p>
                  <p className="text-xl font-black text-dark-navy">${selectedPayment.amount.toFixed(2)}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Month</p>
                  <p className="text-sm font-bold text-dark-navy">{selectedPayment.monthNumber}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status</p>
                  {(() => {
                    const config = getStatusConfig(selectedPayment.status);
                    const Icon = config.icon;
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.color}`}>
                        <Icon size={12} />
                        {config.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {selectedPayment.paymentMethod && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment Method</p>
                  <p className="text-sm font-bold">{selectedPayment.paymentMethod}</p>
                </div>
              )}

              {selectedPayment.transactionId && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction ID</p>
                  <p className="text-sm font-bold">{selectedPayment.transactionId}</p>
                </div>
              )}

              {selectedPayment.notes && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Notes</p>
                  <p className="text-sm text-gray-600">{selectedPayment.notes}</p>
                </div>
              )}

              {selectedPayment.rejectionReason && (
                <div className="space-y-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-700">Rejection Reason</p>
                  <p className="text-sm text-rose-600">{selectedPayment.rejectionReason}</p>
                </div>
              )}

              {selectedPayment.screenshot && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment Screenshot</p>
                  <Image
                    src={selectedPayment.screenshot}
                    alt="Payment Proof"
                    width={400}
                    height={300}
                    className="w-full max-w-md rounded-xl object-contain border border-gray-100"
                  />
                  <a
                    href={selectedPayment.screenshot}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-[10px] font-black uppercase tracking-widest"
                  >
                    <Download size={14} />
                    Download
                  </a>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment History</p>
                <div className="space-y-2">
                  {selectedPayment.history.map((entry, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                      <div className="text-gray-600">
                        {entry.action} - {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {(selectedPayment.status === "confirmed" || selectedPayment.status === "paid") && (
                <div className="flex justify-end">
                  <button
                    onClick={() => handleResendEmail(selectedPayment)}
                    className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                  >
                    <Send size={14} />
                    Resend Confirmation Email
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approve Payment Modal */}
      {approveModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-dark-navy uppercase tracking-tight">
                  Approve Payment & Send Email
                </h3>
                <button onClick={() => setApproveModal(false)}>
                  <XCircle size={24} className="text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Template</label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold"
                  value={selectedTemplate}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setSelectedTemplate(idx);
                    const template = emailTemplates[idx];
                    setEmailSubject(template.subject);
                    setEmailBody(template.body(selectedPayment.student.name, selectedPayment.tutor.name));
                  }}
                >
                  {emailTemplates.map((template, index) => (
                    <option key={index} value={index}>{template.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Body</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold resize-20"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setApproveModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-[10px] font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Approve & Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Payment Modal */}
      {rejectModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-dark-navy uppercase tracking-tight">
                  Reject Payment
                </h3>
                <button onClick={() => setRejectModal(false)}>
                  <XCircle size={24} className="text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Rejection Reason</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  placeholder="Enter a reason for rejecting the rejection"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setRejectModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-[10px] font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
