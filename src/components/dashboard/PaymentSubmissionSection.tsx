"use client";

import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Upload, 
  Download,
  Send,
  Loader2
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { submitPaymentProof } from "@/app/(routes)/dashboard/actions";
import { PAYMENT_METHODS, PAYMENT_METHOD_DETAILS, PaymentMethod } from "@/lib/constants";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Session {
  _id: string;
  subject: string;
  tutor: User;
  startDate: string;
  rate: number;
  monthsCompleted: number;
}

interface Payment {
  _id: string;
  status: string;
  amount: number;
  monthNumber: number;
  paymentMethod?: string;
  transactionId?: string;
  screenshot?: string;
  rejectionReason?: string;
  history: { action: string; timestamp: string; notes?: string }[];
  session?: string;
}

interface PaymentSubmissionSectionProps {
  userId: string;
}

export const PaymentSubmissionSection = ({ userId }: PaymentSubmissionSectionProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS.BANK_TRANSFER);
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resubmittingPayment, setResubmittingPayment] = useState<Payment | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, paymentsRes] = await Promise.all([
          fetch("/api/sessions"),
          fetch(`/api/payments?studentId=${userId}`)
        ]);
        
        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setSessions(data.sessions || []);
        }
        
        if (paymentsRes.ok) {
          const data = await paymentsRes.json();
          setPayments(data.payments || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedSession) {
      toast.error("Please select a session");
      return;
    }
    if (!screenshotPreview) {
      toast.error("Please upload a payment screenshot");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitPaymentProof({
        paymentId: resubmittingPayment?._id,
        sessionId: selectedSession._id,
        monthNumber: resubmittingPayment ? resubmittingPayment.monthNumber : selectedMonth,
        amount: selectedSession.rate,
        paymentMethod: selectedPaymentMethod,
        transactionId,
        notes,
        screenshot: screenshotPreview
      });

      if (result.success) {
        toast.success("Payment proof submitted successfully!");
        // Reset form
        setSelectedSession(null);
        setSelectedMonth(1);
        setTransactionId("");
        setNotes("");
        setScreenshotPreview(null);
        setResubmittingPayment(null);
        // Refresh payments list
        const paymentsRes = await fetch(`/api/payments?studentId=${userId}`);
        if (paymentsRes.ok) {
          const data = await paymentsRes.json();
          setPayments(data.payments || []);
        }
      } else {
        toast.error(result.error || "Failed to submit payment proof");
      }
    } catch (_error) {
      toast.error("Failed to submit payment proof");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "awaiting_payment":
        return { icon: Clock, color: "text-gray-500", bg: "bg-gray-100", label: "Awaiting Payment" };
      case "submitted":
        return { icon: Clock, color: "text-blue-500", bg: "bg-blue-100", label: "Submitted" };
      case "under_review":
        return { icon: Clock, color: "text-amber-500", bg: "bg-amber-100", label: "Under Review" };
      case "confirmed":
      case "paid":
        return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-100", label: "Confirmed" };
      case "rejected":
        return { icon: XCircle, color: "text-rose-500", bg: "bg-rose-100", label: "Rejected" };
      default:
        return { icon: Clock, color: "text-gray-500", bg: "bg-gray-100", label: status };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 text-center">
        <Loader2 className="animate-spin text-dark-navy mx-auto mb-4" size={32} />
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Info Card */}
      <div className="bg-gradient-to-r from-coral/10 to-amber/10 border border-coral/20 p-8 rounded-[2.5rem]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-coral/20 rounded-2xl flex items-center justify-center text-coral flex-shrink-0">
            <CreditCard size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-dark-navy uppercase tracking-tight mb-2">
              Complete Your Booking
            </h3>
            <p className="text-sm text-steel-blue leading-relaxed">
              Your booking is currently awaiting payment verification. Please transfer the payment using one of the available payment methods below and upload your payment proof. Once our team verifies your payment, you will receive a confirmation email and your booking will become confirmed. Estimated verification time: Within 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100">
        <h3 className="text-xl font-black text-dark-navy uppercase tracking-tight mb-6 flex items-center gap-2">
          <Banknote size={20} className="text-coral" />
          Payment Methods
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(PAYMENT_METHOD_DETAILS).map(([key, details]) => (
        <div
          key={key}
          onClick={() => setSelectedPaymentMethod(key as PaymentMethod)}
          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
            selectedPaymentMethod === key 
              ? "border-coral bg-coral/5" 
              : "border-gray-100 hover:border-coral/30"
          }`}
        >
              <div className="flex items-center gap-3 mb-4">
                {key === PAYMENT_METHODS.BANK_TRANSFER ? (
                  <Banknote size={20} className="text-coral" />
                ) : (
                  <Smartphone size={20} className="text-coral" />
                )}
                <span className="font-black text-dark-navy uppercase tracking-widest text-sm">
                  {key}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-bold text-dark-navy">Account Name:</span> {details.accountName}
                </p>
                <p className="text-gray-600">
                  <span className="font-bold text-dark-navy">
                    {"bankName" in details ? "Account Number" : "Wallet Number"}:
                  </span> {details.accountNumber}
                </p>
                {"bankName" in details && (
                  <p className="text-gray-600">
                    <span className="font-bold text-dark-navy">Bank:</span> {details.bankName}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Payment Proof */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100">
        <h3 className="text-xl font-black text-dark-navy uppercase tracking-tight mb-6 flex items-center gap-2">
          <Upload size={20} className="text-coral" />
          Upload Payment Proof
        </h3>
        
        <div className="space-y-6">
          {/* Session Selector */}
          {!resubmittingPayment && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">
                Select Session
              </label>
              <select
                className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-coral/30 font-bold text-dark-navy"
                value={selectedSession?._id || ""}
                onChange={(e) => {
                  const session = sessions.find(s => s._id === e.target.value);
                  setSelectedSession(session || null);
                }}
              >
                <option value="">-- Select a session --</option>
                {sessions.map((session) => (
                  <option key={session._id} value={session._id}>
                    {session.subject} with {session.tutor.name} - ${session.rate}/month
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Month Selector */}
          {!resubmittingPayment && selectedSession && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">
                Month Number
              </label>
              <select
                className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-coral/30 font-bold text-dark-navy"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    Month {month}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Transaction ID */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">
              Transaction ID (Optional)
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID"
              className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-coral/30 font-bold text-dark-navy"
            />
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes..."
              rows={3}
              className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-coral/30 font-bold text-dark-navy resize-none"
            />
          </div>

          {/* Screenshot Upload */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">
              Upload Payment Screenshot (Required)
            </label>
            <label className="block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleScreenshotChange}
              />
              {screenshotPreview ? (
                <div className="relative p-4 border-2 border-coral/30 bg-coral/5 rounded-2xl">
                  <Image
                    src={screenshotPreview}
                    alt="Payment proof"
                    width={400}
                    height={300}
                    className="max-h-64 mx-auto rounded-xl object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setScreenshotPreview(null)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                  >
                    <XCircle size={20} className="text-rose-500" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-coral/30 transition-all">
                  <Upload className="mx-auto mb-4 text-gray-400" size={32} />
                  <p className="font-bold text-dark-navy mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PNG, JPG or JPEG (Max 5MB)</p>
                </div>
              )}
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!selectedSession && !resubmittingPayment) || !screenshotPreview}
            className="w-full py-5 bg-dark-navy text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-dark-navy/90 transition-all shadow-xl shadow-dark-navy/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} />
                {resubmittingPayment ? "Resubmit Payment Proof" : "Submit Payment Proof"}
              </>
            )}
          </button>

          {resubmittingPayment && (
            <button
              onClick={() => {
                setResubmittingPayment(null);
                setSelectedSession(null);
                setScreenshotPreview(null);
                setTransactionId("");
                setNotes("");
              }}
              className="w-full py-3 border border-gray-200 text-gray-500 font-bold text-[11px] uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Payment Status Cards */}
      {payments.length > 0 && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100">
          <h3 className="text-xl font-black text-dark-navy uppercase tracking-tight mb-6 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-coral" />
            Payment History
          </h3>
          <div className="space-y-4">
            {payments.map((payment) => {
              const config = getStatusConfig(payment.status);
              const session = sessions.find(s => s._id === payment.session);
              const StatusIcon = config.icon;

              return (
                <div key={payment._id} className="p-6 border border-gray-100 rounded-2xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="font-black text-dark-navy">
                        {session?.subject || "Session"} - Month {payment.monthNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {session?.tutor.name ? `With ${session.tutor.name}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xl font-black text-dark-navy">
                        ${payment.amount.toFixed(2)}
                      </p>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${config.bg} ${config.color}`}>
                        <StatusIcon size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {payment.status === "rejected" && payment.rejectionReason && (
                    <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                      <p className="text-sm font-bold text-rose-700 flex items-center gap-2">
                        <AlertCircle size={16} />
                        Rejection Reason:
                      </p>
                      <p className="text-sm text-rose-600 mt-1">
                        {payment.rejectionReason}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {payment.screenshot && (
                      <a
                        href={payment.screenshot}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-dark-navy text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all"
                      >
                        <Download size={14} />
                        View Screenshot
                      </a>
                    )}
                    {payment.status === "rejected" && (
                      <button
                        onClick={() => {
                          setResubmittingPayment(payment);
                          setSelectedSession(session || null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-coral text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-coral/90 transition-all"
                      >
                        <Upload size={14} />
                        Resubmit Payment Proof
                      </button>
                    )}
                  </div>

                  {/* History */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-2">
                      History
                    </p>
                    <div className="space-y-2">
                      {payment.history.slice().reverse().map((entry, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                          <p className="text-gray-600">
                            {entry.action} - {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
