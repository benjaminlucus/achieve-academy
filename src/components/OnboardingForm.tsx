"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, GraduationCap, BookOpen, Globe, Clock, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const OnboardingForm = () => {

  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    role: '', // 'student' or 'tutor'
    country: '',
    timezone: '',
    // Student specific
    whichClass: '',
    learningGoals: '',
    // Tutor specific
    experienceYears: 0,
    education: '',
    hourlyRate: 0,
    // Common
    subjects: [] as string[],
    description: '',
  });


  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleRoleSelect = (role: 'student' | 'tutor') => {
    setFormData({ ...formData, role });
    setStep(2);
  };

  const updateFields = (fields: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error("Onboarding failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 font-sans text-[#1e3a5f]">
      {/* Header / Logo Space */}
      <div className="mb-8 text-2xl font-bold tracking-tight">
        ACHIEVE <span className="text-[#d65a50]">ACADEMY</span>
      </div>

      <div className="w-full max-auto max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-100">
          <div
            className="h-full bg-[#1e3a5f] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#70869d]">Step {step} of {totalSteps}</span>
            <span className="text-xs font-bold text-[#1e3a5f]">{Math.round(progress)}% Complete</span>
          </div>

          {/* STEP 1: ROLE SELECTION */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Welcome! Who are you?</h1>
                <p className="text-[#70869d]">Select your role to personalize your experience.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <button
                  onClick={() => handleRoleSelect('student')}
                  className={`p-6 border-2 rounded-xl flex flex-col items-center transition-all hover:border-[#1e3a5f] group ${formData.role === 'student' ? 'border-[#1e3a5f] bg-[#1e3a5f]/5' : 'border-gray-100'}`}
                >
                  <GraduationCap className={`w-12 h-12 mb-4 ${formData.role === 'student' ? 'text-[#1e3a5f]' : 'text-[#70869d]'}`} />
                  <span className="font-bold text-lg">I am a Student</span>
                </button>
                <button
                  onClick={() => handleRoleSelect('tutor')}
                  className={`p-6 border-2 rounded-xl flex flex-col items-center transition-all hover:border-[#1e3a5f] group ${formData.role === 'tutor' ? 'border-[#1e3a5f] bg-[#1e3a5f]/5' : 'border-gray-100'}`}
                >
                  <User className={`w-12 h-12 mb-4 ${formData.role === 'tutor' ? 'text-[#1e3a5f]' : 'text-[#70869d]'}`} />
                  <span className="font-bold text-lg">I am a Tutor</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION & CORE INFO */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Tell us where you are</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-[#70869d]" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1e3a5f] outline-none"
                      placeholder="e.g. United Kingdom"
                      onChange={(e) => updateFields({ country: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Timezone</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-[#70869d]" />
                    <select
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1e3a5f] outline-none appearance-none"
                      onChange={(e) => updateFields({ timezone: e.target.value })}
                    >
                      <option value="">Select Timezone</option>
                      <option value="GMT">GMT (London)</option>
                      <option value="EST">EST (New York)</option>
                      <option value="PKT">PKT (Pakistan)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 border border-[#70869d] text-[#70869d] py-3 rounded-lg font-bold flex justify-center items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={loading}
                  className="w-2/3 bg-[#1e3a5f] text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-[#c04d44] transition-colors disabled:opacity-50"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ROLE SPECIFIC DETAILS */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Just a few more details</h2>

              {formData.role === 'student' ? (
                <div className="space-y-4">
                  <input
                    placeholder="Which class/grade are you in?"
                    className="w-full p-3 border rounded-lg"
                    onChange={(e) => updateFields({ whichClass: e.target.value })}
                  />
                  <textarea
                    placeholder="What are your learning goals?"
                    className="w-full p-3 border rounded-lg h-24"
                    onChange={(e) => updateFields({ learningGoals: e.target.value })}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Years of Exp"
                      className="w-full p-3 border rounded-lg"
                      onChange={(e) => updateFields({ experienceYears: Number(e.target.value) })}
                    />
                    <input
                      type="number"
                      placeholder="Hourly Rate ($)"
                      className="w-full p-3 border rounded-lg"
                      onChange={(e) => updateFields({ hourlyRate: Number(e.target.value) })}
                    />
                  </div>
                  <input
                    placeholder="Education (e.g. Masters in CS)"
                    className="w-full p-3 border rounded-lg"
                    onChange={(e) => updateFields({ education: e.target.value })}
                  />
                </div>
              )}

              <textarea
                placeholder="Brief bio / description"
                className="w-full p-3 border rounded-lg h-24"
                onChange={(e) => updateFields({ description: e.target.value })}
              />

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 border border-[#70869d] text-[#70869d] py-3 rounded-lg font-bold flex justify-center items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-2/3 bg-[#d65a50] text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-[#c04d44] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Complete Setup?'} <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;