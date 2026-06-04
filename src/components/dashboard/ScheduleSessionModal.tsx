"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, BookOpen, DollarSign, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerId: string;
  partnerName: string;
  partnerRole: "student" | "tutor";
  myId: string;
}

export const ScheduleSessionModal = ({ isOpen, onClose, partnerId, partnerName, partnerRole, myId }: ScheduleSessionModalProps) => {
  const [formData, setFormData] = useState({
    startDate: "",
    startTime: "",
    subject: "",
    duration: 60,
    frequency: "weekly",
    rate: 0,
    notes: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: partnerRole === "student" ? partnerId : myId,
          tutorId: partnerRole === "tutor" ? partnerId : myId,
          startDate: startDateTime.toISOString(),
          subject: formData.subject,
          duration: formData.duration,
          frequency: formData.frequency,
          rate: formData.rate,
          notes: formData.notes
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to schedule session");
      }

      toast.success("Session scheduled successfully!");
      onClose();
      window.location.reload(); // Simple way to refresh the list
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-navy/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-dark-navy/5">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">Schedule Session</h2>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mt-1">With {partnerName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-dark-navy">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="date" 
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-dark-navy outline-none focus:border-dark-navy/20"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Time</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="time" 
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-dark-navy outline-none focus:border-dark-navy/20"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Subject</label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                required
                placeholder="e.g. Advanced Mathematics"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-dark-navy outline-none focus:border-dark-navy/20"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Frequency</label>
              <select 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-dark-navy outline-none focus:border-dark-navy/20"
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
              >
                <option value="once">One-time</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Duration (Min)</label>
              <input 
                type="number" 
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-dark-navy outline-none focus:border-dark-navy/20"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Rate (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="number" 
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-dark-navy outline-none focus:border-dark-navy/20"
                value={formData.rate}
                onChange={(e) => setFormData({...formData, rate: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Notes (Optional)</label>
            <textarea 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-dark-navy outline-none focus:border-dark-navy/20 resize-none"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-dark-navy text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-coral transition-all shadow-xl shadow-dark-navy/10 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
            Schedule Session
          </button>
        </form>
      </div>
    </div>
  );
};
