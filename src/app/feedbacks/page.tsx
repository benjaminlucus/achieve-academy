import React from "react";
import { 
  Star, 
  Quote, 
  MessageCircle, 
  ShieldCheck, 
  User,
  ChevronRight,
  FileText,
  ExternalLink
} from "lucide-react";
import { connectDB } from "@/database/connect";
import Feedback from "@/database/models/feedback.model";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

interface FeedbackDocument {
  _id: string;
  userId?: { _id: string; role: string; _doc: any };
  userName: string;
  userRole: string;
  rating: number;
  text: string;
  screenshotUrl?: string;
  attachments?: string[];
  createdAt: string;
}

async function getPublicFeedbacks() {
  try {
    await connectDB();
    const feedbacks = await Feedback.find({ isPublic: true }).populate('userId').sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(feedbacks)) as FeedbackDocument[];
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
      <section className="relative py-24 px-6 overflow-hidden bg-deep-black text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-primary/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-primary/10 rounded-full -ml-48 -mb-48 blur-3xl" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-8">
            <ShieldCheck size={16} className="text-purple-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Verified Community</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-6">
            Trusted by <span className="text-purple-primary">hundreds</span>
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
            <div className="w-16 h-16 bg-purple-primary/10 text-purple-primary rounded-3xl flex items-center justify-center">
              <Star size={32} className="fill-current" />
            </div>
            <div>
              <p className="text-3xl font-black text-deep-black">4.9/5</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Average Rating</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex items-center gap-6">
            <div className="w-16 h-16 bg-purple-primary/10 text-purple-primary rounded-3xl flex items-center justify-center">
              <MessageCircle size={32} />
            </div>
            <div>
              <p className="text-3xl font-black text-deep-black">{feedbacks.length}+</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Success Stories</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center">
              <ShieldCheck size={32} />
            </div>
            <div>
              <p className="text-3xl font-black text-deep-black">100%</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified Reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feedbacks Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {feedbacks.map((f) => (
            <div 
              key={f._id} 
              className="break-inside-avoid bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-deep-black border border-gray-100 group-hover:bg-purple-primary group-hover:text-white transition-colors">
                    <User size={24} />
                  </div>
                  <div>
                    {f.userId ? (
                      <Link 
                        href={f.userId.role === 'tutor' ? `/tutors/${f.userId._id}` : `/students/${f.userId._id}`}
                        className="hover:text-purple-primary transition-colors"
                      >
                        <h4 className="font-black text-deep-black text-sm uppercase tracking-tight flex items-center gap-1">
                          {f.userName} <ExternalLink size={10} />
                        </h4>
                      </Link>
                    ) : (
                      <h4 className="font-black text-deep-black text-sm uppercase tracking-tight">{f.userName}</h4>
                    )}
                    <p className="text-[10px] font-bold text-purple-primary uppercase tracking-widest">{f.userRole}</p>
                  </div>
                </div>
                <Quote size={32} className="text-gray-100 group-hover:text-purple-primary/20 transition-colors" />
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
                &quot;{f.text}&quot;
              </p>

              {/* Show attachments */}
              {(f.screenshotUrl || (f.attachments && f.attachments.length > 0)) && (
                <div className="space-y-2 mb-6">
                  {f.screenshotUrl && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 group-hover:border-purple-primary/20 transition-colors">
                      <Image src={f.screenshotUrl} alt="Review Screenshot" fill className="object-cover" />
                      <div className="absolute inset-0 bg-deep-black/0 group-hover:bg-deep-black/20 transition-colors" />
                    </div>
                  )}
                  {f.attachments && f.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {f.attachments.map((url, idx) => (
                        <a 
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-purple-primary/10 hover:border-purple-primary/20 hover:text-purple-primary transition-colors"
                        >
                          <FileText size={14} />
                          Attachment {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
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
            <h3 className="text-xl font-black text-deep-black uppercase">No testimonials yet</h3>
            <p className="text-gray-500 mt-2">Check back soon to see what our community has to say!</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="bg-purple-primary p-12 md:p-16 rounded-[4rem] text-center text-white relative overflow-hidden shadow-2xl shadow-purple-primary/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-deep-black/10 rounded-full -ml-32 -mb-32 blur-3xl" />
          
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 relative z-10">
            Ready to start your <br /> own success story?
          </h2>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <Link 
              href="/onboarding" 
              className="px-10 py-5 bg-deep-black text-white text-xs font-black uppercase tracking-[0.2em] rounded-[2rem] hover:bg-white hover:text-deep-black transition-all flex items-center gap-2 shadow-xl"
            >
              Get Started Now <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
