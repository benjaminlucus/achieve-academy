import { LucideIcon, Rocket, Users, Shield, Zap, BookOpen, Clock } from "lucide-react";

interface FeatureProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const FeatureCard = ({ title, description, icon: Icon, color }: FeatureProps) => (
  <div className="group p-10 bg-white border-2 border-dark-navy hover:-translate-y-2 transition-transform duration-300">
    <div className={`p-4 w-fit mb-8 border-2 border-dark-navy ${color}`}>
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-2xl font-bold text-dark-navy mb-4 tracking-tight">{title}</h3>
    <p className="text-steel-blue leading-relaxed font-medium">{description}</p>
  </div>
);

export default function Features() {
  const features = [
    {
      title: "Expert Tutors",
      description: "Connect with highly qualified professionals vetted for their expertise and teaching ability.",
      icon: Users,
      color: "bg-off-white text-dark-navy"
    },
    {
      title: "Fast Results",
      description: "Accelerate your learning curve with personalized lesson plans designed for your success.",
      icon: Rocket,
      color: "bg-coral text-off-white"
    },
    {
      title: "Secure Platform",
      description: "Your data and sessions are protected with industry-standard encryption and safety protocols.",
      icon: Shield,
      color: "bg-steel-blue text-off-white"
    },
    {
      title: "Interactive Learning",
      description: "Engage in real-time collaboration with whiteboards, screen sharing, and interactive tools.",
      icon: Zap,
      color: "bg-rose text-off-white"
    },
    {
      title: "Resource Library",
      description: "Access a vast collection of study materials, practice tests, and recorded sessions.",
      icon: BookOpen,
      color: "bg-off-white text-dark-navy"
    },
    {
      title: "Flexible Scheduling",
      description: "Book sessions that fit your busy lifestyle with our 24/7 availability system.",
      icon: Clock,
      color: "bg-coral text-off-white"
    }
  ];

  return (
    <section id="features" className="py-32 bg-off-white relative overflow-hidden border-y-2 border-dark-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-24 max-w-3xl mx-auto flex flex-col gap-6">
          <span className="text-dark-navy font-bold tracking-widest uppercase text-xs">Our Features</span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-dark-navy tracking-tight">
            Everything you need to <span className="text-coral">excel</span> in your studies
          </h2>
          <p className="text-xl text-steel-blue font-medium">
            We provide a comprehensive suite of tools and services to support your educational journey from start to finish.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
