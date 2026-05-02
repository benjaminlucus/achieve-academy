"use client";

import React, { useState } from "react";
import {
  X,
  Globe,
  UserCog,
  BookOpen,
  GraduationCap,
  DollarSign,
  Briefcase,
  Mail
} from "lucide-react";
import { allCountries, allTimezones } from "@/lib/constants";

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateUserDialog = ({ isOpen, onClose, onSuccess }: CreateUserDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: "student",
    country: "United States",
    timezone: "GMT-5",
    description: "",
    whichClass: "",
    subjects: "",
    learningGoals: "",
    experienceYears: "",
    education: "",
    hourlyRate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          subjects: formData.subjects.split(",").map(s => s.trim()),
          experienceYears: parseInt(formData.experienceYears) || 0,
          hourlyRate: parseInt(formData.hourlyRate) || 0,
        }),
      });

      if (response.ok) {
        console.log(response)
        alert("User created successfully!");
        onSuccess();
        onClose();
        setFormData({
          role: "student",
          country: "United States",
          timezone: "GMT-5",
          description: "",
          whichClass: "",
          subjects: "",
          learningGoals: "",
          experienceYears: "",
          education: "",
          hourlyRate: "",
        });
      } else {
        const error = await response.text();
        alert(`Error: ${error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Overlay with standard transition */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content with standard CSS animations */}
      <div className="relative bg-white w-full max-w-2xl p-8 rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-slide-up">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-coral/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-dark-navy/5 rounded-full -ml-16 -mb-16 blur-3xl" />

        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-dark-navy transition-colors bg-gray-50 p-2 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Create New User</h2>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Complete the onboarding data for the new user</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <UserCog size={14} className="text-coral" /> Account Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-dark-navy/10 text-sm font-bold text-gray-700 transition-all appearance-none"
              >
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
              </select>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Globe size={14} className="text-coral" /> Country
              </label>
              <select
                name="role"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-dark-navy/10 text-sm font-bold text-gray-700 transition-all appearance-none"
              >
                {allCountries.map((country) => (
                  <option value={country.toLowerCase()}>{country.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Globe size={14} className="text-coral" /> Timezone
              </label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-dark-navy/10 text-sm font-bold text-gray-700 transition-all appearance-none"
              >
                {allTimezones.map((timezone) => (
                  <option value={timezone.toLowerCase()}>{timezone.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Subjects */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={14} className="text-coral" /> Subjects (comma separated)
              </label>
              <input
                required
                type="text"
                name="subjects"
                value={formData.subjects}
                onChange={handleChange}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-dark-navy/10 text-sm font-bold text-gray-700 transition-all"
                placeholder="e.g. Physics, Math"
              />
            </div>
          </div>

          {/* Role Specific Fields */}
          <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-6 transition-all duration-300">
            {formData.role === 'student' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <GraduationCap size={14} className="text-coral" /> Which Class
                  </label>
                  <input
                    required
                    type="text"
                    name="whichClass"
                    value={formData.whichClass}
                    onChange={handleChange}
                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-dark-navy/10 text-sm font-bold text-gray-700 transition-all"
                    placeholder="e.g. Grade 10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen size={14} className="text-coral" /> Learning Goals
                  </label>
                  <input
                    required
                    type="text"
                    name="learningGoals"
                    value={formData.learningGoals}
                    onChange={handleChange}
                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-dark-navy/10 text-sm font-bold text-gray-700 transition-all"
                    placeholder="e.g. Improve Math"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase size={14} className="text-coral" /> Experience Years
                  </label>
                  <input
                    required
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-dark-navy/10 text-sm font-bold text-gray-700 transition-all"
                    placeholder="e.g. 5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={14} className="text-coral" /> Hourly Rate ($)
                  </label>
                  <input
                    required
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-dark-navy/10 text-sm font-bold text-gray-700 transition-all"
                    placeholder="e.g. 25"
                  />
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <GraduationCap size={14} className="text-coral" /> Education
                  </label>
                  <input
                    required
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-dark-navy/10 text-sm font-bold text-gray-700 transition-all"
                    placeholder="e.g. BSc in Physics"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Mail size={14} className="text-coral" /> About Description
            </label>
            <textarea
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-dark-navy/10 text-sm font-bold text-gray-700 h-32 transition-all resize-none"
              placeholder="Briefly describe the user..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dark-navy text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-coral transition-all disabled:opacity-50 shadow-lg shadow-dark-navy/10 active:scale-95"
          >
            {loading ? "Processing..." : "Create Account & Onboard"}
          </button>
        </form>
      </div>
    </div>
  );
};
