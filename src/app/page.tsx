import Hero from "@/components/Hero";
import Features from "@/components/Features";
import TutorFeatures from "@/components/TutorFeatures";
import HowItWorks from "@/components/HowItWorks";
import StudentFeatures from "@/components/StudentFeatures";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Hero />
      <TutorFeatures />
      <HowItWorks />
      <StudentFeatures />
      <Features />
      
      {/* About Section */}
      <section id="about" className="py-32 bg-white border-y-2 border-dark-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-coral translate-x-4 translate-y-4"></div>
              <div className="relative border-2 border-dark-navy bg-white overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=2070&auto=format&fit=crop"
                  alt="Student studying online"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-8">
              <span className="text-dark-navy font-bold tracking-widest uppercase text-xs">About Achieve Academy</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-dark-navy tracking-tight leading-tight">
                Our mission is to make quality <span className="text-coral">education accessible</span> to everyone.
              </h2>
              <p className="text-xl text-steel-blue leading-relaxed font-medium">
                At Achieve Academy, we believe that every student has the potential to excel if given the right guidance. Our platform bridges the gap between ambitious students and world-class tutors.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-8 pt-4">
                <div className="flex flex-col gap-2 border-l-4 border-coral pl-4">
                  <span className="text-3xl font-extrabold text-dark-navy tracking-tight">95%</span>
                  <span className="text-steel-blue font-bold">Student Satisfaction</span>
                </div>
                <div className="flex flex-col gap-2 border-l-4 border-coral pl-4">
                  <span className="text-3xl font-extrabold text-dark-navy tracking-tight">500+</span>
                  <span className="text-steel-blue font-bold">Expert Tutors</span>
                </div>
                <div className="flex flex-col gap-2 border-l-4 border-coral pl-4">
                  <span className="text-3xl font-extrabold text-dark-navy tracking-tight">10k+</span>
                  <span className="text-steel-blue font-bold">Monthly Sessions</span>
                </div>
                <div className="flex flex-col gap-2 border-l-4 border-coral pl-4">
                  <span className="text-3xl font-extrabold text-dark-navy tracking-tight">24/7</span>
                  <span className="text-steel-blue font-bold">Platform Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-off-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-dark-navy border-2 border-dark-navy p-12 sm:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-coral"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose"></div>
            
            <div className="relative z-10 flex flex-col gap-8 bg-dark-navy/90 backdrop-blur-sm p-8 border-2 border-off-white/20">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-off-white tracking-tight leading-tight">
                Ready to start your <span className="text-coral">learning journey?</span>
              </h2>
              <p className="text-xl text-steel-blue max-w-2xl mx-auto font-medium">
                Join thousands of students who are already achieving their goals with Achieve Academy.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-dark-navy bg-off-white hover:bg-coral hover:text-off-white transition-colors border-2 border-off-white hover:border-coral">
                  Get Started for Free
                </button>
                <button className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-off-white border-2 border-off-white hover:bg-off-white hover:text-dark-navy transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
