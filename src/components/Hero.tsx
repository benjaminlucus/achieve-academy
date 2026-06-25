import Image from "next/image";
import { SignUpButton, Show } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, Video } from "lucide-react";

const AVATAR_COUNT = [1, 2, 3, 4];

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-off-white min-h-[90vh] flex items-center">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-primary/5 rounded-full -mr-96 -mt-96 blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-secondary/5 rounded-full -ml-72 -mb-72 blur-[100px]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-primary/10 border border-purple-primary/20 w-fit backdrop-blur-sm">
              <span className="text-xs font-black text-purple-primary tracking-[0.2em] uppercase">
                Learning made simple
              </span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl font-black text-deep-black leading-[1.1] tracking-tighter uppercase">
              Unlock Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-primary to-purple-secondary">Potential</span>
            </h1>
            
            <p className="text-xl text-steel-blue leading-relaxed font-medium max-w-xl">
              Personalized learning experiences tailored to your needs. Connect with top-tier tutors at Ravencrest Academy and achieve your academic goals.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <button className="w-full sm:w-auto px-10 py-5 text-sm font-black text-off-white bg-deep-black hover:bg-purple-primary transition-all duration-300 shadow-2xl shadow-purple-primary/20 uppercase tracking-widest rounded-2xl group flex items-center gap-3">
                    Start Learning Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
              </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard" className="w-full sm:w-auto px-10 py-5 text-sm font-black text-off-white bg-deep-black hover:bg-purple-primary transition-all duration-300 shadow-2xl shadow-purple-primary/20 uppercase tracking-widest rounded-2xl group flex items-center justify-center gap-3">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Show>
              <Link href="/#how-it-works" className="w-full sm:w-auto px-10 py-5 text-sm font-black text-deep-black bg-white border border-gray-100 hover:border-purple-primary/30 transition-all duration-300 shadow-xl shadow-black/5 uppercase tracking-widest rounded-2xl text-center">
                How it works
              </Link>
            </div>
            
            <div className="flex items-center gap-6 pt-8">
              <div className="flex -space-x-4 overflow-hidden">
                {(AVATAR_COUNT as any[]).map((i) => (
                  <div key={i} className="inline-block h-12 w-12 rounded-2xl ring-4 ring-off-white bg-purple-primary/10 overflow-hidden">
                    <Image
                      src={`https://i.pravatar.cc/150?u=${i + 100}`}
                      alt="User avatar"
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-black text-deep-black uppercase tracking-widest">
                  10,000+ students
                </p>
                <p className="text-[10px] font-bold text-steel-blue uppercase tracking-widest">
                  Growing globally
                </p>
              </div>
            </div>
          </div>
          
          <div className="relative lg:ml-8 mt-12 lg:mt-0 group">
            <div className="absolute inset-0 bg-purple-primary rounded-[3rem] translate-x-4 translate-y-4 opacity-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500"></div>
            <div className="relative bg-white p-4 rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden transition-all duration-500 group-hover:scale-[1.02]">
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden relative">
                <Image
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
                  alt="Students learning together"
                  width={800}
                  height={1000}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-black/60 via-transparent to-transparent" />
              </div>
              
              <div className="absolute bottom-10 left-10 right-10 p-8 bg-white/80 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-2xl">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-purple-primary text-white flex items-center justify-center shadow-lg shadow-purple-primary/30">
                    <Video size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-deep-black uppercase tracking-tight text-lg">Live Sessions</h3>
                    <p className="text-xs text-steel-blue font-bold uppercase tracking-widest">Connect with expert tutors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
