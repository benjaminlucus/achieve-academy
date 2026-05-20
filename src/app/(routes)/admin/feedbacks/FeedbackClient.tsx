"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Star, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload, 
  Loader2, 
  X,
  MessageSquare,
  User,
  Shield
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Feedback {
  _id: string;
  userName: string;
  userRole: string;
  rating: number;
  text: string;
  screenshotUrl?: string;
  isPublic: boolean;
  createdAt: string;
}

export default function FeedbackClient() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    userName: "",
    userRole: "Student",
    rating: 5,
    text: "",
    screenshotUrl: "",
    isPublic: true
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch("/api/admin/feedbacks");
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.feedbacks);
      }
    } catch (error) {
      toast.error("Failed to fetch feedbacks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Feedback added successfully");
        setIsModalOpen(false);
        setForm({
          userName: "",
          userRole: "Student",
          rating: 5,
          text: "",
          screenshotUrl: "",
          isPublic: true
        });
        fetchFeedbacks();
      } else {
        toast.error(data.error || "Failed to add feedback");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePublic = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/feedbacks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPublic: !currentStatus })
      });
      if (res.ok) {
        toast.success(`Feedback ${!currentStatus ? 'is now public' : 'is now hidden'}`);
        fetchFeedbacks();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    try {
      const res = await fetch(`/api/admin/feedbacks?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Feedback deleted");
        fetchFeedbacks();
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center">
        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">Total Feedbacks</p>
          <p className="text-xl font-black text-dark-navy">{feedbacks.length}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-dark-navy text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-coral transition-all shadow-lg hover:shadow-coral/20"
        >
          <Plus size={16} /> Add Feedback
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-coral" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbacks.map((f) => (
            <motion.div 
              layout
              key={f._id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group"
            >
              <div className="p-6 space-y-4 flex-grow">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-dark-navy">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-dark-navy text-sm uppercase tracking-tight">{f.userName}</h4>
                      <p className="text-[10px] font-bold text-coral uppercase tracking-widest">{f.userRole}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        className={i < f.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} 
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed line-clamp-4 italic">
                  "{f.text}"
                </p>

                {f.screenshotUrl && (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100">
                    <img src={f.screenshotUrl} alt="Feedback Screenshot" className="object-cover w-full h-full" />
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                <div className="flex gap-2">
                  <button 
                    onClick={() => togglePublic(f._id, f.isPublic)}
                    className={`p-2 rounded-xl border transition-all ${f.isPublic ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'}`}
                    title={f.isPublic ? "Hide from public" : "Show to public"}
                  >
                    {f.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button 
                    onClick={() => deleteFeedback(f._id)}
                    className="p-2 rounded-xl border bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100 transition-all"
                    title="Delete feedback"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {new Date(f.createdAt).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Feedback Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-dark-navy/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="text-xl font-black text-dark-navy uppercase tracking-tight">Add New Feedback</h3>
                  <p className="text-[10px] font-bold text-steel-blue uppercase tracking-[0.2em] mt-1">Manual testimonial entry</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">User Name</label>
                    <input 
                      required
                      value={form.userName}
                      onChange={(e) => setForm({...form, userName: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:border-coral outline-none text-sm font-bold text-dark-navy transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">User Role</label>
                    <select 
                      value={form.userRole}
                      onChange={(e) => setForm({...form, userRole: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:border-coral outline-none text-sm font-bold text-dark-navy transition-all appearance-none"
                    >
                      <option>Student</option>
                      <option>Tutor</option>
                      <option>Parent</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rating (Stars)</label>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        type="button"
                        onClick={() => setForm({...form, rating: star})}
                        className={`p-2 rounded-xl border transition-all ${form.rating >= star ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-gray-50 border-gray-100 text-gray-300'}`}
                      >
                        <Star size={20} className={form.rating >= star ? 'fill-current' : ''} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Feedback Text</label>
                  <textarea 
                    required
                    value={form.text}
                    onChange={(e) => setForm({...form, text: e.target.value})}
                    rows={4}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:border-coral outline-none text-sm font-medium text-gray-600 transition-all resize-none"
                    placeholder="Write the feedback here..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Screenshot URL (Optional)</label>
                  <input 
                    value={form.screenshotUrl}
                    onChange={(e) => setForm({...form, screenshotUrl: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-100 focus:border-coral outline-none text-sm font-medium text-gray-600 transition-all"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <input 
                    type="checkbox"
                    id="isPublic"
                    checked={form.isPublic}
                    onChange={(e) => setForm({...form, isPublic: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300 text-coral focus:ring-coral cursor-pointer"
                  />
                  <label htmlFor="isPublic" className="text-xs font-black text-dark-navy uppercase tracking-widest cursor-pointer">
                    Display on public page
                  </label>
                </div>

                <button 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-dark-navy text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-coral transition-all shadow-xl hover:shadow-coral/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Shield size={16} />}
                  Save Feedback
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
