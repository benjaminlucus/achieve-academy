"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare, ShieldCheck, Zap } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const iconMap: Record<string, React.ComponentType<any>> = {
  MessageSquare,
  ShieldCheck,
  Zap
};

const supportCategories = [
  {
    title: "General Support",
    description: "Questions about your account or platform features.",
    iconKey: "MessageSquare",
  },
  {
    title: "Billing & Payouts",
    description: "Inquiries regarding payments, commissions, or payouts.",
    iconKey: "ShieldCheck",
  },
  {
    title: "Technical Issues",
    description: "Report bugs or technical difficulties with the site.",
    iconKey: "Zap",
  },
];

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Support",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      toast.success("Message sent! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "General Support", message: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-off-white min-h-screen pt-32 pb-20">
      <Toaster />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <span className="text-coral font-black uppercase tracking-[0.3em] text-xs block">Contact Us</span>
          <h1 className="text-5xl md:text-6xl font-black text-dark-navy tracking-tight uppercase">
            How Can We <span className="text-coral">Help You?</span>
          </h1>
          <p className="text-xl text-steel-blue font-medium leading-relaxed">
            Have questions? We're here to help you achieve your goals. Send us a message and our team will respond within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 mb-20">
          {supportCategories.map((cat, i) => {
            const IconComponent = iconMap[cat.iconKey];
            return (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-dark-navy/5 shadow-sm hover:shadow-md transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-dark-navy flex items-center justify-center text-white group-hover:bg-coral transition-colors mb-6">
                  {IconComponent && <IconComponent size={28} />}
                </div>
                <h3 className="text-xl font-black text-dark-navy uppercase tracking-tight mb-2">{cat.title}</h3>
                <p className="text-steel-blue font-medium text-sm leading-relaxed">{cat.description}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div className="space-y-12">
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-dark-navy uppercase tracking-tight">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center text-coral group-hover:bg-coral group-hover:text-white transition-all">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">Email Us</p>
                    <p className="text-lg font-bold text-dark-navy">contact@contact.ravencrestacademy.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center text-coral group-hover:bg-coral group-hover:text-white transition-all">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">Message Us</p>
                    <p className="text-lg font-bold text-dark-navy">+92 (0)330-3646773 </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center text-coral group-hover:bg-coral group-hover:text-white transition-all">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-steel-blue uppercase tracking-widest mb-1">Our Office</p>
                    <p className="text-lg font-bold text-dark-navy">Currently Remote Startup</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Times */}
            <div className="bg-dark-navy p-10 rounded-[2.5rem] text-white space-y-4 shadow-xl">
              <h3 className="text-xl font-black uppercase tracking-tight">Support Hours</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold border-b border-white/10 pb-2">
                  <span className="text-steel-blue">Monday - Friday</span>
                  <span>9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2">
                  <span className="text-steel-blue">Saturday</span>
                  <span>10:00 AM - 2:00 PM</span>
                </div>
              </div>
              <p className="text-[10px] text-coral font-black uppercase tracking-widest pt-4">Timezone: UTC +5 (PKT)</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-12 rounded-[3rem] border border-dark-navy/5 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Your Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="John Doe"
                    className="w-full px-6 py-4 bg-off-white border-2 border-transparent focus:border-dark-navy/10 rounded-2xl outline-none font-bold text-dark-navy transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="john@example.com"
                    className="w-full px-6 py-4 bg-off-white border-2 border-transparent focus:border-dark-navy/10 rounded-2xl outline-none font-bold text-dark-navy transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Category</label>
                <select 
                  className="w-full px-6 py-4 bg-off-white border-2 border-transparent focus:border-dark-navy/10 rounded-2xl outline-none font-bold text-dark-navy transition-all appearance-none cursor-pointer"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                >
                  <option>General Support</option>
                  <option>Billing & Payouts</option>
                  <option>Technical Issues</option>
                  <option>Tutor Verification</option>
                  <option>Others</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-steel-blue uppercase tracking-widest">Your Message</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="Tell us how we can help..."
                  className="w-full px-6 py-4 bg-off-white border-2 border-transparent focus:border-dark-navy/10 rounded-2xl outline-none font-bold text-dark-navy transition-all resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-dark-navy text-white font-black uppercase tracking-widest rounded-2xl hover:bg-coral transition-all shadow-xl shadow-dark-navy/10 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
