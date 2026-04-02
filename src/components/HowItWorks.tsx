import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Search, CalendarCheck, CreditCard } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      tag: "Step 1",
      title: "Search and filter by subject",
      description: "Browse qualified tutors by expertise and rate.",
      linkText: "Learn",
      linkHref: "#",
      nextText: "Next",
      icon: Search,
      imageSrc: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop",
      imageAlt: "Search for tutors",
      colSpan: "md:col-span-2"
    },
    {
      tag: "Step 2",
      title: "Book monthly sessions with your tutor",
      description: "Commit to consistent learning over thirty days.",
      linkText: "Next",
      linkHref: "#",
      icon: CalendarCheck,
      imageSrc: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop",
      imageAlt: "Book sessions",
      colSpan: "md:col-span-1"
    },
    {
      tag: "Step 3",
      title: "Pay securely and start learning",
      description: "Simple transparent pricing with no hidden fees.",
      linkText: "Start",
      linkHref: "#",
      icon: CreditCard,
      imageSrc: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2064&auto=format&fit=crop",
      imageAlt: "Pay securely",
      colSpan: "md:col-span-1"
    }
  ];

  return (
    <section className="py-24 bg-off-white border-y-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-dark-navy mb-4 block">Process</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-dark-navy tracking-tight mb-4">
            How it works
          </h2>
          <p className="text-lg text-steel-blue">
            Three simple steps to start learning.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className={`relative overflow-hidden group ${step.colSpan} min-h-[300px] flex flex-col justify-end p-8 border-2 border-dark-navy`}>
              <Image
                src={step.imageSrc}
                alt={step.imageAlt}
                fill
                className="object-cover absolute inset-0 z-0 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-dark-navy/70 z-10 transition-opacity duration-300 group-hover:bg-dark-navy/80"></div>
              
              <div className="relative z-20 flex flex-col h-full justify-between">
                <div className="mb-4">
                  <step.icon className="w-8 h-8 text-off-white mb-4" />
                  <span className="text-xs font-bold text-off-white/80 mb-2 block uppercase tracking-wider">{step.tag}</span>
                  <h3 className="text-2xl md:text-3xl font-bold text-off-white mb-3 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-off-white/90 text-sm md:text-base max-w-md">
                    {step.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 mt-auto pt-6">
                  {step.nextText ? (
                    <>
                      <Link href={step.linkHref} className="inline-flex items-center justify-center px-6 py-2 border-2 border-off-white text-sm font-bold text-off-white hover:bg-off-white hover:text-dark-navy transition-colors">
                        {step.linkText}
                      </Link>
                      <Link href="#" className="inline-flex items-center text-sm font-bold text-off-white hover:text-coral transition-colors">
                        {step.nextText} <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </>
                  ) : (
                    <Link href={step.linkHref} className="inline-flex items-center text-sm font-bold text-off-white hover:text-coral transition-colors">
                      {step.linkText} <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
