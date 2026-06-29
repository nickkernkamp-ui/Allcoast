import { Waves } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5" aria-label="AllCoast">
      <span className={`${compact ? "h-8 w-8" : "h-10 w-10"} flex items-center justify-center rounded-full bg-[#e8f5ff] text-[var(--accent)]`}>
        <Waves size={compact ? 18 : 22} strokeWidth={2.6} />
      </span>
      <span className={`${compact ? "text-xl" : "text-2xl"} font-black`}>AllCoast</span>
    </div>
  );
}
