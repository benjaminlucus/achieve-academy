import HowItWorks from "@/components/HowItWorks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Learn how Ravencrest Academy connects students with expert tutors. Discover our simple process for finding the perfect mentor.",
  openGraph: {
    title: "How It Works | Ravencrest Academy",
    description: "Learn how Ravencrest Academy connects students with expert tutors.",
  },
  twitter: {
    title: "How It Works | Ravencrest Academy",
    description: "Learn how Ravencrest Academy connects students with expert tutors.",
  },
};

export default function HowItWorksPage() {
  return (
    <div className="pt-20">
      <HowItWorks />
    </div>
  );
}
