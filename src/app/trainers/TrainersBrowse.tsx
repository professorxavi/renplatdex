"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import battlesRaw from "@/lib/data/trainerBattles.json";

type TrainerBattle = {
  trainerName: string;
  location: string | null;
  split: string;
  mandatory?: boolean;
};

const battles = battlesRaw as TrainerBattle[];

const SPLIT_ORDER = [
  "Roark", "Gardenia", "Fantina", "Maylene",
  "Wake", "Byron", "Candice", "Volkner", "Champion",
];

// Build: split → location → [{ battle, flatIndex }]
type Entry = { battle: TrainerBattle; flatIndex: number };

const splitMap = new Map<string, Map<string, Entry[]>>();
battles.forEach((battle, i) => {
  const loc = battle.location ?? "Unknown";
  if (!splitMap.has(battle.split)) splitMap.set(battle.split, new Map());
  const locMap = splitMap.get(battle.split)!;
  if (!locMap.has(loc)) locMap.set(loc, []);
  locMap.get(loc)!.push({ battle, flatIndex: i });
});

// ---------------------------------------------------------------------------

function LocationAccordion({ location, entries }: { location: string; entries: Entry[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-[var(--surface)] hover:bg-[var(--surface-elevated)] transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-[var(--text-primary)] truncate">{location}</span>
          <span className="text-xs text-[var(--text-secondary)] shrink-0">{entries.length}</span>
        </div>
        <ChevronDown
          size={14}
          className={`ml-2 shrink-0 text-[var(--text-secondary)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--background)] p-2 flex flex-col gap-1">
          {entries.map(({ battle, flatIndex }) => {
            const href = `/trainers/${battle.split.toLowerCase()}/${flatIndex}`;
            const active = pathname === href;
            return (
              <Link
                key={flatIndex}
                href={href}
                className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-[var(--surface-elevated)] text-[var(--text-primary)] font-medium"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                }`}
              >
                {battle.trainerName}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SplitAccordion({ split }: { split: string }) {
  const [open, setOpen] = useState(false);
  const locMap = splitMap.get(split);
  if (!locMap) return null;

  const totalTrainers = [...locMap.values()].reduce((s, e) => s + e.length, 0);

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--surface)] hover:bg-[var(--surface-elevated)] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[var(--text-primary)]">{split} Split</span>
          <span className="text-xs text-[var(--text-secondary)]">{totalTrainers} trainers</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-[var(--text-secondary)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--background)] p-3 flex flex-col gap-2">
          {[...locMap.entries()].map(([location, entries]) => (
            <LocationAccordion key={location} location={location} entries={entries} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TrainersBrowse() {
  return (
    <>
      {SPLIT_ORDER.map((split) => (
        <SplitAccordion key={split} split={split} />
      ))}
    </>
  );
}
