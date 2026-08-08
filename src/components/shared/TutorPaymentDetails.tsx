"use client";

import { useState } from "react";
import { Eye, Lock, MessageSquare, ShieldAlert, CheckCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  tutorId: string;
  isStudent: boolean;
  studentId?: string;
}

export default function TutorPaymentDetails({ tutorId, isStudent }: Props) {
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<null | "pending" | "contacted" | "approved" | null>(null);
  const [checked, setChecked] = useState(false);

  const handleCheckExisting = async () => {
    if (checked) return;
    try {
      const res = await fetch(`/api/payment-details-request?tutorId=${tutorId}`);
      if (res.ok) {
        const json = await res.json();
        const open = json.data?.find((d: any) =>
          ["pending", "contacted", "approved"].includes(d.status)
        );
        if (open) {
          setRequestStatus(open.status);
        }
      }
    } catch {
      /* ignore */
    } finally {
      setChecked(true);
    }
  };

  const handleRequest = async () => {
    if (!isStudent) return;
    try {
      setLoading(true);
      handleCheckExisting();
      const res = await fetch("/api/payment-details-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId }),
      });
      const json = await res.json();
      if (res.status === 409 && json.existing) {
        setRequestStatus("pending");
        toast.success("You already have an open request. Admin will contact you shortly.");
        return;
      }
      if (!res.ok) throw new Error(json.error || "Failed");
      setRequestStatus("pending");
      toast.success("Payment details request sent! Admin will securely provide details.");
    } catch {
      toast.error("Failed to send request. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!checked) handleCheckExisting();

  if (requestStatus === "pending" || requestStatus === "contacted") {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-amber-600" />
          <p className="text-sm font-black text-amber-800 uppercase tracking-widest">
            Request Pending
          </p>
        </div>
        <p className="text-sm text-amber-700">
          Your request is under review. Admin will contact you with secure payment details shortly.
        </p>
      </div>
    );
  }

  if (requestStatus === "approved") {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 space-y-2">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-emerald-600" />
        <p className="text-sm font-black text-emerald-800 uppercase tracking-widest">
          Details Approved
        </p>
      </div>
      <p className="text-sm text-emerald-700">
        Admin has approved your request. Admin will provide payment details via a secure channel.
      </p>
    </div>
    )
  }

  return (
    <div className="bg-cream rounded-2xl border border-dark-navy/5 p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-dark-navy/5 flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-steel-blue" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-steel-blue">
            Secure Payment Details
          </h3>
          <p className="text-xs text-dark-navy/60 mt-1">
            This tutor's payment details are not publicly available for security reasons.
          </p>
        </div>
      </div>
      <p className="text-sm text-dark-navy/80 bg-white/80 rounded-xl p-4 font-medium">
        🔒 For your safety &amp; to protect against fraud, Ravencrest Academy does not share payment
        information publicly. To get payment details securely:
      </p>

      {isStudent ? (
        <div className="grid md:grid-cols-2 gap-3">
          <button
            onClick={handleRequest}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-coral text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-coral/90 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            {loading ? "Submitting..." : "Request Payment Details"}
          </button>
          <a
            href="mailto:admin@ravencrestacademy.com?subject=Payment%20Details%20Request"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-dark-navy text-cream font-black text-xs uppercase tracking-widest rounded-xl hover:bg-dark-navy/90 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            Contact Admin
          </a>
        </div>
      ) : (
        <p className="text-xs text-dark-navy/60 italic">
          Only registered students can request payment details securely.
        </p>
      )}
    </div>
  );
}
