"use client";

import { useState } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface RequestTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RequestTutorModal({ isOpen, onClose }: RequestTutorModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    classLevel: "",
    budget: "",
    preferredLanguage: [] as string[],
    description: "",
    preferredSchedule: "",
    preferredGender: "",
    additionalNotes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "select-multiple" && "selectedOptions" in e.target) {
      const selectedOptions = Array.from((e.target as HTMLSelectElement).selectedOptions);
      setFormData({ ...formData, [name]: selectedOptions.map((option) => option.value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleToggleLanguage = (lang: string) => {
    setFormData(prev => {
      if (prev.preferredLanguage.includes(lang)) {
        return { ...prev, preferredLanguage: prev.preferredLanguage.filter(l => l !== lang) };
      }
      return { ...prev, preferredLanguage: [...prev.preferredLanguage, lang] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate required fields
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.subject ||
      !formData.classLevel ||
      !formData.budget ||
      formData.preferredLanguage.length === 0 ||
      !formData.description
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/tutor-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      setStep("success");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit your request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setFormData({
      fullName: "",
      email: "",
      subject: "",
      classLevel: "",
      budget: "",
      preferredLanguage: [],
      description: "",
      preferredSchedule: "",
      preferredGender: "",
      additionalNotes: "",
    });
    setStep("form");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-[#020617]/90 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#0F172A] border border-[#8B5CF6]/15 max-w-2xl w-full rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl space-y-6 sm:space-y-8 relative overflow-hidden my-4 sm:my-auto">
        {/* Close Button */}
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[#8B5CF6] to-coral"></div>

        {step === "form" ? (
          <>
            {/* Header */}
            <div className="space-y-3 pt-2 sm:pt-0">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                Request a Tutor
              </h2>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Tell us what you're looking for and we'll help you find a suitable tutor. Our team usually responds within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#020617] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#020617] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest">Preferred Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#020617] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="e.g. Mathematics"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest">Class / Grade *</label>
                  <input
                    type="text"
                    name="classLevel"
                    value={formData.classLevel}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#020617] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="e.g. O Levels"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest">Budget *</label>
                  <input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#020617] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="e.g. $50/hr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest">Preferred Language(s) *</label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {["English", "Urdu", "Hindi", "Arabic", "French", "Spanish", "Chinese"].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleToggleLanguage(lang)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${
                        formData.preferredLanguage.includes(lang)
                          ? "bg-emerald-500 text-white border-2 border-emerald-600"
                          : "bg-[#020617] text-slate-400 border-2 border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest">What are you looking for? *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#020617] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                  placeholder="e.g. I'm looking for an experienced O Level Physics tutor who can help with exam preparation..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
                    Preferred Schedule (Optional)
                  </label>
                  <input
                    type="text"
                    name="preferredSchedule"
                    value={formData.preferredSchedule}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#020617] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="e.g. Weekday evenings"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
                    Preferred Gender (Optional)
                  </label>
                  <select
                    name="preferredGender"
                    value={formData.preferredGender}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#020617] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    <option value="">No preference</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#020617] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                  placeholder="Any other details you'd like to share..."
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 sm:py-4 bg-emerald-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest border-2 border-emerald-600 hover:bg-emerald-600 hover:border-emerald-700 transition-all rounded-2xl shadow-[2px_2px_0px_0px_rgba(5,150,105,1)] hover:shadow-none hover:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="space-y-6 sm:space-y-8 text-center py-6">
            <div className="w-16 h-16 sm:w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                Request Submitted Successfully
              </h2>
              <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-md mx-auto">
                Thank you! Your tutor request has been received. Our team will review it and usually respond within 24 hours. We'll email you as soon as we find a suitable tutor.
              </p>
            </div>
            <button
              onClick={resetAndClose}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-[#0F172A] text-white border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-2xl shadow-lg"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
