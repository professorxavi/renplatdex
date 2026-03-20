"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function Topbar() {
  const pathname = usePathname();
  const isRoot = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
        {/* Back button (hidden on root) */}
        {!isRoot && (
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
          >
            <ChevronLeft size={16} />
            Back
          </Link>
        )}

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-zinc-700 shadow-lg shadow-amber-500/30">
            <span className="text-xs font-black text-white">RP</span>
          </div>
          <span className="hidden font-bold text-[var(--text-primary)] sm:block">
            RenPlat Dex
          </span>
        </Link>
      </div>
    </header>
  );
}
