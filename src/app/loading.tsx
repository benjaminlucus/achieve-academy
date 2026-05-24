import { BRAND } from "@/lib/brand";

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6 hero-atmosphere">
      <div className="w-10 h-10 border-2 border-accent/40 border-t-gold rounded-full animate-spin" />
      <p className="text-[10px] font-bold text-steel-blue tracking-academy uppercase">
        Entering {BRAND.shortName}…
      </p>
    </div>
  );
}
