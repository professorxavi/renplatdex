"use client";

import { useRef, useState, useEffect } from "react";
import { ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import SearchBox from "@/components/SearchBox";
import BrowseTabs from "@/components/BrowseTabs";
import type { Pokemon, Move, Ability } from "@/lib/dex";
import type { Location } from "@/lib/locations";
import type { ItemsData } from "@/lib/items";

interface Props {
  pokemon: Pokemon[];
  moves: Move[];
  abilities: Ability[];
  locations: Location[];
  items: ItemsData;
  children: React.ReactNode;
}

export default function SplitLayout({
  pokemon,
  moves,
  abilities,
  locations,
  items,
  children,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const isDetail = pathname !== "/";
  const browseRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const el = browseRef.current;
    if (!el) return;
    const onScroll = () => setScrollPct(el.scrollTop / (el.scrollHeight - el.clientHeight));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const showScrollTop = scrollPct > 0.01;
  const showTopbarTitle = isDetail || scrollPct > 0.001;

  return (
    <div className="flex flex-col h-full min-h-screen">
      <Topbar showTitle={showTopbarTitle} />

      <div className="relative flex-1 overflow-hidden lg:flex">
        {/* Browse panel */}
        <div
          ref={browseRef}
          className={`absolute inset-0 overflow-y-auto
            lg:relative lg:inset-auto lg:flex-1 lg:min-w-0
            ${isDetail ? "lg:border-r lg:border-[var(--border)]" : ""}`}
          onClick={isDetail ? () => router.push("/") : undefined}
        >
          <div className="mx-auto max-w-2xl px-4 py-6 flex flex-col gap-6" onClick={(e) => e.stopPropagation()}>
            {!isDetail && (
              <div className="text-center">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">RenPlat Dex</h1>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Dex for Pokémon Renegade Platinum
                </p>
              </div>
            )}
            <SearchBox />
            <BrowseTabs
              pokemon={pokemon}
              moves={moves}
              abilities={abilities}
              locations={locations}
              items={items}
            />
          </div>
          <div
            className={`sticky bottom-6 flex justify-end pr-4 pointer-events-none transition-opacity duration-200 ${showScrollTop ? "opacity-100" : "opacity-0"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] shadow-lg hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
              onClick={() => browseRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Scroll to top"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>

        {/* Overlay — dims browse panel on mobile when drawer is open */}
        <div
          onClick={() => router.push("/")}
          className={`absolute top-0 bottom-0 left-0 right-[92%] z-10 bg-black/50 transition-opacity duration-300 lg:hidden ${
            isDetail ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        />

        {/* Detail panel — full-width drawer on mobile, fixed width on desktop */}
        <div
          className={`absolute top-0 bottom-0 right-0 w-[92%] z-20 transition-transform duration-300 ease-in-out
            ${isDetail ? "translate-x-0 shadow-[-12px_0_32px_rgba(0,0,0,0.6)]" : "translate-x-full"}
            lg:relative lg:inset-auto lg:translate-x-0 lg:shadow-none lg:shrink-0 lg:transition-[width,opacity] lg:duration-300 lg:ease-in-out
            ${isDetail ? "lg:w-[640px] lg:opacity-100" : "lg:w-0 lg:opacity-0 lg:pointer-events-none"}`}
        >
          {isDetail && (
            <button
              onClick={() => router.push("/")}
              className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] shadow-lg hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
              aria-label="Close"
            >
              <ChevronRight size={13} />
            </button>
          )}
          <div ref={detailRef} className="absolute inset-0 overflow-y-auto bg-[var(--background)]">
            {isDetail && (
              <div className="px-4 pt-4">
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
