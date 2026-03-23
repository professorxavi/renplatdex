"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { Zap, Wind, Shield, MapPin, Package } from "lucide-react";
import PokemonCard from "@/components/PokemonCard";
import type { Pokemon, Move, Ability } from "@/lib/dex";
import { TYPE_TEXT_COLORS } from "@/lib/type-colors";
import type { Location } from "@/lib/locations";
import { toLocationSlug } from "@/lib/locations";
import type { ItemsData, ItemCategory } from "@/lib/items";
import { ITEM_CATEGORY_LABELS } from "@/lib/items";
import TrainersBrowse from "@/app/trainers/TrainersBrowse";

type Tab = "pokemon" | "moves" | "abilities" | "locations" | "items";

const TABS: { id: Tab; label: string; icon: React.ReactNode; mobileHidden?: boolean }[] = [
  { id: "pokemon",   label: "Pokémon",   icon: <Zap size={14} /> },
  { id: "moves",     label: "Moves",     icon: <Wind size={14} /> },
  { id: "abilities", label: "Abilities", icon: <Shield size={14} />, mobileHidden: true },
  { id: "locations", label: "Locations", icon: <MapPin size={14} /> },
  { id: "items",     label: "Items",     icon: <Package size={14} /> },
];

interface Props {
  pokemon: Pokemon[];
  moves: Move[];
  abilities: Ability[];
  locations: Location[];
  items: ItemsData;
}

function LocationsList({ locations }: { locations: Location[] }) {
  const [view, setView] = useState<"encounters" | "trainers">("encounters");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 rounded-xl bg-[var(--surface)] border border-[var(--border)] p-1 w-fit mx-auto">
        {(["encounters", "trainers"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-xs font-medium capitalize transition-colors",
              view === v
                ? "bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {v}
          </button>
        ))}
      </div>

      {view === "encounters" && (
        <div className="flex flex-col gap-2">
          {locations.map((loc) => {
            const types = Object.keys(loc.encounters);
            const uniquePokemon = new Set(types.flatMap((t) => loc.encounters[t].map((e) => e.pokemon))).size;
            return (
              <Link
                key={loc.name}
                href={`/locations/${toLocationSlug(loc.name)}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-all hover:border-[var(--accent)] hover:bg-[var(--surface-elevated)]"
              >
                <p className="font-semibold text-[var(--text-primary)]">{loc.name}</p>
                <p className="text-xs text-[var(--text-secondary)] shrink-0">{uniquePokemon} Pokémon · {types.length} methods</p>
              </Link>
            );
          })}
        </div>
      )}

      {view === "trainers" && (
        <TrainersBrowse />
      )}
    </div>
  );
}

export default function BrowseTabs({ pokemon, moves, abilities, locations, items }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("pokemon");

  return (
    <section>
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-[var(--surface)] p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium whitespace-nowrap transition-all",
              tab.mobileHidden && "hidden sm:flex",
              activeTab === tab.id
                ? "bg-[var(--accent)] text-white shadow"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "pokemon" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {pokemon.map((p) => (
            <PokemonCard key={p.name} pokemon={p} />
          ))}
        </div>
      )}

      {activeTab === "moves" && (
        <div className="flex flex-col gap-2">
          {moves.map((m) => (
            <Link
              key={m.name}
              href={`/moves/${m.name.toLowerCase().replace(/ /g, "-")}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-all hover:border-[var(--accent)] hover:bg-[var(--surface-elevated)]"
            >
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{m.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-xs font-semibold ${TYPE_TEXT_COLORS[m.type]}`}>{m.type}</span>
                  <span className="text-xs text-[var(--text-secondary)]">· {m.category}</span>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="font-bold text-[var(--text-primary)]">{m.power ?? "—"}</p>
                <p className="text-xs text-[var(--text-secondary)]">BP</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "abilities" && (
        <div className="flex flex-col gap-2">
          {abilities.map((a) => (
            <Link
              key={a.name}
              href={`/abilities/${a.name.toLowerCase().replace(/ /g, "-")}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-all hover:border-[var(--accent)] hover:bg-[var(--surface-elevated)]"
            >
              <p className="font-semibold text-[var(--text-primary)]">{a.name}</p>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{a.shortDescription}</p>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "locations" && (
        <LocationsList locations={locations} />
      )}

      {activeTab === "items" && (
        <div className="flex flex-col gap-2">
          {(Object.keys(ITEM_CATEGORY_LABELS) as ItemCategory[]).map((cat) => (
            <Link
              key={cat}
              href={`/items/${cat}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-all hover:border-[var(--accent)] hover:bg-[var(--surface-elevated)]"
            >
              <p className="font-semibold text-[var(--text-primary)]">{ITEM_CATEGORY_LABELS[cat]}</p>
              <p className="text-xs text-[var(--text-secondary)] shrink-0">{items[cat].length} items</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
