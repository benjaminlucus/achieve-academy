"use client";

import { useState, useEffect } from "react";
import { Phone, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, Pencil, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export interface PhoneVerificationState {
  countryCode: string;
  countryName: string;
  mobileNumber: string;
  whatsappSameAsMobile: boolean;
  whatsappNumber?: string;
  isConfirmed: boolean;
  isVerified: boolean;
  confirmedAt?: Date;
  verifiedAt?: Date;
}

interface Props {
  initialValue?: Partial<PhoneVerificationState>;
  onVerified: (verification: PhoneVerificationState) => void;
  required?: boolean;
}

type ConfirmStep = "enter" | "confirm" | "reenter";

const DEFAULT_COUNTRIES = [
  { code: "+92", name: "Pakistan", flag: "🇵🇰" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+1", name: "United States", flag: "🇺🇸" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+90", name: "Turkey", flag: "🇹🇷" },
];

function formatDisplayNumber(countryCode: string, number: string): string {
  const n = number.replace(/\D/g, "");
  const parts: string[] = [];
  if (n.length >= 7) {
    const group1 = n.slice(0, Math.min(3, n.length - 4));
    const group2 = n.slice(group1.length);
    group2.replace(/(\d{3,4})(?=(\d{2})+$)/g, "$1 ").trim();
    parts.push(group1, group2.replace(/(\d{3})(\d{2,})/, "$1 $2"));
  } else {
    parts.push(n);
  }
  return `${countryCode.startsWith("+") ? "" : "+"}${countryCode} ${parts.join(" ")}`;
}

export default function PhoneVerificationForm({ initialValue, onVerified, required = true }: Props) {
  const [countryCode, setCountryCode] = useState<string>(initialValue?.countryCode || "+92");
  const [countryName, setCountryName] = useState<string>(
    initialValue?.countryName ||
      DEFAULT_COUNTRIES.find(c => c.code === initialValue?.countryCode)?.name ||
      "Pakistan"
  );
  const [mobileNumber, setMobileNumber] = useState<string>(initialValue?.mobileNumber || "");
  const [whatsappSameAsMobile, setWhatsappSameAsMobile] = useState<boolean>(
    initialValue?.whatsappSameAsMobile ?? true
  );
  const [whatsappNumber, setWhatsappNumber] = useState<string>(initialValue?.whatsappNumber || "");
  const [confirmStep, setConfirmStep] = useState<ConfirmStep>("enter");
  const [reentryNumber, setReentryNumber] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(!!initialValue?.isConfirmed);
  const [confirmedAt, setConfirmedAt] = useState<Date | undefined>(initialValue?.confirmedAt);

  // Existing OTP state (preserved for future)
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean>(!!initialValue?.isVerified);
  const [cooldown, setCooldown] = useState(0);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [mockOtpHint, setMockOtpHint] = useState<string | null>(null);

  // Fetch status on mount if already user exists
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/phone-verification/verify-otp");
        if (res.ok) {
          const json = await res.json();
          if (json.data?.isVerified) {
            setIsVerified(true);
            setIsConfirmed(true);
            setCountryCode(json.data.countryCode);
            setCountryName(json.data.countryName);
            setMobileNumber(json.data.mobileNumber);
            setWhatsappNumber(json.data.whatsappNumber || "");
            setConfirmedAt(json.data.verifiedAt ?? json.data.confirmedAt);
            onVerified({
              countryCode: json.data.countryCode,
              countryName: json.data.countryName,
              mobileNumber: json.data.mobileNumber,
              whatsappNumber: json.data.whatsappNumber,
              whatsappSameAsMobile: !!json.data.whatsappSameAsMobile,
              isConfirmed: true,
              isVerified: true,
              confirmedAt: json.data.confirmedAt,
              verifiedAt: json.data.verifiedAt,
            });
          }
        }
      } catch {
        /* ignore */
      }
    })();
  }, [onVerified]);

  // Cooldown timer (preserved for future OTP)
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleCountryChange = (code: string) => {
    const country = DEFAULT_COUNTRIES.find(c => c.code === code);
    setCountryCode(code);
    setCountryName(country?.name || code);
  };

  const cleanedMobile = mobileNumber.replace(/\D/g, "");
  const displayCountry = DEFAULT_COUNTRIES.find(c => c.code === countryCode);

  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cleanedMobile || cleanedMobile.length < 6) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    setConfirmStep("confirm");
  };

  const handleConfirmYes = () => setConfirmStep("reenter");
  const handleEditNumber = () => {
    setConfirmStep("enter");
  };

  const handleConfirmSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (reentryNumber.replace(/\D/g, "") !== cleanedMobile) {
      toast.error("Numbers don't match. Please try again.");
      return;
    }
    try {
      setConfirming(true);
      const res = await fetch("/api/phone-verification/confirm-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode,
          countryName,
          mobileNumber: cleanedMobile,
          whatsappSameAsMobile,
          whatsappNumber: whatsappNumber.replace(/\D/g, ""),
          confirmedReEntry: reentryNumber,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to confirm number");
        return;
      }
      setIsConfirmed(true);
      setConfirmedAt(json.verification?.confirmedAt ? new Date(json.verification.confirmedAt) : new Date());
      if (json.verification?.isVerified) setIsVerified(true);
      toast.success("Number confirmed");
      onVerified({
        countryCode: json.verification.countryCode,
        countryName: json.verification.countryName,
        mobileNumber: json.verification.mobileNumber,
        whatsappNumber: json.verification.whatsappNumber,
        whatsappSameAsMobile: json.verification.whatsappSameAsMobile,
        isConfirmed: true,
        isVerified: json.verification.isVerified ?? false,
        confirmedAt: json.verification.confirmedAt ? new Date(json.verification.confirmedAt) : undefined,
        verifiedAt: json.verification.verifiedAt ? new Date(json.verification.verifiedAt) : undefined,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to confirm number");
    } finally {
      setConfirming(false);
    }
  };

  /* =========================================================
     EXISTING OTP LOGIC (KEPT INTACT FOR FUTURE PROVIDER)
     ========================================================= */
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cleanedMobile || cleanedMobile.length < 6) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    try {
      setSending(true);
      const res = await fetch("/api/phone-verification/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode,
          countryName,
          mobileNumber: cleanedMobile,
          whatsappSameAsMobile,
          whatsappNumber: whatsappNumber.replace(/\D/g, ""),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to send OTP");
        return;
      }
      setOtpSent(true);
      setExpiresAt(json.expiresAt || null);
      setCooldown(60);
      if (json.mockOtp) setMockOtpHint(json.mockOtp);
      toast.success(
        json.mockOtp
          ? `OTP sent! (Mock mode — use ${json.mockOtp})`
          : "OTP sent successfully"
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otp || otp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }
    try {
      setVerifying(true);
      const res = await fetch("/api/phone-verification/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Invalid OTP");
        return;
      }
      setIsVerified(true);
      setMockOtpHint(null);
      toast.success("Phone verified successfully!");
      onVerified({
        countryCode: json.verification.countryCode,
        countryName: json.verification.countryName,
        mobileNumber: json.verification.mobileNumber,
        whatsappNumber: json.verification.whatsappNumber,
        whatsappSameAsMobile: json.verification.whatsappSameAsMobile,
        isConfirmed: true,
        isVerified: true,
        confirmedAt: confirmedAt ?? new Date(),
        verifiedAt: json.verification.verifiedAt,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to verify OTP");
    } finally {
      setVerifying(false);
    }
  };
  /* =========================================================
     END EXISTING OTP LOGIC
     ========================================================= */

  const badgeClass = isVerified
    ? "ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700"
    : isConfirmed
    ? "ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-coral/10 text-coral"
    : "";

  return (
    <div className="w-full bg-white rounded-[2rem] shadow-sm border border-dark-navy/5 p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-coral/10 flex items-center justify-center">
          <Phone className="w-6 h-6 text-coral" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-black text-dark-navy uppercase tracking-tight">
            Phone & WhatsApp
          </h2>
          <p className="text-sm text-steel-blue">
            Confirm your contact number so the academy can reach you through WhatsApp.
          </p>
        </div>
        {(isVerified || isConfirmed) && (
          <div className={badgeClass}>
            {isVerified ? <ShieldCheck className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span className="text-xs font-black uppercase tracking-widest">
              {isVerified ? "Verified" : "Number confirmed"}
            </span>
          </div>
        )}
      </div>

      {!isVerified && !isConfirmed && (
        <>
          {confirmStep === "enter" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-steel-blue mb-2">
                    Country *
                  </label>
                  <select
                    value={countryCode}
                    onChange={e => handleCountryChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:outline-none focus:border-coral/30 font-bold text-dark-navy"
                  >
                    {DEFAULT_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-steel-blue mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={e => setMobileNumber(e.target.value)}
                    placeholder="300 1234567"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:outline-none focus:border-coral/30 font-bold text-dark-navy"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappSameAsMobile}
                    onChange={e => setWhatsappSameAsMobile(e.target.checked)}
                    className="w-4 h-4 text-coral"
                  />
                  <span className="text-sm font-bold text-dark-navy">
                    WhatsApp number is the same as mobile
                  </span>
                </label>
                {!whatsappSameAsMobile && (
                  <div>
                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-steel-blue mb-2">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={e => setWhatsappNumber(e.target.value)}
                      placeholder="WhatsApp number (without country code)"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:outline-none focus:border-coral/30 font-bold text-dark-navy"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="px-8 py-3 bg-coral text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-coral/90 disabled:opacity-50 transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {confirmStep === "confirm" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-coral/20 bg-coral/5 p-6 space-y-4">
                <div className="flex items-center gap-2 text-coral">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-black uppercase tracking-widest">
                    Please confirm your number
                  </span>
                </div>
                <div className="py-2">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-steel-blue mb-2">
                    Your WhatsApp / Mobile number
                  </p>
                  <div className="flex items-center gap-3">
                    {displayCountry && <span className="text-3xl">{displayCountry.flag}</span>}
                    <p className="text-3xl font-black text-dark-navy tracking-wide">
                      {formatDisplayNumber(countryCode, cleanedMobile)}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-white border border-dark-navy/5 p-4 space-y-2">
                  <p className="text-sm font-bold text-dark-navy">
                    How will this number be used?
                  </p>
                  <ul className="text-xs text-steel-blue space-y-1.5">
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-coral shrink-0 mt-0.5" />
                      Ravencrest Academy will contact you by WhatsApp when needed.
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-coral shrink-0 mt-0.5" />
                      For reminders, updates, and important notices about your studies.
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-coral shrink-0 mt-0.5" />
                      Your number is never shared publicly with other students or tutors.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleEditNumber}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-dark-navy/10 bg-white text-dark-navy font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                  Edit number
                </button>
                <button
                  type="button"
                  onClick={handleConfirmYes}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-coral text-white font-black text-xs uppercase tracking-widest hover:bg-coral/90 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Yes, this is my number
                </button>
              </div>
            </div>
          )}

          {confirmStep === "reenter" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-dark-navy/10 bg-gray-50 p-6 space-y-4">
                <div className="flex items-center gap-2 text-steel-blue">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-black uppercase tracking-widest">
                    Confirm once more
                  </span>
                </div>
                <p className="text-sm text-dark-navy">
                  To prevent accidental mistakes, please re-enter your full mobile number
                  <span className="font-bold"> without</span> the country code.
                </p>
                <div className="rounded-xl bg-white border border-dark-navy/5 p-3 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-steel-blue">
                    You entered
                  </p>
                  <p className="font-black text-dark-navy">
                    {displayCountry?.flag} {formatDisplayNumber(countryCode, cleanedMobile)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-steel-blue mb-2">
                    Re-enter mobile number *
                  </label>
                  <input
                    type="tel"
                    value={reentryNumber}
                    onChange={e => setReentryNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 3001234567"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-transparent focus:outline-none focus:border-coral/30 font-black text-dark-navy tracking-wide"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleEditNumber}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-dark-navy/10 bg-white text-dark-navy font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Edit number
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  disabled={confirming || reentryNumber.replace(/\D/g, "").length < 6}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-coral text-white font-black text-xs uppercase tracking-widest hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {confirming ? "Saving..." : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm number
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Future OTP UI — hidden right now but logic preserved */}
          {otpSent && (
            <div className="space-y-4 p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-black uppercase tracking-widest">
                  Enter the code we sent you
                </span>
              </div>
              {mockOtpHint && (
                <p className="text-xs text-amber-600 font-bold">
                  🔧 Mock Mode: Use code <code className="bg-amber-100 px-2 py-1 rounded">{mockOtpHint}</code>
                </p>
              )}
              {expiresAt && (
                <p className="text-xs text-gray-500">
                  Expires at {new Date(expiresAt).toLocaleTimeString()}
                </p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  maxLength={8}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter OTP"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-transparent focus:outline-none focus:border-coral/30 font-black text-dark-navy text-center text-xl tracking-[0.3em]"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifying}
                  className="px-6 py-3 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all"
                >
                  {verifying ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sending || cooldown > 0}
                className="w-full px-6 py-2 bg-emerald-50 text-emerald-700 font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-emerald-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${sending ? "animate-spin" : ""}`} />
                {sending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </div>
          )}

          {required && (
            <div className="flex items-start gap-2 text-amber-600">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <p className="text-xs font-bold">
                Confirming your number is required before you can complete onboarding.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
