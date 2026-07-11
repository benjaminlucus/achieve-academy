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
  Loader2,
  Eye,
  X
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
  createdAt?: string;
  updatedAt?: string;
}

interface PaymentSubmissionSectionProps {
  userId: string;
}

const InfoCard = ({ payments }: { payments: Payment[] }) => {
  const mostRecent = payments.length > 0 
    ? [...payments].sort((a, b) => 
      new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
    )[0] : null;
  
  const status = mostRecent?.status || "awaiting_payment";
  
  let heading = "Complete Your Booking";
  let description = "Bookings are confirmed only after payment verification. Upload payment proof below for approval!";
  let StatusIcon = CreditCard;
  let gradient = "from-amber-50 to-orange-50";
  let borderColor = "border-amber-200";
  let iconColor = "text-amber-600";
  let iconBg = "bg-amber-100";

  switch (status) {
    case "submitted":
      heading = "Payment Proof Submitted";
      description = "Thank you! We're reviewing your payment and will confirm within 24 hours.";
      StatusIcon = Clock;
      gradient = "from-blue-50 to-indigo-50";
      borderColor = "border-blue-200";
      iconColor = "text-blue-600";
      iconBg = "bg-blue-100";
      break;
    case "under_review":
      heading = "Payment Under Review";
      description = "Our team is verifying your payment — this usually takes less than 24 hours!";
      StatusIcon = AlertCircle;
      gradient = "from-amber-50 to-yellow-50";
      borderColor = "border-amber-200";
      iconColor = "text-amber-600";
      iconBg = "bg-amber-100";
      break;
    case "confirmed":
    case "paid":
      heading = "Payment Confirmed";
      description = "Great! Your booking is all set — enjoy your sessions!";
      StatusIcon = CheckCircle2;
      gradient = "from-emerald-50 to-green-50";
      borderColor = "border-emerald-200";
      iconColor = "text-emerald-600";
      iconBg = "bg-emerald-100";
      break;
    case "rejected":
      heading = "Payment Rejected";
      description = "Please resubmit with clear proof or contact support for assistance.";
      StatusIcon = XCircle;
      gradient = "from-rose-50 to-red-50";
      borderColor = "border-rose-200";
      iconColor = "text-rose-600";
      iconBg = "bg-rose-100";
      break;
  }
  
  return (
    <div className={`bg-gradient-to-r ${gradient} ${borderColor} p-6 rounded-2xl border`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center ${iconColor} flex-shrink-0`}>
          <StatusIcon size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-dark-navy uppercase tracking-tight mb-1">
            {heading}
          </h3>
          <p className="text-sm text-steel-blue leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

const PaymentDetailsModal = ({ 
  isOpen, 
  onClose, 
  method 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  method: PaymentMethod;
}) => {
  if (!isOpen) return null;
  const details = PAYMENT_METHOD_DETAILS[method];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-black text-dark-navy uppercase tracking-tight">
            {method} Details
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Name</p>
            <p className="font-black text-dark-navy">{details.accountName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {"bankName" in details ? "Account Number" : "Wallet Number"}
            </p>
            <p className="font-black text-dark-navy">{details.accountNumber}</p>
          </div>
          {"bankName" in details && (
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bank</p>
              <p className="font-black text-dark-navy">{details.bankName}</p>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-dark-navy text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-dark-navy/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        setSelectedSession(null);
        setSelectedMonth(1);
        setTransactionId("");
        setNotes("");
        setScreenshotPreview(null);
        setResubmittingPayment(null);
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
      <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
        <Loader2 className="animate-spin text-dark-navy mx-auto mb-4" size={28} />
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InfoCard payments={payments} />

      <div className="bg-white p-6 rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-dark-navy uppercase tracking-tight flex items-center gap-2">
            <Banknote size={18} className="text-coral" />
            Payment Methods
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 text-dark-navy font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-100"
          >
            <Eye size={14} />
            View Details
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(PAYMENT_METHOD_DETAILS).map(([key]) => (
            <div
              key={key}
              onClick={() => setSelectedPaymentMethod(key as PaymentMethod)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPaymentMethod === key 
                  ? "border-coral bg-coral/5" 
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {key === PAYMENT_METHODS.BANK_TRANSFER ? (
                  <Banknote size={18} className="text-coral" />
                ) : (
                  <Smartphone size={18} className="text-coral" />
                )}
                <span className="font-black text-dark-navy uppercase tracking-widest text-sm">
                  {key}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100">
        <h3 className="text-lg font-black text-dark-navy uppercase tracking-tight mb-5 flex items-center gap-2">
          <Upload size={18} className="text-coral" />
          Submit Payment Proof
        </h3>
        
        <div className="space-y-5">
          {!resubmittingPayment && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">
                Select Session
              </label>
              <select
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-coral/30 font-bold text-dark-navy text-sm"
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

          {!resubmittingPayment && selectedSession && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">
                Month Number
              </label>
              <select
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-coral/30 font-bold text-dark-navy text-sm"
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

          <div className="space-y-2">
            <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">
              Transaction ID (Optional)
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-coral/30 font-bold text-dark-navy text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-steel-blue uppercase tracking-[0.2em]">
              Payment Screenshot
            </label>
            <label className="block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleScreenshotChange}
              />
              {screenshotPreview ? (
                <div className="relative p-3 border border-coral/30 bg-coral/5 rounded-xl">
                  <Image
                    src={screenshotPreview}
                    alt="Payment proof"
                    width={350}
                    height={250}
                    className="max-h-48 mx-auto rounded-lg object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setScreenshotPreview(null)}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-gray-50"
                  >
                    <XCircle size={18} className="text-rose-500" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-coral/30 transition-all">
                  <Upload className="mx-auto mb-3 text-gray-400" size={28} />
                  <p className="font-bold text-dark-navy mb-1 text-sm">Click to upload screenshot</p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 5MB)</p>
                </div>
              )}
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!selectedSession && !resubmittingPayment) || !screenshotPreview}
            className="w-full py-4 bg-dark-navy text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-dark-navy/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                Submitting...
              </>
            ) : (
              <>
                <Send size={14} />
                {resubmittingPayment ? "Resubmit" : "Submit Payment Proof"}
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
              className="w-full py-3 border border-gray-200 text-gray-500 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {payments.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100">
          <h3 className="text-lg font-black text-dark-navy uppercase tracking-tight mb-5 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-coral" />
            Payment History
          </h3>
          <div className="space-y-3">
            {payments.map((payment) => {
              const config = getStatusConfig(payment.status);
              const session = sessions.find(s => s._id === payment.session);
              const StatusIcon = config.icon;

              return (
                <div key={payment._id} className="p-4 border border-gray-100 rounded-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="font-black text-dark-navy text-sm">
                        {session?.subject || "Session"} - Month {payment.monthNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session?.tutor.name ? `With ${session.tutor.name}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-black text-dark-navy">
                        ${payment.amount.toFixed(2)}
                      </p>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${config.bg} ${config.color}`}>
                        <StatusIcon size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {payment.status === "rejected" && payment.rejectionReason && (
                    <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                      <p className="text-xs font-bold text-rose-700 flex items-center gap-2">
                        <AlertCircle size={14} />
                        Rejection Reason:
                      </p>
                      <p className="text-xs text-rose-600 mt-1">
                        {payment.rejectionReason}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {payment.screenshot && (
                      <a
                        href={payment.screenshot}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-dark-navy text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-100"
                      >
                        <Download size={12} />
                        View Screenshot
                      </a>
                    )}
                    {payment.status === "rejected" && (
                      <button
                        onClick={() => {
                          setResubmittingPayment(payment);
                          setSelectedSession(session || null);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-coral text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-coral/90"
                      >
                        <Upload size={12} />
                        Resubmit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <PaymentDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        method={selectedPaymentMethod}
      />
    </div>
  );
};
