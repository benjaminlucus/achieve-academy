"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, BookOpen, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

interface UserInfo {
  _id: string;
  name: string;
  profileImage?: string;
  email: string;
}

interface Meeting {
  _id: string;
  studentId: UserInfo;
  tutorId: UserInfo;
  title: string;
  subject: string;
  scheduledStart: string;
  duration: number;
  notes?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "expired";
  roomId?: string;
  joinUrl: string;
  actualDuration?: number;
  paymentStatus?: string;
}

interface EditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
  onSuccess: () => void;
}

export const EditSessionModal = ({
  isOpen,
  onClose,
  meeting,
  onSuccess,
}: EditSessionModalProps) => {
  const [formData, setFormData] = useState({
    title: meeting.title,
    subject: meeting.subject,
    date: format(new Date(meeting.scheduledStart), "yyyy-MM-dd"),
    time: format(new Date(meeting.scheduledStart), "HH:mm"),
    duration: meeting.duration,
    notes: meeting.notes || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const startDateTime = new Date(
        `${formData.date}T${formData.time}`
      );

      const res = await fetch(`/api/meetings/${meeting._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          subject: formData.subject,
          scheduledStart: startDateTime.toISOString(),
          duration: formData.duration,
          notes: formData.notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to edit session");
      }

      toast.success("Session edited successfully!");
      onClose();
      onSuccess();
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
            <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">
              Edit Session
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-dark-navy"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
              Session Title
            </label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                required
                placeholder="e.g. Advanced Calculus Review"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-dark-navy outline-none focus:border-dark-navy/20"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
              Subject
            </label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                required
                placeholder="e.g. Mathematics"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-dark-navy outline-none focus:border-dark-navy/20"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-dark-navy outline-none focus:border-dark-navy/20"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
                Start Time
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="time"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-dark-navy outline-none focus:border-dark-navy/20"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
              Duration
            </label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-dark-navy outline-none focus:border-dark-navy/20"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) })
              }
            >
              <option value={20}>20 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={40}>40 Minutes</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">
              Notes (Optional)
            </label>
            <textarea
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-dark-navy outline-none focus:border-dark-navy/20 resize-none"
              rows={3}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-dark-navy text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-coral transition-all shadow-xl shadow-dark-navy/10 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Calendar size={16} />
            )}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditSessionModal;
