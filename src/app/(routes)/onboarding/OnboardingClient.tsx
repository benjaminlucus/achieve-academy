"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  GraduationCap,
  UserRound,
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  Globe,
  Book,
  Star,
  DollarSign,
  Languages,
  Briefcase
} from "lucide-react";
import { completeOnboarding } from "./actions";
import { allTimezones, allGrades, allCountries } from "@/lib/constants";

type Step = "role" | "location" | "details" | "availability" | "submitting";

function CountrySelect({ defaultValue, onSelect }: { defaultValue?: string, onSelect: (c: string) => void }) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue || "");

  const filteredCountries = useMemo(() => {
    return allCountries.filter(country => 
      country.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleSelect = (country: string) => {
    setSelected(country);
    onSelect(country);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div 
        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus-within:border-purple-primary/20 bg-gray-50/50 cursor-pointer transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected ? (
          <span className="font-bold text-deep-black">{selected}</span>
        ) : (
          <span className="font-medium text-gray-400">Select your country</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden">
          <input 
            autoFocus
            placeholder="Search country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 border-b border-gray-100 outline-none focus:bg-purple-primary/5"
          />
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.map(country => (
              <button 
                key={country}
                onClick={() => handleSelect(country)}
                className={`w-full text-left px-4 py-3 font-bold hover:bg-purple-primary/5 transition-colors ${
                  selected === country ? "bg-purple-primary/10 text-purple-primary" : "text-deep-black"
                }`}
              >
                {country}
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <div className="px-4 py-3 text-gray-400">No countries found</div>
            )}
          </div>
        </div>
      )}
      
      <input type="hidden" name="country" value={selected} required />
    </div>
  );
}

export default function OnboardingClient() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [step, setStep] = useState<Step>("role");

  const [role, setRole] = useState<"student" | "tutor" | null>(null);
  const [formData, setFormData] = useState<any>({
    country: "",
    timezone: "GMT+00:00 (Western Europe Time, London, Lisbon, Casablanca)",
  });
  const [availability, setAvailability] = useState<any[]>([
    { day: "Monday", slots: "" },
    { day: "Tuesday", slots: "" },
    { day: "Wednesday", slots: "" },
    { day: "Thursday", slots: "" },
    { day: "Friday", slots: "" },
    { day: "Saturday", slots: "" },
    { day: "Sunday", slots: "" },
  ]);
  const [isPending, setIsPending] = useState(false);
  const [loadingText, setLoadingText] = useState("Setting up your profile...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleSelect = (selectedRole: "student" | "tutor") => {
    setRole(selectedRole);
    setStep("location");
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    setFormData((prev: any) => ({
      ...prev,
      ...Object.fromEntries(data.entries()),
    }));
    setStep("details");
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    setFormData((prev: any) => ({
      ...prev,
      ...Object.fromEntries(data.entries()),
    }));
    if (role === "tutor") {
      setStep("availability");
    } else {
      finishOnboarding({
        ...formData,
        ...Object.fromEntries(data.entries()),
        role,
      });
    }
  };

  const handleAvailabilityChange = (day: string, value: string) => {
    setAvailability((prev) => prev.map((a) => (a.day === day ? { ...a, slots: value } : a)));
  };

  const finishOnboarding = async (finalData: any) => {
    setIsPending(true);
    setErrorMessage(null);
    setLoadingText("Connecting...");

    try {
      setStep("submitting");
      setTimeout(() => setLoadingText("Saving profile..."), 1000);
      setTimeout(() => setLoadingText("Almost done..."), 2500);

      const result = await completeOnboarding(finalData);
      if (result?.success) {
        setLoadingText("Redirecting...");
        router.refresh(); // Refresh to update server components
        router.replace("/dashboard");
      } else {
        setErrorMessage(`Onboarding failed: ${result?.error || "Something went wrong"}`);
        setIsPending(false);
        setStep(role === "tutor" ? "availability" : "details");
      }
    } catch (error: unknown) {
      console.error(error);
      const msg = error instanceof Error ? error.message : "Something went wrong";
      setErrorMessage(`An error occurred: ${msg}`);
      setIsPending(false);
      setStep(role === "tutor" ? "availability" : "details");
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedAvailability = availability
      .filter((a) => a.slots.trim() !== "")
      .map((a) => ({
        day: a.day,
        time: a.slots.split(",").map((s: string) => s.trim()),
      }));

    finishOnboarding({
      ...formData,
      role,
      availability: formattedAvailability,
    });
  };

  const handleAdminOnboarding = async (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === "B") {
      const pin = prompt("Enter Admin Secret PIN:");
      if (pin) {
        setIsPending(true);
        setLoadingText("Connecting...");
        try {
          const result = await completeOnboarding({ role: "admin", secretPin: pin });
          if (result?.success) {
            setLoadingText("Almost done...");
            router.refresh();
            router.replace("/dashboard");
          } else {
            setErrorMessage(`Admin onboarding failed: ${result?.error || "Unknown error"}`);
            setIsPending(false);
          }
        } catch (error) {
          setErrorMessage("Admin onboarding failed. Check your connection.");
          setIsPending(false);
        }
      }
    }
  };

  const handleBack = () => {
    if (step === "availability") setStep("details");
    else if (step === "details") setStep("location");
    else if (step === "location") setStep("role");
  };

  const steps: Step[] = role === "student" ? ["role", "location", "details"] : ["role", "location", "details", "availability"];
  const currentStepIndex = steps.indexOf(step);
  const totalSteps = steps.length;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div
      className="min-h-[calc(100vh-80px)] bg-off-white flex flex-col items-center justify-center p-4"
      onKeyDown={handleAdminOnboarding}
      tabIndex={0}
    >
      <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
        {/* Progress Bar */}
        <div className="h-1.5 bg-gray-100">
          <div
            className="h-full bg-purple-primary transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-8 md:p-14">
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          {step === "role" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-3">
                <span className="text-[10px] font-black text-purple-primary uppercase tracking-[0.2em]">
                  Step 1 of {totalSteps}
                </span>
                <h1 className="text-4xl font-black text-deep-black tracking-tight">
                  Choose Your Role
                </h1>
                <p className="text-steel-blue font-medium">
                  How would you like to use Ravencrest Academy?
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <button
                  onClick={() => handleRoleSelect("student")}
                  className={`group relative p-10 rounded-3xl border-2 transition-all text-left space-y-6 ${
                    role === "student"
                      ? "border-purple-primary bg-purple-primary/5"
                      : "border-gray-100 hover:border-purple-primary/20 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-purple-primary/10 flex items-center justify-center text-purple-primary group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap size={32} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-deep-black">
                      I'm a Student
                    </h3>
                    <p className="text-sm font-medium text-steel-blue mt-2 leading-relaxed">
                      I want to find expert tutors and improve my academic performance.
                    </p>
                  </div>
                  {role === "student" && (
                    <div className="absolute top-6 right-6 w-3 h-3 bg-purple-primary rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => handleRoleSelect("tutor")}
                  className={`group relative p-10 rounded-3xl border-2 transition-all text-left space-y-6 ${
                    role === "tutor"
                      ? "border-purple-primary bg-purple-primary/5"
                      : "border-gray-100 hover:border-purple-primary/20 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-purple-primary/10 flex items-center justify-center text-purple-primary group-hover:scale-110 transition-transform duration-300">
                    <UserRound size={32} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-deep-black">
                      I'm a Tutor
                    </h3>
                    <p className="text-sm font-medium text-steel-blue mt-2 leading-relaxed">
                      I want to share my knowledge and help students succeed.
                    </p>
                  </div>
                  {role === "tutor" && (
                    <div className="absolute top-6 right-6 w-3 h-3 bg-purple-primary rounded-full" />
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "location" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-3">
                <span className="text-[10px] font-black text-purple-primary uppercase tracking-[0.2em]">
                  Step {currentStepIndex + 1} of {totalSteps}
                </span>
                <h1 className="text-4xl font-black text-deep-black tracking-tight">
                  Your Location
                </h1>
                <p className="text-steel-blue font-medium">
                  This helps us match you with the right people in your time zone.
                </p>
              </div>

              <form onSubmit={handleLocationSubmit} className="space-y-8 max-w-lg mx-auto">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-deep-black uppercase tracking-widest flex items-center gap-2">
                      <Globe size={14} className="text-purple-primary" /> Country
                    </label>
                    <CountrySelect 
                      defaultValue={formData.country} 
                      onSelect={(country) => setFormData(prev => ({...prev, country}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-deep-black uppercase tracking-widest flex items-center gap-2">
                      <Clock size={14} className="text-purple-primary" /> Timezone
                    </label>
                    <select
                      name="timezone"
                      required
                      defaultValue={formData.timezone}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-purple-primary/20 focus:bg-white bg-gray-50/50 transition-all font-bold text-deep-black appearance-none"
                    >
                      {allTimezones.map((timezone) => (
                        <option key={timezone} value={timezone}>
                          {timezone}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 text-steel-blue hover:text-deep-black font-black text-[11px] uppercase tracking-widest transition-colors"
                  >
                    <ArrowLeft size={18} strokeWidth={2.5} /> Back
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-3 bg-purple-primary text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-purple-primary/90 hover:scale-105 transition-all shadow-xl shadow-purple-primary/20"
                  >
                    Next Step <ArrowRight size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === "details" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-3">
                <span className="text-[10px] font-black text-purple-primary uppercase tracking-[0.2em]">
                  Step {currentStepIndex + 1} of {totalSteps}
                </span>
                <h1 className="text-4xl font-black text-deep-black tracking-tight">
                  {role === "student" ? "Academic Profile" : "Professional Bio"}
                </h1>
                <p className="text-steel-blue font-medium">
                  Tell us more about your background and goals.
                </p>
              </div>

              <form onSubmit={handleDetailsSubmit} className="space-y-8">
                {role === "student" ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-deep-black uppercase tracking-widest flex items-center gap-2">
                        <GraduationCap size={14} className="text-purple-primary" /> Current
                        Grade
                      </label>
                      <select
                        name="whichClass"
                        required
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-purple-primary/20 focus:bg-white bg-gray-50/50 transition-all font-bold text-deep-black appearance-none"
                      >
                        {allGrades.map((grade) => (
                          <option key={grade} value={grade}>
                            {grade}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-deep-black uppercase tracking-widest flex items-center gap-2">
                        <Book size={14} className="text-purple-primary" /> Preferred
                        Subjects
                      </label>
                      <input
                        name="subjects"
                        required
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-purple-primary/20 focus:bg-white bg-gray-50/50 transition-all font-bold text-deep-black"
                        placeholder="e.g. Maths, Physics, Chemistry"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[11px] font-black text-deep-black uppercase tracking-widest flex items-center gap-2">
                        <Star size={14} className="text-purple-primary" /> Learning
                        Goals
                      </label>
                      <textarea
                        name="learningGoals"
                        required
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-purple-primary/20 focus:bg-white bg-gray-50/50 transition-all font-bold text-deep-black"
                        placeholder="What do you hope to achieve?"
                        rows={3}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[11px] font-black text-deep-black uppercase tracking-widest flex items-center gap-2">
                        <Briefcase size={14} className="text-purple-primary" /> Personal
                        Description
                      </label>
                      <textarea
                        name="description"
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-purple-primary/20 focus:bg-white bg-gray-50/50 transition-all font-bold text-deep-black"
                        placeholder="Tell us a bit about yourself..."
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-deep-black uppercase tracking-widest flex items-center gap-2">
                        <Briefcase size={14} className="text-purple-primary" /> Experience
                        (Years)
                      </label>
                      <input
                        name="experienceYears"
                        type="number"
                        required
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-purple-primary/20 focus:bg-white bg-gray-50/50 transition-all font-bold text-deep-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-deep-black uppercase tracking-widest flex items-center gap-2">
                        <GraduationCap size={14} className="text-purple-primary" /> Education
                      </label>
                      <input
                        name="education"
                        required
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-purple-primary/20 focus:bg-white bg-gray-50/50 transition-all font-bold text-deep-black"
                        placeholder="e.g. PhD in Mathematics"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-deep-black uppercase tracking-widest flex items-center gap-2">
                        <DollarSign size={14} className="text-purple-primary" /> Hourly
                        Rate ($)
                      </label>
                      <input
                        name="hourlyRate"
                        type="number"
                        required
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-purple-primary/20 focus:bg-white bg-gray-50/50 transition-all font-bold text-deep-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-deep-black uppercase tracking-widest flex items-center gap-2">
                        <DollarSign size={14} className="text-purple-primary" /> Monthly
                        Rate ($)
                      </label>
                      <input
                        name="monthlyRate"
                        type="number"
                        required
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-purple-primary/20 focus:bg-white bg-gray-50/50 transition-all font-bold text-deep-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-deep-black uppercase tracking-widest flex items-center gap-2">
                        <Book size={14} className="text-purple-primary" /> Expertise
                        Subjects
                      </label>
                      <input
                        name="subjects"
                        required
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-purple-primary/20 focus:bg-white bg-gray-50/50 transition-all font-bold text-deep-black"
                        placeholder="e.g. Maths, Science (Comma separated)"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-deep-black uppercase tracking-widest flex items-center gap-2">
                        <Star size={14} className="text-purple-primary" /> Key Skills
                      </label>
                      <input
                        name="skills"
                        required
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-purple-primary/20 focus:bg-white bg-gray-50/50 transition-all font-bold text-deep-black"
                        placeholder="e.g. Coding, Design (Comma separated)"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[11px] font-black text-deep-black uppercase tracking-widest flex items-center gap-2">
                        <Languages size={14} className="text-purple-primary" /> Languages
                      </label>
                      <input
                        name="languages"
                        required
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-purple-primary/20 focus:bg-white bg-gray-50/50 transition-all font-bold text-deep-black"
                        placeholder="e.g. English, French, Urdu"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[11px] font-black text-deep-black uppercase tracking-widest flex items-center gap-2">
                        <Star size={14} className="text-purple-primary" /> Short Bio
                      </label>
                      <textarea
                        name="bio"
                        required
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-purple-primary/20 focus:bg-white bg-gray-50/50 transition-all font-bold text-deep-black"
                        placeholder="Share your teaching journey..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 text-steel-blue hover:text-deep-black font-black text-[11px] uppercase tracking-widest transition-colors"
                  >
                    <ArrowLeft size={18} strokeWidth={2.5} /> Back
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-3 bg-purple-primary text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-purple-primary/90 hover:scale-105 transition-all shadow-xl shadow-purple-primary/20"
                  >
                    {role === "student" ? "Complete Setup" : "Next Step"}
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === "availability" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-3">
                <span className="text-[10px] font-black text-purple-primary uppercase tracking-[0.2em]">
                  Step 4 of 4
                </span>
                <h1 className="text-4xl font-black text-deep-black tracking-tight">
                  Weekly Availability
                </h1>
                <p className="text-steel-blue font-medium">
                  Set your available hours for each day.
                </p>
              </div>

              <form onSubmit={handleFinalSubmit} className="space-y-8">
                <div className="flex flex-row overflow-x-auto gap-4 pb-6 no-scrollbar snap-x">
                  {availability.map((item) => (
                    <div
                      key={item.day}
                      className="flex-shrink-0 w-[200px] snap-center p-6 bg-gray-50/50 rounded-3xl border-2 border-gray-100 hover:border-purple-primary/10 transition-all space-y-4"
                    >
                      <span className="text-xs font-black text-deep-black uppercase tracking-widest">
                        {item.day}
                      </span>
                      <textarea
                        value={item.slots}
                        onChange={(e) =>
                          handleAvailabilityChange(item.day, e.target.value)
                        }
                        placeholder="e.g. 10:00-14:00"
                        className="w-full p-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-purple-primary/20 font-bold text-xs text-deep-black"
                        rows={3}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 text-steel-blue hover:text-deep-black font-black text-[11px] uppercase tracking-widest transition-colors"
                  >
                    <ArrowLeft size={18} strokeWidth={2.5} /> Back
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-3 bg-purple-primary text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-purple-primary/90 hover:scale-105 transition-all shadow-xl shadow-purple-primary/20"
                  >
                    Complete Setup <Check size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === "submitting" && (
            <div className="text-center space-y-6 py-20 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 border-4 border-deep-black border-t-purple-primary rounded-full animate-spin mx-auto" />
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-deep-black">{loadingText}</h2>
                <p className="text-steel-blue text-sm font-medium">
                  Hang tight, we're building your academic home.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
