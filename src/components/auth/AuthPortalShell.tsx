import { ReactNode } from "react";
import BrandLogo from "@/components/BrandLogo";
import { BRAND } from "@/lib/brand";

interface AuthPortalShellProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  bullets?: string[];
}

export default function AuthPortalShell({
  children,
  title,
  subtitle,
  bullets = [
    "Verified tutors and distinguished scholars",
    "Private scheduling and secure sessions",
    "Refined academy portal experience",
  ],
}: AuthPortalShellProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-midnight">
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 hero-atmosphere border-r border-accent/20 relative overflow-hidden">
        <BrandLogo size="lg" />
        <div className="max-w-md space-y-8 animate-fade-rise">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/40 bg-primary/40">
            <span className="w-1 h-1 rounded-full bg-gold" />
            <span className="text-[10px] font-bold text-steel-blue tracking-academy uppercase">
              {BRAND.name}
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold text-off-white leading-tight tracking-tight">
            {title}
          </h1>
          <p className="text-steel-blue text-lg leading-relaxed">{subtitle}</p>
          <ul className="space-y-4 text-steel-blue text-sm">
            {bullets.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[10px] text-steel-blue tracking-academy uppercase">
          {BRAND.copyright}
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10 section-elevated">
        <div className="w-full max-w-md animate-fade-rise-delay">
          <div className="mb-8 lg:hidden flex justify-center">
            <BrandLogo size="md" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
