"use client";

import Link from "next/link";

export default function Topbar({ showTitle }: { showTitle?: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-8">
        {/* Logo */}
        <Link href="/" className={`flex items-center gap-2 transition-opacity duration-200 ${showTitle ? "opacity-100" : "opacity-0"}`}>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-zinc-700 shadow-lg shadow-amber-500/30">
            <span className="text-xs font-black text-white">RP</span>
          </div>
          <span className="font-bold text-[var(--text-primary)]">
            RenPlat Dex
          </span>
        </Link>
      </div>
    </header>
  );
}
