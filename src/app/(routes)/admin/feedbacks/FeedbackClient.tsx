"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Star, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2, 
  X,
  User,
  Shield,
  FileText,
  ExternalLink
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface Feedback {
  _id: string;
  userId?: { _id: string; role: string; _doc: any }; // Populated user
  userName: string;
  userRole: string;
  rating: number;
  text: string;
  screenshotUrl?: string;
  attachments?: string[];
  isPublic: boolean;
  createdAt: string;
}

export default function FeedbackClient() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    userName: "",
    userRole: "Student",
    rating: 5,
    text: "",
    screenshotUrl: "",
    attachments: [] as string[], // Array of base64 strings
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

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachmentFiles(files);
    const previews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === files.length) {
          setAttachmentPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Convert files to base64 and combine with URL attachments
      const screenshotBase64 = screenshotPreview || form.screenshotUrl;
      const urlAttachments = form.attachments;
      const attachmentsBase64 = [...attachmentPreviews, ...urlAttachments];

      const res = await fetch("/api/admin/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          screenshotUrl: screenshotBase64,
          attachments: attachmentsBase64
        })
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
          attachments: [],
          isPublic: true
        });
        setScreenshotFile(null);
        setScreenshotPreview(null);
        setAttachmentFiles([]);
        setAttachmentPreviews([]);
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
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Feedbacks</p>
          <p className="text-xl font-black text-deep-black">{feedbacks.length}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-deep-black text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-purple-primary transition-all shadow-lg hover:shadow-purple-primary/20"
        >
          <Plus size={16} /> Add Feedback
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-purple-primary" size={40} />
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
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-deep-black">
                      <User size={20} />
                    </div>
                    <div>
                      {f.userId ? (
                        <Link 
                          href={f.userId.role === 'tutor' ? `/tutors/${f.userId._id}` : `/students/${f.userId._id}`}
                          className="hover:text-purple-primary transition-colors"
                        >
                          <h4 className="font-black text-deep-black text-sm uppercase tracking-tight flex items-center gap-1">
                            {f.userName} <ExternalLink size={10} />
                          </h4>
                        </Link>
                      ) : (
                        <h4 className="font-black text-deep-black text-sm uppercase tracking-tight">{f.userName}</h4>
                      )}
                      <p className="text-[10px] font-bold text-purple-primary uppercase tracking-widest">{f.userRole}</p>
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
                  &quot;{f.text}&quot;
                </p>

                {/* Show attachments */}
                {(f.screenshotUrl || (f.attachments && f.attachments.length > 0)) && (
                  <div className="space-y-2">
                    {f.screenshotUrl && (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100">
                        <Image src={f.screenshotUrl} alt="Feedback Screenshot" fill className="object-cover" />
                      </div>
                    )}
                    {f.attachments && f.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {f.attachments.map((url, idx) => (
                          <a 
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-purple-primary/10 hover:border-purple-primary/20 hover:text-purple-primary transition-colors"
                          >
                            <FileText size={14} />
                            Attachment {idx + 1}
                          </a>
                        ))}
                      </div>
                    )}
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
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-100 rounded-full">
                  <Shield size={10} className="text-gray-400" />
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Verified Log</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Feedback Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-deep-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-black text-deep-black uppercase tracking-tight">Add Platform Feedback</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto flex-grow">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">User Name</label>
                      <input 
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-purple-primary/30 transition-all"
                        value={form.userName}
                        onChange={(e) => setForm({...form, userName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</label>
                      <select 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-purple-primary/30 transition-all"
                        value={form.userRole}
                        onChange={(e) => setForm({...form, userRole: e.target.value})}
                      >
                        <option>Student</option>
                        <option>Tutor</option>
                        <option>Parent</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rating (1-5)</label>
                    <div className="flex gap-3">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setForm({...form, rating: num})}
                          className={`flex-1 py-3 rounded-xl border font-black transition-all ${form.rating >= num ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-gray-50 border-gray-100 text-gray-300'}`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Feedback Text</label>
                    <textarea 
                      required
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-purple-primary/30 transition-all resize-none"
                      value={form.text}
                      onChange={(e) => setForm({...form, text: e.target.value})}
                    />
                  </div>

                  {/* Screenshot: File Upload or URL */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Screenshot (Optional)</label>
                    <div className="space-y-3">
                      {screenshotPreview && (
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100">
                          <Image src={screenshotPreview} alt="Screenshot Preview" fill className="object-cover" />
                        </div>
                      )}
                      <label className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-purple-primary/30 transition-all cursor-pointer hover:bg-gray-100">
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={handleScreenshotChange}
                        />
                        <FileText size={16} /> {screenshotFile ? screenshotFile.name : "Select Screenshot File"}
                      </label>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">OR</p>
                      <input 
                        type="url"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-purple-primary/30 transition-all"
                        value={form.screenshotUrl}
                        onChange={(e) => setForm({...form, screenshotUrl: e.target.value})}
                        placeholder="Or paste a URL..."
                      />
                    </div>
                  </div>

                  {/* Attachments: File Upload or Comma-Separated URLs */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attachments (Optional)</label>
                    <div className="space-y-3">
                      {attachmentPreviews.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {attachmentPreviews.map((url, idx) => (
                            <div key={idx} className="relative group">
                              {url.startsWith("data:image/") ? (
                                <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100">
                                  <Image src={url} alt={`Attachment ${idx+1}`} fill className="object-cover" />
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600">
                                  <FileText size={14} />
                                  File {idx+1}
                                </div>
                              )}
                              <button 
                                type="button"
                                onClick={() => removeAttachment(idx)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <label className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-purple-primary/30 transition-all cursor-pointer hover:bg-gray-100">
                        <input 
                          type="file" 
                          multiple
                          className="hidden"
                          onChange={handleAttachmentsChange}
                        />
                        <FileText size={16} /> {attachmentFiles.length > 0 ? `${attachmentFiles.length} file(s) selected` : "Select Files"}
                      </label>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">OR</p>
                      <input 
                        type="text"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-purple-primary/30 transition-all"
                        value={typeof form.attachments === "string" ? form.attachments : ""}
                        onChange={(e) => setForm({...form, attachments: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})}
                        placeholder="Or paste comma-separated URLs..."
                      />
                    </div>
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="w-full py-4 bg-purple-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-purple-primary/90 transition-all shadow-lg shadow-purple-primary/20 disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : "Submit Feedback"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
