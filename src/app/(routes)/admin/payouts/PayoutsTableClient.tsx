"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Filter, 
  Eye, 
  CreditCard, 
  Smartphone, 
  Building2,
  X,
  Upload,
  Loader2,
  ExternalLink
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface PayoutTutor {
  tutorId: string;
  name: string;
  email: string;
  profileImage?: string;
  payoutDetails?: {
    method: "JazzCash" | "Easypaisa" | "Bank Transfer";
    accountTitle: string;
    accountNumber: string;
    bankName?: string;
    iban?: string;
  };
  totalEarned: number;
  totalPaid: number;
  balance: number;
  history: any[];
}

export default function PayoutsTableClient() {
  const [payouts, setPayouts] = useState<PayoutTutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTutor, setSelectedTutor] = useState<PayoutTutor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [payoutForm, setPayoutForm] = useState({
    amount: 0,
    transactionId: "",
    screenshot: "",
    notes: ""
  });

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      const res = await fetch("/api/admin/payouts");
      const data = await res.json();
      if (data.success) {
        setPayouts(data.payouts);
      }
    } catch (error) {
      toast.error("Failed to fetch payout data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = (tutor: PayoutTutor) => {
    setSelectedTutor(tutor);
    setPayoutForm({
      amount: tutor.balance,
      transactionId: "",
      screenshot: "",
      notes: ""
    });
    setIsModalOpen(true);
  };

  const submitPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutor) return;
    if (payoutForm.amount <= 0) {
        toast.error("Amount must be greater than 0");
        return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId: selectedTutor.tutorId,
          ...payoutForm
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Payout recorded and tutor notified!");
        setIsModalOpen(false);
        fetchPayouts();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process payout");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredPayouts = payouts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMethodIcon = (method?: string) => {
    switch (method) {
      case "JazzCash":
      case "Easypaisa": return <Smartphone size={16} className="text-emerald-500" />;
      case "Bank Transfer": return <Building2 size={16} className="text-blue-500" />;
      default: return <CreditCard size={16} className="text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-dark-navy" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster />
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            placeholder="Search tutors by name or email..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-dark-navy focus:outline-none focus:border-dark-navy/20 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tutors List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPayouts.map((tutor) => (
          <div key={tutor.tutorId} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              {/* Tutor Info */}
              <div className="flex items-center gap-4 min-w-[250px]">
                <div className="w-16 h-16 rounded-2xl bg-dark-navy flex items-center justify-center text-white font-black text-xl overflow-hidden shadow-inner">
                  {tutor.profileImage ? (
                    <img src={tutor.profileImage} alt={tutor.name || "Tutor"} className="w-full h-full object-cover" />
                  ) : (
                    (tutor.name || "T").charAt(0)
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-black text-dark-navy uppercase tracking-tight">{tutor.name}</h4>
                  <p className="text-[10px] text-steel-blue font-bold uppercase tracking-widest">{tutor.email}</p>
                </div>
              </div>

              {/* Earnings Stats */}
              <div className="grid grid-cols-3 gap-8 flex-grow">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Earned</p>
                  <p className="text-lg font-black text-dark-navy">${tutor.totalEarned.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Already Paid</p>
                  <p className="text-lg font-black text-emerald-600">${tutor.totalPaid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pending Balance</p>
                  <p className="text-lg font-black text-coral">${tutor.balance.toLocaleString()}</p>
                </div>
              </div>

              {/* Payout Details & Action */}
              <div className="flex items-center gap-6">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    {getMethodIcon(tutor.payoutDetails?.method)}
                    <span className="text-[10px] font-black text-dark-navy uppercase tracking-widest">
                      {tutor.payoutDetails?.method || "Not Set"}
                    </span>
                  </div>
                  {tutor.payoutDetails ? (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-steel-blue truncate">Title: {tutor.payoutDetails.accountTitle}</p>
                      <p className="text-[10px] font-bold text-steel-blue truncate">Acc: {tutor.payoutDetails.accountNumber}</p>
                    </div>
                  ) : (
                    <p className="text-[9px] font-bold text-rose-400 uppercase tracking-tight italic">Tutor hasn't added details</p>
                  )}
                </div>

                <button 
                  onClick={() => handleMarkAsPaid(tutor)}
                  disabled={tutor.balance <= 0 || !tutor.payoutDetails}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                    tutor.balance > 0 && tutor.payoutDetails
                    ? 'bg-dark-navy text-white hover:bg-coral' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Mark Paid
                </button>
              </div>
            </div>

            {/* Recent History Preview */}
            {tutor.history.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-50">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-3">Recent Payouts</p>
                <div className="flex flex-wrap gap-3">
                  {tutor.history.map((h: any) => (
                    <div key={h._id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-[9px] font-bold text-steel-blue border border-gray-100">
                      <CheckCircle size={10} className="text-emerald-500" />
                      ${h.payoutAmount} • {new Date(h.paidAt).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredPayouts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
            <p className="text-steel-blue font-bold uppercase tracking-widest">No tutors found matching your search</p>
          </div>
        )}
      </div>

      {/* Payout Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-navy/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-dark-navy/5"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">Process Payout</h2>
                  <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mt-1">For {selectedTutor?.name}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-dark-navy">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={submitPayout} className="p-8 space-y-6">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-6">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Target Account</p>
                  <p className="text-xs font-bold text-dark-navy">
                    {selectedTutor?.payoutDetails?.method}: {selectedTutor?.payoutDetails?.accountNumber}
                  </p>
                  <p className="text-[10px] font-medium text-emerald-600/70 mt-1">Title: {selectedTutor?.payoutDetails?.accountTitle}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Amount to Pay ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="number" 
                      required
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-dark-navy outline-none focus:border-dark-navy/20"
                      value={payoutForm.amount}
                      onChange={(e) => setPayoutForm({...payoutForm, amount: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Transaction ID / Reference</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. TRX-992812"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-dark-navy outline-none focus:border-dark-navy/20"
                    value={payoutForm.transactionId}
                    onChange={(e) => setPayoutForm({...payoutForm, transactionId: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Proof Screenshot URL</label>
                  <div className="relative">
                    <Upload className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Paste image link/screenshot URL"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-dark-navy outline-none focus:border-dark-navy/20"
                      value={payoutForm.screenshot}
                      onChange={(e) => setPayoutForm({...payoutForm, screenshot: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Admin Notes (Optional)</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-dark-navy outline-none focus:border-dark-navy/20 resize-none"
                    rows={3}
                    placeholder="Internal notes about this payout..."
                    value={payoutForm.notes}
                    onChange={(e) => setPayoutForm({...payoutForm, notes: e.target.value})}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-dark-navy text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-coral transition-all shadow-xl shadow-dark-navy/10 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  Confirm & Send Notification
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
