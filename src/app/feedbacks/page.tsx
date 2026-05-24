import React from "react";
import { 
  Star, 
  Quote, 
  MessageCircle, 
  ShieldCheck, 
  User,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { connectDB } from "@/database/connect";
import Feedback from "@/database/models/feedback.model";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getPublicFeedbacks() {
  try {
    await connectDB();
    return await Feedback.find({ isPublic: true }).sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return [];
  }
}

export default async function TestimonialsPage() {
  const feedbacks = await getPublicFeedbacks();

  return (
    <div className="min-h-screen bg-off-white pb-32">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden bg-dark-navy text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-coral/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full -ml-48 -mb-48 blur-3xl" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-8">
            <ShieldCheck size={16} className="text-coral" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Verified Community</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-6">
            Trusted by <span className="text-coral">hundreds</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Real feedback from students and tutors who have transformed their learning journey with Ravencrest Academy.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex items-center gap-6">
            <div className="w-16 h-16 bg-coral/10 text-coral rounded-3xl flex items-center justify-center">
              <Star size={32} className="fill-current" />
            </div>
            <div>
              <p className="text-3xl font-black text-dark-navy">4.9/5</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Average Rating</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center">
              <MessageCircle size={32} />
            </div>
            <div>
              <p className="text-3xl font-black text-dark-navy">{feedbacks.length}+</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Success Stories</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center">
              <ShieldCheck size={32} />
            </div>
            <div>
              <p className="text-3xl font-black text-dark-navy">100%</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified Reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feedbacks Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {feedbacks.map((f: any) => (
            <div 
              key={f._id} 
              className="break-inside-avoid bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-dark-navy border border-gray-100 group-hover:bg-coral group-hover:text-white transition-colors">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-dark-navy text-sm uppercase tracking-tight">{f.userName}</h4>
                    <p className="text-[10px] font-bold text-coral uppercase tracking-widest">{f.userRole}</p>
                  </div>
                </div>
                <Quote size={32} className="text-gray-100 group-hover:text-coral/20 transition-colors" />
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={i < f.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} 
                  />
                ))}
              </div>

              <p className="text-gray-600 leading-relaxed italic mb-6">
                "{f.text}"
              </p>

              {f.screenshotUrl && (
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 mb-6 group-hover:border-coral/20 transition-colors">
                  <img src={f.screenshotUrl} alt="Review Screenshot" className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-dark-navy/0 group-hover:bg-dark-navy/20 transition-colors" />
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  Verified Review
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {new Date(f.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {feedbacks.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
            <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-black text-dark-navy uppercase">No testimonials yet</h3>
            <p className="text-gray-500 mt-2">Check back soon to see what our community has to say!</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="bg-coral p-12 md:p-16 rounded-[4rem] text-center text-white relative overflow-hidden shadow-2xl shadow-coral/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-dark-navy/10 rounded-full -ml-32 -mb-32 blur-3xl" />
          
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 relative z-10">
            Ready to start your <br /> own success story?
          </h2>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <Link 
              href="/onboarding" 
              className="px-10 py-5 bg-dark-navy text-white text-xs font-black uppercase tracking-[0.2em] rounded-[2rem] hover:bg-white hover:text-dark-navy transition-all flex items-center gap-2 shadow-xl"
            >
              Get Started Now <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
