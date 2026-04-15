import React from "react";
import { 
  Settings, 
  ShieldCheck, 
  Bell, 
  Globe, 
  Mail, 
  Lock, 
  Database, 
  CreditCard,
  ChevronRight,
  Info
} from "lucide-react";
import { getCurrentUser } from "@/lib/utils";
import { redirect } from "next/navigation";

const settingSections = [
  { icon: ShieldCheck, title: "Platform Security", description: "Admin roles, permissions, and audit logs" },
  { icon: Globe, title: "General Settings", description: "Global site settings, localization, and branding" },
  { icon: Bell, title: "Notification Center", description: "Email templates and system alerts" },
  { icon: CreditCard, title: "Pricing & Billing", description: "Commission rates and payout cycles" },
  { icon: Database, title: "Data Management", description: "System backups and storage limits" },
  { icon: Lock, title: "Privacy Policy", description: "GDPR compliance and data retention" },
];

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return redirect("/admin");
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Admin Settings</h2>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Configure system-wide preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left: Main Settings Navigation */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
           {settingSections.map((section, i) => (
             <button key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-coral/20 transition-all flex flex-col items-start group text-left">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-coral group-hover:text-white transition-all mb-4">
                   <section.icon size={24} />
                </div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase group-hover:text-coral transition-colors">{section.title}</h3>
                <p className="text-xs font-medium text-gray-500 mt-2 leading-relaxed">{section.description}</p>
                <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-coral uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                   Manage Section <ChevronRight size={14} />
                </div>
             </button>
           ))}
        </div>

        {/* Right: Quick Info / System Status */}
        <div className="space-y-8">
           <div className="bg-dark-navy p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -rotate-45 translate-x-16 -translate-y-16" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6">System Status</h3>
              <div className="space-y-6">
                 <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Version</span>
                    <span className="text-xs font-black tracking-widest text-emerald-400">v2.4.0 (Stable)</span>
                 </div>
                 <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Database</span>
                    <span className="text-xs font-black tracking-widest text-emerald-400 italic">Connected</span>
                 </div>
                 <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cloud Storage</span>
                    <span className="text-xs font-black tracking-widest text-emerald-400">82% Available</span>
                 </div>
                 <div className="flex justify-between items-center pt-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">API Uptime</span>
                    <span className="text-xs font-black tracking-widest text-emerald-400">99.98%</span>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-amber-50 rounded-xl text-amber-500 border border-amber-100">
                    <Info size={20} />
                 </div>
                 <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Administrator Tip</h3>
              </div>
              <p className="text-xs font-medium text-gray-500 leading-relaxed italic">
                "Regularly auditing user permissions and reviewing tutor approvals ensures platform quality and safety."
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}
