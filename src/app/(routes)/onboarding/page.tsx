"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, UserRound, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { completeOnboarding } from "./actions";

type Step = "role" | "details" | "submitting";

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<"student" | "tutor" | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isPending, setIsPending] = useState(false);

  const handleRoleSelect = (selectedRole: "student" | "tutor") => {
    setRole(selectedRole);
    setStep("details");
  };

  const handleAdminOnboarding = async (e: React.KeyboardEvent) => {
    // Secret shortcut: Press Ctrl+Shift+A to trigger admin onboarding check
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      const pin = prompt("Enter Admin Secret PIN:");
      if (pin === process.env.NEXT_PUBLIC_ADMIN_PIN) {
        setIsPending(true);
        try {
          await completeOnboarding({ role: 'admin', secretPin: pin });
        } catch (error) {
          alert("Admin onboarding failed.");
          setIsPending(false);
        }
      }
    }
  };

  const handleBack = () => {
    if (step === "details") setStep("role");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setStep("submitting");

    const data = new FormData(e.target as HTMLFormElement);
    const finalData = {
      ...formData,
      role,
      ...Object.fromEntries(data.entries()),
    };

    try {
      await completeOnboarding(finalData);
    } catch (error) {
      console.error(error);
      setIsPending(false);
      setStep("details");
    }
  };

  const progress = step === "role" ? 33 : step === "details" ? 66 : 100;

  return (
    <div 
      className="min-h-[calc(100vh-80px)] bg-off-white flex flex-col items-center justify-center p-4"
      onKeyDown={handleAdminOnboarding}
      tabIndex={0}
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-100">
          <motion.div
            className="h-full bg-dark-navy"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {step === "role" && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-sm font-bold text-steel-blue uppercase tracking-widest">Step 1 of 2</h2>
                  <h1 className="text-3xl font-bold text-dark-navy">Choose Your Role</h1>
                  <p className="text-steel-blue">How would you like to use Achieve Academy?</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <button
                    onClick={() => handleRoleSelect("student")}
                    className={`group p-8 rounded-2xl border-2 transition-all text-left space-y-4 ${
                      role === "student" ? "border-dark-navy bg-dark-navy/5" : "border-gray-100 hover:border-steel-blue/30 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-dark-navy/10 flex items-center justify-center text-dark-navy group-hover:scale-110 transition-transform">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-dark-navy">I'm a Student</h3>
                      <p className="text-sm text-steel-blue">I want to find expert tutors and improve my skills.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect("tutor")}
                    className={`group p-8 rounded-2xl border-2 transition-all text-left space-y-4 ${
                      role === "tutor" ? "border-dark-navy bg-dark-navy/5" : "border-gray-100 hover:border-steel-blue/30 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center text-coral group-hover:scale-110 transition-transform">
                      <UserRound size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-dark-navy">I'm a Tutor</h3>
                      <p className="text-sm text-steel-blue">I want to share my knowledge and earn money.</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {step === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-sm font-bold text-steel-blue uppercase tracking-widest">Step 2 of 2</h2>
                  <h1 className="text-3xl font-bold text-dark-navy">
                    {role === "student" ? "Student Details" : "Tutor Details"}
                  </h1>
                  <p className="text-steel-blue">Tell us a bit more about yourself.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {role === "student" ? (
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-bold text-dark-navy mb-2">Grade Level</label>
                        <input
                          name="gradeLevel"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dark-navy/20 focus:border-dark-navy"
                          placeholder="e.g. 10th Grade, University"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-dark-navy mb-2">Subjects You Need Help With</label>
                        <input
                          name="subjects"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dark-navy/20 focus:border-dark-navy"
                          placeholder="Math, Physics, English (comma separated)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-dark-navy mb-2">Learning Goals</label>
                        <textarea
                          name="learningGoals"
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dark-navy/20 focus:border-dark-navy"
                          placeholder="What do you want to achieve?"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-dark-navy mb-2">Subjects You Teach</label>
                          <input
                            name="subjects"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dark-navy/20 focus:border-dark-navy"
                            placeholder="Math, Physics"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-dark-navy mb-2">Experience (Years)</label>
                          <input
                            name="experienceYears"
                            type="number"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dark-navy/20 focus:border-dark-navy"
                            placeholder="5"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-dark-navy mb-2">Hourly Rate ($)</label>
                          <input
                            name="hourlyRate"
                            type="number"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dark-navy/20 focus:border-dark-navy"
                            placeholder="30"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-dark-navy mb-2">Education</label>
                          <input
                            name="education"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dark-navy/20 focus:border-dark-navy"
                            placeholder="B.Sc. Mathematics"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-dark-navy mb-2">Short Bio</label>
                        <textarea
                          name="bio"
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dark-navy/20 focus:border-dark-navy"
                          placeholder="Tell students about yourself..."
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-6">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-2 text-steel-blue hover:text-dark-navy font-bold transition-colors"
                    >
                      <ArrowLeft size={20} />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex items-center gap-2 bg-dark-navy text-white px-8 py-3 rounded-xl font-bold hover:bg-dark-navy/90 transition-all disabled:opacity-50"
                    >
                      {isPending ? "Setting up..." : "Complete Setup"}
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === "submitting" && (
              <motion.div
                key="submitting"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-6"
              >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <Check size={40} />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-dark-navy">All Set!</h1>
                  <p className="text-steel-blue">Redirecting you to your dashboard...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-8 text-center text-steel-blue text-sm">
        <p>© 2026 Achieve Academy. Secure Onboarding.</p>
      </div>
    </div>
  );
}
