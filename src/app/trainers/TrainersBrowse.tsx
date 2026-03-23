"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import trainerData from "@/lib/data/trainerPokemon.json";
import { toLocationSlug } from "@/lib/slugs";

type TrainerEntry = { trainerName: string };

const locations = Object.entries(trainerData as Record<string, TrainerEntry[]>);

function LocationAccordion({
  location,
  trainers,
  locationSlug,
}: {
  location: string;
  trainers: TrainerEntry[];
  locationSlug: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--surface)] hover:bg-[var(--surface-elevated)] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[var(--text-primary)]">{location}</span>
          <span className="text-xs text-[var(--text-secondary)]">{trainers.length} trainers</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-[var(--text-secondary)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--background)] p-3 flex flex-col gap-2">
          {trainers.map((t, i) => {
            const href = `/trainers/${locationSlug}/${i}`;
            const active = pathname === href;
            return (
              <Link
                key={i}
                href={href}
                className={`block rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-[var(--accent)] bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]"
                }`}
              >
                {t.trainerName}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TrainersBrowse() {
  return (
    <>
      {locations.map(([location, trainers]) => (
        <LocationAccordion
          key={location}
          location={location}
          trainers={trainers}
          locationSlug={toLocationSlug(location)}
        />
      ))}
    </>
  );
}
