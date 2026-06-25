import { LucideIcon, Rocket, Users, Shield, Zap, BookOpen, Clock } from "lucide-react";

interface FeatureProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const FeatureCard = ({ title, description, icon: Icon, color }: FeatureProps) => (
  <div className="group p-10 bg-white rounded-[3rem] border border-gray-100 hover:border-purple-primary/20 hover:shadow-2xl hover:shadow-purple-primary/10 transition-all duration-500 hover:-translate-y-2">
    <div className={`p-5 w-fit mb-10 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-500 ${color}`}>
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-2xl font-black text-deep-black mb-4 tracking-tight uppercase">{title}</h3>
    <p className="text-steel-blue leading-relaxed font-medium">{description}</p>
  </div>
);

export default function Features() {
  const features = [
    {
      title: "Expert Tutors",
      description: "Connect with highly qualified professionals vetted for their expertise and teaching ability.",
      icon: Users,
      color: "bg-purple-primary text-white"
    },
    {
      title: "Fast Results",
      description: "Accelerate your learning curve with personalized lesson plans designed for your success.",
      icon: Rocket,
      color: "bg-purple-secondary text-white"
    },
    {
      title: "Secure Platform",
      description: "Your data and sessions are protected with industry-standard encryption and safety protocols.",
      icon: Shield,
      color: "bg-deep-black text-white"
    },
    {
      title: "Interactive Learning",
      description: "Engage in real-time collaboration with whiteboards, screen sharing, and interactive tools.",
      icon: Zap,
      color: "bg-purple-primary text-white"
    },
    {
      title: "Resource Library",
      description: "Access a vast collection of study materials, practice tests, and recorded sessions.",
      icon: BookOpen,
      color: "bg-purple-secondary text-white"
    },
    {
      title: "Flexible Scheduling",
      description: "Book sessions that fit your busy lifestyle with our 24/7 availability system.",
      icon: Clock,
      color: "bg-deep-black text-white"
    }
  ];

  return (
    <section id="features" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-24 max-w-3xl mx-auto flex flex-col gap-6">
          <span className="text-purple-primary font-black tracking-[0.3em] uppercase text-xs">Our Features</span>
          <h2 className="text-5xl sm:text-6xl font-black text-deep-black tracking-tighter uppercase">
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-primary to-purple-secondary">excel</span>
          </h2>
          <p className="text-xl text-steel-blue font-medium leading-relaxed">
            We provide a comprehensive suite of tools and services to support your educational journey at Ravencrest Academy.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
