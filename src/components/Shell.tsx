import { MapPinned, Search, Star } from "lucide-react";
import type { ReactNode } from "react";
import { Brand } from "./Brand";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="safe-top sticky top-0 z-30 border-b border-[var(--line)] bg-[#fffffff2] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16 md:px-7">
          <Brand compact />
          <nav className="hidden items-center gap-2 md:flex">
            <span className="flex h-10 items-center gap-2 rounded-full bg-[#e8f5ff] px-4 text-sm font-black text-[var(--accent)]"><Search size={16} />Forecast</span>
            <span className="flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold text-[var(--muted)]"><Star size={16} />Favorites</span>
            <span className="flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold text-[var(--muted)]"><MapPinned size={16} />Spots</span>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-6 md:px-7 md:pt-8">{children}</main>
    </div>
  );
}
