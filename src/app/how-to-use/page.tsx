import React from "react";
import { 
  UserPlus, 
  Search, 
  Clock, 
  CreditCard, 
  GraduationCap, 
  Calendar, 
  ShieldCheck, 
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Users,
  Video
} from "lucide-react";
import Link from "next/link";

const studentSteps = [
  {
    title: "Sign Up & Profile",
    description: "Create your student account and tell us what you want to learn.",
    icon: UserPlus,
  },
  {
    title: "Find Your Tutor",
    description: "Browse our verified tutor directory and filter by subject or rating.",
    icon: Search,
  },
  {
    title: "7-Day Free Trial",
    description: "Connect with a tutor and enjoy 7 days of full access to test the waters.",
    icon: Clock,
  },
  {
    title: "Continue Learning",
    description: "If satisfied, complete the monthly payment to unlock permanent access.",
    icon: CreditCard,
  },
];

const tutorSteps = [
  {
    title: "Apply as Tutor",
    description: "Fill out your profile with your skills, rates, and experience.",
    icon: GraduationCap,
  },
  {
    title: "Pass the Interview",
    description: "Schedule a 1-on-1 meeting with us to verify your expertise and quality.",
    icon: Calendar,
  },
  {
    title: "Get Verified",
    description: "Receive your Green Tick badge and appear in public student listings.",
    icon: ShieldCheck,
  },
  {
    title: "Start Earning",
    description: "Connect with students, conduct sessions, and receive 80% of earnings.",
    icon: Users,
  },
];

export default function HowToUsePage() {
  return (
    <div className="bg-off-white min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <span className="text-coral font-black uppercase tracking-[0.3em] text-xs block">Application Guide</span>
          <h1 className="text-5xl md:text-6xl font-black text-dark-navy tracking-tight uppercase">
            Mastering <span className="text-coral">Ravencrest Academy</span>
          </h1>
          <p className="text-xl text-steel-blue font-medium leading-relaxed">
            Everything you need to know about using our platform, from your first login to your first successful session.
          </p>
        </div>

        {/* Eligibility Section */}
        <section className="mb-32">
          <div className="bg-dark-navy rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-coral/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-coral/20 border border-coral/20">
                  <ShieldCheck className="text-coral" size={16} />
                  <span className="text-xs font-black uppercase tracking-widest text-coral">Eligibility Rules</span>
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tight">Who Can Join Us?</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex-shrink-0 flex items-center justify-center text-coral">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 uppercase tracking-tight">Professional Tutors</h4>
                      <p className="text-steel-blue text-sm">Subject matter experts with a passion for teaching and a proven track record.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex-shrink-0 flex items-center justify-center text-coral">
                      <Users size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 uppercase tracking-tight">Teenage Tutors & Students</h4>
                      <p className="text-steel-blue text-sm">Teenagers are welcome! However, you <strong>must</strong> attend an interview with us to ensure safety and quality standards.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  <Video className="text-coral" /> The Interview Process
                </h3>
                <p className="text-steel-blue text-sm leading-relaxed">
                  Every user seeking a "Verified" status must pass a manual interview. We'll discuss your background, teaching style, and platform rules.
                </p>
                <ul className="space-y-3">
                  {["Verification of identity", "Quality of instruction check", "Platform rules briefing", "Security & Safety walkthrough"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-coral" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Path Selection */}
        <div className="grid lg:grid-cols-2 gap-20">
          {/* Student Path */}
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-dark-navy uppercase tracking-tight">Student Journey</h2>
              <p className="text-steel-blue font-medium">Follow these steps to find your perfect mentor.</p>
            </div>
            <div className="space-y-8">
              {studentSteps.map((step, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-dark-navy/5 flex-shrink-0 flex items-center justify-center text-dark-navy group-hover:bg-dark-navy group-hover:text-white transition-all shadow-sm">
                    <step.icon size={24} />
                  </div>
                  <div className="pt-2">
                    <h4 className="font-black text-dark-navy uppercase tracking-tight mb-1">Step {i + 1}: {step.title}</h4>
                    <p className="text-steel-blue text-sm font-medium leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tutor Path */}
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-dark-navy uppercase tracking-tight">Tutor Journey</h2>
              <p className="text-steel-blue font-medium">Build your global classroom in four simple steps.</p>
            </div>
            <div className="space-y-8">
              {tutorSteps.map((step, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-dark-navy/5 flex-shrink-0 flex items-center justify-center text-dark-navy group-hover:bg-coral group-hover:text-white transition-all shadow-sm">
                    <step.icon size={24} />
                  </div>
                  <div className="pt-2">
                    <h4 className="font-black text-dark-navy uppercase tracking-tight mb-1">Step {i + 1}: {step.title}</h4>
                    <p className="text-steel-blue text-sm font-medium leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Support & Errors */}
        <section className="mt-32 pt-20 border-t-2 border-dark-navy/5">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <h2 className="text-4xl font-black text-dark-navy uppercase tracking-tight">In Case of Errors</h2>
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-dark-navy/5 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                    <AlertCircle size={20} />
                  </div>
                  <h4 className="font-black text-dark-navy uppercase tracking-tight">Technical Glitches</h4>
                  <p className="text-steel-blue text-sm font-medium leading-relaxed">If a meeting link doesn't work or you can't send a message, try refreshing your dashboard or clearing your browser cache.</p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-dark-navy/5 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                    <MessageSquare size={20} />
                  </div>
                  <h4 className="font-black text-dark-navy uppercase tracking-tight">Connection Issues</h4>
                  <p className="text-steel-blue text-sm font-medium leading-relaxed">If a tutor hasn't responded to your connection request within 48 hours, you can cancel and find another expert.</p>
                </div>
              </div>
            </div>
            <div className="bg-coral p-10 rounded-[2.5rem] text-white space-y-6 shadow-xl flex flex-col justify-center">
              <h3 className="text-2xl font-black uppercase tracking-tight">Need Help?</h3>
              <p className="font-medium text-white/90">Our support team is available 24/7 to help you resolve any issues or answer your questions.</p>
              <Link href="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-dark-navy text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white hover:text-dark-navy transition-all w-fit">
                Contact Support
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-32 text-center">
          <Link href="/sign-up" className="px-12 py-6 bg-dark-navy text-white font-black uppercase tracking-widest rounded-3xl hover:bg-coral transition-all shadow-2xl shadow-dark-navy/20 inline-block">
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
}
