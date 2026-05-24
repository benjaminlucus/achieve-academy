import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Users, Trophy, Target, Sparkles } from "lucide-react";

const stats = [
  { label: "Student Satisfaction", value: "95%", icon: CheckCircle2 },
  { label: "Expert Tutors", value: "500+", icon: Users },
  { label: "Monthly Sessions", value: "10k+", icon: Trophy },
  { label: "Learning Goals Met", value: "25k+", icon: Target },
];

const values = [
  {
    title: "Student First",
    description: "Every decision we make starts with the student's success in mind.",
    icon: Target,
  },
  {
    title: "Quality Guidance",
    description: "We rigorously verify our tutors to ensure top-tier educational support.",
    icon: Sparkles,
  },
  {
    title: "Global Community",
    description: "Bridging geographical gaps to connect ambition with world-class expertise.",
    icon: Users,
  },
];

export default function AboutPage() {
  return (
    <div className="bg-off-white min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-dark-navy text-off-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-coral/10 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose/10 rounded-full -ml-48 -mb-48 blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-coral font-black uppercase tracking-[0.3em] text-xs mb-4 block">Our Story</span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 uppercase">
            Empowering Minds <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral to-rose">Through Guidance</span>
          </h1>
          <p className="text-xl text-steel-blue max-w-3xl mx-auto font-medium leading-relaxed">
            Ravencrest Academy was born from a simple idea: that every student, regardless of their background, deserves access to world-class educational guidance.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-coral translate-x-6 translate-y-6 transition-transform group-hover:translate-x-4 group-hover:translate-y-4" />
              <div className="relative border-4 border-dark-navy bg-white overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                  alt="Our Team"
                  width={800}
                  height={1000}
                  className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>

            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-4xl font-black text-dark-navy tracking-tight uppercase">The Ravencrest Academy Mission</h2>
                <p className="text-lg text-steel-blue leading-relaxed font-medium">
                  We are building more than just a tutoring platform; we are building a global bridge. In a world where quality education can sometimes feel like a luxury, we strive to make it a standard. 
                </p>
                <p className="text-lg text-steel-blue leading-relaxed font-medium">
                  Our platform focuses on automation and simplicity, allowing us to maintain a solo-founder efficiency while providing high-touch personal guidance through our network of expert tutors.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-dark-navy/5 shadow-sm">
                    <stat.icon className="text-coral mb-4" size={24} />
                    <p className="text-3xl font-black text-dark-navy tracking-tight">{stat.value}</p>
                    <p className="text-xs font-bold text-steel-blue uppercase tracking-widest mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white border-y-2 border-dark-navy/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-dark-navy tracking-tight uppercase mb-4">What We Stand For</h2>
            <p className="text-steel-blue font-bold uppercase tracking-widest text-sm">The pillars of our community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {values.map((value, i) => (
              <div key={i} className="space-y-6 p-8 rounded-[2.5rem] bg-off-white border border-dark-navy/5 hover:border-coral/20 transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-dark-navy flex items-center justify-center text-white group-hover:bg-coral transition-colors">
                  <value.icon size={32} />
                </div>
                <h3 className="text-xl font-black text-dark-navy uppercase tracking-tight">{value.title}</h3>
                <p className="text-steel-blue font-medium leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-dark-navy rounded-[3rem] p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-8">
              Be Part of the <span className="text-coral">Future of Learning</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up" className="px-10 py-5 bg-off-white text-dark-navy font-black uppercase tracking-widest rounded-2xl hover:bg-coral hover:text-white transition-all flex items-center justify-center gap-3">
                Join Us Today <ArrowRight size={20} />
              </Link>
              <Link href="/contact" className="px-10 py-5 border-2 border-white/20 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
