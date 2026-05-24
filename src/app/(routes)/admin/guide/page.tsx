import React from "react";
import { 
  HelpCircle, 
  Users, 
  UserCheck, 
  Calendar, 
  LinkIcon, 
  MessageSquare, 
  CreditCard, 
  DollarSign, 
  BarChart3, 
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  Info
} from "lucide-react";

export default function AdminGuidePage() {
  const guideSections = [
    {
      title: "User Management & Verification",
      icon: Users,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      description: "Manage all registered users and handle the verification process for tutors and students.",
      points: [
        "Review new tutor and student applications in their respective tabs.",
        "Change user status to 'Interview Scheduled' once you've contacted them.",
        "Grant 'Verified' status only after a successful interview and document verification.",
        "Verified users get a badge and are visible in public listings."
      ]
    },
    {
      title: "Interviews & Onboarding",
      icon: Calendar,
      color: "bg-amber-50 text-amber-600 border-amber-100",
      description: "Track and manage the interview process for potential tutors.",
      points: [
        "Use the Interviews tab to see who is waiting for an interview.",
        "Update interview status to 'Completed' or 'Rejected' based on performance.",
        "Note: Teenagers are eligible but require a mandatory interview for safety.",
        "Interviews are currently manual—coordinate via email or chat."
      ]
    },
    {
      title: "Connections & Trials",
      icon: LinkIcon,
      color: "bg-purple-50 text-purple-600 border-purple-100",
      description: "Monitor the relationships between tutors and students.",
      points: [
        "Connections are formed when a student requests and a tutor accepts.",
        "A 7-day trial starts automatically upon connection.",
        "Monitor trial end dates in the Connections tab.",
        "The system automatically blocks chat/scheduling if trial expires without payment."
      ]
    },
    {
      title: "Payments & Financials",
      icon: CreditCard,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      description: "Oversee platform revenue and student subscriptions.",
      points: [
        "Verify student payments for subscriptions after the trial period.",
        "Manual verification of bank transfers or mobile wallet payments.",
        "Once verified, the connection status updates to 'Active', restoring full access.",
        "Keep track of the 20% platform commission on all payments."
      ]
    },
    {
      title: "Tutor Payouts",
      icon: DollarSign,
      color: "bg-rose-50 text-rose-600 border-rose-100",
      description: "Manage manual payouts to tutors via JazzCash, Easypaisa, or Bank Transfer.",
      points: [
        "Process tutor earnings minus the platform fee.",
        "Upload proof of transfer (screenshot) when marking a payout as completed.",
        "The tutor receives an automated email notification once processed.",
        "Maintain a clear record of all processed and pending payouts."
      ]
    },
    {
      title: "Analytics & Monitoring",
      icon: BarChart3,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      description: "Get insights into platform growth and activity.",
      points: [
        "Track total users, revenue, and active connections.",
        "Monitor platform health through pending tasks (payouts/verifications).",
        "Use the All Messages tab to oversee communication for safety and quality.",
        "Check Sessions to ensure tutors are delivering lessons as scheduled."
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-12">
      {/* Header */}
      <div className="bg-white p-10 rounded-[3rem] border-2 border-dark-navy shadow-[12px_12px_0px_0px_rgba(43,65,98,1)] flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="space-y-3 text-center md:text-left">
          <h1 className="text-3xl font-black text-dark-navy uppercase tracking-tight flex items-center gap-3 justify-center md:justify-start">
            <HelpCircle size={32} className="text-coral" />
            Admin Command Center Guide
          </h1>
          <p className="text-sm font-bold text-steel-blue uppercase tracking-[0.2em]">Master the tools to manage Ravencrest Academy effectively</p>
        </div>
        <div className="flex items-center gap-3 bg-off-white px-6 py-4 rounded-2xl border border-dark-navy/10">
          <ShieldCheck className="text-emerald-500" size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Access Level</p>
            <p className="text-sm font-black text-dark-navy uppercase">Administrator</p>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-coral/5 border border-coral/20 p-6 rounded-3xl flex gap-4">
          <div className="w-12 h-12 bg-coral text-white rounded-2xl flex items-center justify-center flex-shrink-0">
            <Zap size={24} />
          </div>
          <div>
            <h4 className="font-black text-dark-navy uppercase text-xs tracking-widest mb-1">Pro Tip: Automation</h4>
            <p className="text-xs text-gray-600 leading-relaxed">Trials expire automatically. You only need to intervene to verify payments or resolve disputes.</p>
          </div>
        </div>
        <div className="bg-dark-navy/5 border border-dark-navy/20 p-6 rounded-3xl flex gap-4">
          <div className="w-12 h-12 bg-dark-navy text-white rounded-2xl flex items-center justify-center flex-shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <h4 className="font-black text-dark-navy uppercase text-xs tracking-widest mb-1">Safety First</h4>
            <p className="text-xs text-gray-600 leading-relaxed">Always conduct interviews for younger tutors. Check 'All Messages' periodically to maintain quality.</p>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl flex gap-4">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 className="font-black text-dark-navy uppercase text-xs tracking-widest mb-1">Payout Proof</h4>
            <p className="text-xs text-gray-600 leading-relaxed">Always upload a screenshot of the transaction. This builds trust and keeps your records clean.</p>
          </div>
        </div>
      </div>

      {/* Main Guide Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {guideSections.map((section, index) => (
          <div key={index} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-2xl border ${section.color} group-hover:scale-110 transition-transform`}>
                  <section.icon size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-dark-navy uppercase tracking-tight">{section.title}</h3>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Operational Guide</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-8 leading-relaxed italic">
                {section.description}
              </p>

              <div className="space-y-4">
                {section.points.map((point, pIndex) => (
                  <div key={pIndex} className="flex gap-3 items-start group/point">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-coral group-hover/point:scale-150 transition-transform flex-shrink-0" />
                    <p className="text-sm text-gray-700 font-medium leading-snug">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50/50 p-4 px-8 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Module {index + 1}</span>
              <div className="flex items-center gap-1 text-[10px] font-black text-coral uppercase tracking-widest group-hover:translate-x-1 transition-transform cursor-default">
                Documentation <Info size={12} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="bg-dark-navy text-white p-12 rounded-[3rem] text-center space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-coral/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <h2 className="text-2xl font-black uppercase tracking-tight relative z-10">Need technical support?</h2>
        <p className="text-gray-300 max-w-2xl mx-auto text-sm leading-relaxed relative z-10">
          If you encounter any bugs or system errors that cannot be resolved through the dashboard, please contact the development team immediately with a description of the issue.
        </p>
        <div className="pt-6 relative z-10">
          <button className="px-10 py-4 bg-coral text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-white hover:text-dark-navy transition-all shadow-xl hover:shadow-coral/20">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
