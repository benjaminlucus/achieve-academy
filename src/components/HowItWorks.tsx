import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Search, CalendarCheck, CreditCard, UserPlus, BookOpen, CheckCircle } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      tag: "Step 1",
      title: "Create your profile",
      description: "Sign up as a student or tutor. Complete your profile with your expertise, subjects, and availability to get started.",
      linkText: "Get Started",
      linkHref: "/sign-up",
      icon: UserPlus,
      imageSrc: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop",
      imageAlt: "Create profile",
      colSpan: "md:col-span-2"
    },
    {
      tag: "Step 2",
      title: "Find your perfect match",
      description: "Browse our list of verified expert tutors or students. Filter by subjects, rates, and reviews to find the right fit.",
      linkText: "Browse Tutors",
      linkHref: "/tutors",
      icon: Search,
      imageSrc: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
      imageAlt: "Search and filter",
      colSpan: "md:col-span-2"
    },
    {
      tag: "Step 3",
      title: "Book and schedule",
      description: "Select a convenient time slot from the tutor's availability. Book your monthly sessions and manage your calendar easily.",
      linkText: "Book Now",
      linkHref: "/tutors",
      icon: CalendarCheck,
      imageSrc: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop",
      imageAlt: "Schedule sessions",
      colSpan: "md:col-span-1"
    },
    {
      tag: "Step 4",
      title: "Secure payment",
      description: "Pay securely through our platform. We ensure your transactions are protected and transparent for both parties.",
      linkText: "Learn More",
      linkHref: "#",
      icon: CreditCard,
      imageSrc: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2064&auto=format&fit=crop",
      imageAlt: "Secure payment",
      colSpan: "md:col-span-1"
    },
    {
      tag: "Step 5",
      title: "Start learning",
      description: "Join your sessions via the meeting link provided. Track your progress and achieve your academic goals with ease.",
      linkText: "Dashboard",
      linkHref: "/dashboard",
      icon: BookOpen,
      imageSrc: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop",
      imageAlt: "Start learning",
      colSpan: "md:col-span-2"
    }
  ];

  return (
    <section className="py-24 bg-off-white border-y-2 border-dark-navy/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <span className="px-3 py-1 bg-coral/10 text-coral text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
              The Process
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-dark-navy tracking-tight mb-4 uppercase">
            How it <span className="text-coral">Works</span>
          </h2>
          <p className="text-sm font-bold text-steel-blue uppercase tracking-widest max-w-2xl mx-auto">
            Everything you need to know about starting your journey with Achieve Academy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className={`relative overflow-hidden group ${step.colSpan} min-h-[350px] flex flex-col justify-end p-8 border-2 border-dark-navy shadow-[4px_4px_0px_0px_#2b4162] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-300`}>
              <Image
                src={step.imageSrc}
                alt={step.imageAlt}
                fill
                className="object-cover absolute inset-0 z-0 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-dark-navy/80 z-10 transition-opacity duration-300 group-hover:bg-dark-navy/90"></div>
              
              <div className="relative z-20 flex flex-col h-full justify-between">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-coral flex items-center justify-center rounded-xl mb-6 shadow-lg transform group-hover:rotate-12 transition-transform">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] font-black text-coral mb-2 block uppercase tracking-[0.3em]">{step.tag}</span>
                  <h3 className="text-2xl font-black text-off-white mb-3 leading-tight uppercase tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-off-white/70 text-xs font-medium leading-relaxed max-w-md">
                    {step.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 mt-auto pt-6">
                  <Link href={step.linkHref} className="inline-flex items-center text-[10px] font-black text-off-white uppercase tracking-[0.2em] hover:text-coral transition-colors group/link">
                    {step.linkText} 
                    <ChevronRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-8 p-12 bg-dark-navy rounded-3xl border-2 border-dark-navy shadow-[8px_8px_0px_0px_#ff6f61]">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Ready to start?</h3>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest leading-loose">Join hundreds of students and tutors today.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-up" className="px-8 py-4 bg-coral text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-dark-navy transition-all shadow-lg">
              Get Started Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

