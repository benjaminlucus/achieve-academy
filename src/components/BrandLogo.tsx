import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

interface BrandLogoProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { img: 28, text: "text-sm" },
  md: { img: 36, text: "text-lg" },
  lg: { img: 44, text: "text-xl" },
};

export default function BrandLogo({
  showText = true,
  size = "md",
  className = "",
}: BrandLogoProps) {
  const s = sizes[size];
  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      <Image
        src="/logo.svg"
        alt={`${BRAND.name} logo`}
        width={s.img * 2}
        height={s.img}
        className="h-auto w-auto max-h-10 brightness-0 invert opacity-95 group-hover:opacity-100 transition-opacity"
        priority
      />
      {showText && (
        <span className={`hidden sm:flex flex-col leading-none ${s.text}`}>
          <span className="font-display font-semibold text-off-white tracking-academy uppercase">
            Ravencrest
          </span>
          <span className="text-[10px] text-steel-blue tracking-[0.35em] uppercase mt-0.5">
            Academy
          </span>
        </span>
      )}
    </Link>
  );
}
