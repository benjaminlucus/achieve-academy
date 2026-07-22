"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, BookOpen, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerId: string;
  partnerName: string;
  partnerRole: "student" | "tutor";
  myId: string;
}

export const ScheduleSessionModal = ({
  isOpen,
  onClose,
  partnerId,
  partnerName,
  partnerRole,
  myId,
}: ScheduleSessionModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    date: "",
    time: "",
    duration: 40,
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await fetch("/api/connections");
        if (res.ok) {
          const data = await res.json();
          setConnections(data.connections);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (isOpen) fetchConnections();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Find the connection between current user and partner
      const connection = connections.find(
        (conn: any) =>
          (String(conn.student._id) === String(myId) &&
            String(conn.tutor._id) === String(partnerId)) ||
          (String(conn.tutor._id) === String(myId) &&
            String(conn.student._id) === String(partnerId))
      );

      if (!connection) {
        throw new Error("No active connection found");
      }

      const startDateTime = new Date(
        `${formData.date}T${formData.time}`
      );

      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionId: connection._id,
          title: formData.title,
          subject: formData.subject,
          scheduledStart: startDateTime.toISOString(),
          duration: formData.duration,
          notes: formData.notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to schedule session");
      }

      toast.success("Session scheduled successfully!");
      onClose();
      window.location.reload();
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
              Book Session
            </h2>
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mt-1">
              With {partnerName}
            </p>
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
            Book Session
          </button>
        </form>
      </div>
    </div>
  );
};
