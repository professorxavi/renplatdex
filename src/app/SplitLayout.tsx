"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Topbar from "@/components/Topbar";
import SearchBox from "@/components/SearchBox";
import BrowseTabs from "@/components/BrowseTabs";
import type { Pokemon, Move, Ability } from "@/lib/dex";
import type { Location } from "@/lib/locations";

interface Props {
  pokemon: Pokemon[];
  moves: Move[];
  abilities: Ability[];
  locations: Location[];
  children: React.ReactNode;
}

export default function SplitLayout({
  pokemon,
  moves,
  abilities,
  locations,
  children,
}: Props) {
  const pathname = usePathname();
  const isDetail = pathname !== "/";
  const browseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDetail) browseRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [isDetail]);

  return (
    <div className="flex flex-col h-full min-h-screen">
      <Topbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left browse panel — full screen on mobile, half on tablet+ */}
        <div
          ref={browseRef}
          className={`overflow-y-auto shrink-0
            ${isDetail ? "hidden md:block md:w-1/2 md:border-r md:border-[var(--border)]" : "w-full"}
            md:transition-[width] md:duration-300 md:ease-in-out`}
        >
          <div className="mx-auto max-w-2xl px-4 py-6 flex flex-col gap-6">
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
            />
          </div>
        </div>

        {/* Right detail panel — full screen on mobile, half on tablet+ */}
        <div
          className={`overflow-y-auto
            ${isDetail ? "w-full md:w-1/2 md:opacity-100" : "hidden md:block md:w-0 md:opacity-0 md:pointer-events-none"}
            md:transition-[width,opacity] md:duration-300 md:ease-in-out`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
