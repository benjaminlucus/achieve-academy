import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function TutorFeatures() {
  const features = [
    {
      tag: "Global",
      title: "Access a worldwide student community",
      description: "Build your reputation across borders and time zones.",
      linkText: "Register",
      linkHref: "#",
      imageSrc: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop",
      imageAlt: "Global student community"
    },
    {
      tag: "Predictable",
      title: "Monthly earnings you can plan around",
      description: "Know your income in advance with committed students.",
      linkText: "Start",
      linkHref: "#",
      imageSrc: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop",
      imageAlt: "Predictable earnings"
    },
    {
      tag: "Control",
      title: "Set your own rates and availability",
      description: "Choose which students fit your teaching style best.",
      linkText: "Apply",
      linkHref: "#",
      imageSrc: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop",
      imageAlt: "Control your schedule"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-dark-navy mb-4 block">Tutors</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-dark-navy tracking-tight mb-4">
            Grow your teaching practice
          </h2>
          <p className="text-lg text-steel-blue">
            Teach students globally with minimal administrative burden.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col border-2 border-dark-navy bg-white group hover:-translate-y-2 transition-transform duration-300">
              <div className="p-8 flex-grow flex flex-col">
                <span className="text-xs font-bold text-dark-navy mb-4 block">{feature.tag}</span>
                <h3 className="text-2xl font-bold text-dark-navy mb-4 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-steel-blue mb-8 flex-grow">
                  {feature.description}
                </p>
                <Link href={feature.linkHref} className="inline-flex items-center text-sm font-bold text-dark-navy hover:text-coral transition-colors w-fit">
                  {feature.linkText} <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="relative h-64 w-full border-t-2 border-dark-navy overflow-hidden">
                <Image
                  src={feature.imageSrc}
                  alt={feature.imageAlt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
