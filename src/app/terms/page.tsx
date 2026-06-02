import React from "react";
import { Shield, CreditCard, UserCheck, Gavel, Mail, Scale } from "lucide-react";
import Link from "next/link";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing or using Ravencrest Academy, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our platform. These terms apply to all students, tutors, and visitors.",
    icon: Scale,
  },
  {
    title: "2. User Eligibility",
    content: "Our platform is open to individuals aged 13 and above. However, all users (especially teenagers) seeking 'Verified' status must undergo a mandatory interview process with our administration to ensure safety and quality standards.",
    icon: UserCheck,
  },
  {
    title: "3. Payment & Subscriptions",
    content: "Students may enjoy a 7-day trial period with tutors. After the trial, a monthly subscription fee is required to maintain access. All payments are final once the trial period has concluded and subscription has been activated.",
    icon: CreditCard,
  },
  {
    title: "4. Tutor Payouts & Fees",
    content: "Ravencrest Academy charges a 20% platform commission on all student payments. Tutors receive 80% of the gross earnings. Payouts are processed manually upon request and after verification of completed sessions.",
    icon: Gavel,
  },
  {
    title: "5. Code of Conduct",
    content: "Users must interact with respect and professionalism. Harassment, spamming, or any form of illegal activity will result in immediate account termination without refund.",
    icon: Shield,
  },
  {
    title: "6. Platform Support",
    content: "We strive for 100% uptime, but technical issues may occur. Support is provided via our contact page. We are not liable for sessions missed due to third-party software (e.g., Zoom) failures.",
    icon: Mail,
  },
];

export default function TermsPage() {
  const lastUpdated = "May 2026";

  return (
    <div className="bg-off-white min-h-screen pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <span className="text-coral font-black uppercase tracking-[0.3em] text-xs block">Legal & Compliance</span>
          <h1 className="text-5xl md:text-6xl font-black text-dark-navy tracking-tight uppercase">
            Terms <span className="text-coral">& Conditions</span>
          </h1>
          <p className="text-steel-blue font-bold uppercase tracking-widest text-sm">Last Updated: {lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="space-y-12 bg-white p-12 md:p-20 rounded-[3rem] border border-dark-navy/5 shadow-xl">
          {sections.map((section, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-8 pb-12 border-b border-dark-navy/5 last:border-0 last:pb-0 group">
              <div className="w-16 h-16 rounded-2xl bg-off-white flex-shrink-0 flex items-center justify-center text-dark-navy group-hover:bg-coral group-hover:text-white transition-all shadow-inner">
                <section.icon size={28} />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-dark-navy uppercase tracking-tight">{section.title}</h2>
                <p className="text-lg text-steel-blue font-medium leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-20 text-center space-y-6">
          <p className="text-steel-blue font-medium max-w-2xl mx-auto italic">
            "We aim to keep our platform as simple and transparent as possible. If you have any questions regarding these terms, please don't hesitate to reach out."
          </p>
          <Link href="/contact" className="px-10 py-5 bg-dark-navy text-white font-black uppercase tracking-widest rounded-2xl hover:bg-coral transition-all inline-block shadow-lg">
            Contact Support Team
          </Link>
        </div>
      </div>
    </div>
  );
}
