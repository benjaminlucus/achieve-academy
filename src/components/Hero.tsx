import Image from "next/image";
import { SignUpButton, Show } from "@clerk/nextjs";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-off-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose/10 border border-rose/20 w-fit">
              <span className="text-sm font-semibold text-rose tracking-wide uppercase">
                Learning made simple
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-extrabold text-dark-navy leading-tight tracking-tighter">
              Unlock Your Potential with <span className="text-coral">Expert Tutors</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-steel-blue leading-relaxed">
              Personalized learning experiences tailored to your needs. Connect with top-tier tutors and achieve your academic goals faster than ever.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <button className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-off-white bg-dark-navy hover:bg-coral transition-colors border-2 border-dark-navy hover:border-coral rounded-sm">
                    Start Learning Today
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-off-white bg-dark-navy hover:bg-coral transition-colors border-2 border-dark-navy hover:border-coral rounded-sm text-center">
                  Go to Dashboard
                </Link>
              </Show>
              <button className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-dark-navy bg-transparent border-2 border-dark-navy hover:bg-dark-navy hover:text-off-white transition-colors rounded-sm">
                How it works
              </button>
            </div>
            
            <div className="flex items-center gap-6 pt-6">
              <div className="flex -space-x-3 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="inline-block h-10 w-10 rounded-full ring-4 ring-off-white bg-steel-blue/20">
                    <Image
                      src={`https://i.pravatar.cc/100?u=${i + 1}`}
                      alt="User avatar"
                      width={40}
                      height={40}
                      className="grayscale"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-steel-blue">
                Trusted by <span className="text-dark-navy font-bold">10,000+ students</span> globally
              </p>
            </div>
          </div>
          
          <div className="relative lg:ml-8 mt-12 lg:mt-0">
            <div className="absolute inset-0 bg-coral translate-x-4 translate-y-4"></div>
            <div className="relative border-2 border-dark-navy bg-white overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                alt="Students learning together"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-coral/10 text-coral">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-navy">Real-time sessions</h3>
                    <p className="text-sm text-steel-blue font-medium">Connect instantly with active tutors</p>
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
