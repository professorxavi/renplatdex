"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import Link from "next/link";
import TypeBadge from "@/components/TypeBadge";
import type { Pokemon, Move, PokemonType } from "@/lib/dex";
import { TYPE_COLORS } from "@/lib/type-colors";

const TYPE_CHART: Partial<Record<PokemonType, {
  strong: PokemonType[];
  weak: PokemonType[];
  immune: PokemonType[];
}>> = {
  Fire:     { strong: ["Grass","Ice","Bug","Steel"],      weak: ["Fire","Water","Rock","Dragon"],                  immune: [] },
  Water:    { strong: ["Fire","Ground","Rock"],           weak: ["Water","Grass","Dragon"],                        immune: [] },
  Electric: { strong: ["Water","Flying"],                 weak: ["Electric","Grass","Dragon"],                     immune: ["Ground"] },
  Grass:    { strong: ["Water","Ground","Rock"],          weak: ["Fire","Grass","Poison","Flying","Bug","Dragon","Steel"], immune: [] },
  Dragon:   { strong: ["Dragon"],                        weak: ["Steel"],                                         immune: ["Fairy"] },
  Normal:   { strong: [],                                weak: ["Rock","Steel"],                                  immune: ["Ghost"] },
  Fighting: { strong: ["Normal","Ice","Rock","Dark","Steel"], weak: ["Poison","Flying","Psychic","Bug","Fairy"],   immune: ["Ghost"] },
  Poison:   { strong: ["Grass","Fairy"],                 weak: ["Poison","Ground","Rock","Ghost"],                immune: ["Steel"] },
  Ground:   { strong: ["Fire","Electric","Poison","Rock","Steel"], weak: ["Grass","Bug"],                          immune: ["Flying"] },
  Flying:   { strong: ["Grass","Fighting","Bug"],        weak: ["Electric","Rock","Steel"],                       immune: [] },
  Psychic:  { strong: ["Fighting","Poison"],             weak: ["Psychic","Steel"],                               immune: ["Dark"] },
  Bug:      { strong: ["Grass","Psychic","Dark"],        weak: ["Fire","Fighting","Flying","Ghost","Steel","Fairy"], immune: [] },
  Rock:     { strong: ["Fire","Ice","Flying","Bug"],     weak: ["Fighting","Ground","Steel"],                     immune: [] },
  Ghost:    { strong: ["Psychic","Ghost"],               weak: ["Dark"],                                          immune: ["Normal"] },
  Ice:      { strong: ["Grass","Ground","Flying","Dragon"], weak: ["Fire","Water","Ice","Steel"],                  immune: [] },
  Dark:     { strong: ["Psychic","Ghost"],               weak: ["Fighting","Dark","Fairy"],                       immune: ["Psychic"] },
  Steel:    { strong: ["Ice","Rock","Fairy"],            weak: ["Fire","Water","Electric","Steel"],               immune: ["Poison"] },
  Fairy:    { strong: ["Fighting","Dragon","Dark"],      weak: ["Fire","Poison","Steel"],                         immune: ["Dragon"] },
};

interface Props {
  typeName: PokemonType;
  pokemon: Pokemon[];
  moves: Move[];
}

export default function TypeTabs({ typeName, pokemon, moves }: Props) {
  const [tab, setTab] = useState<"moves" | "pokemon">("pokemon");
  const color = TYPE_COLORS[typeName] ?? "bg-gray-500 text-white";
  const chart = TYPE_CHART[typeName];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
        <span className={`inline-block rounded-full px-6 py-2 text-xl font-bold uppercase tracking-wide ${color}`}>
          {typeName}
        </span>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Type</p>
      </div>

      {/* Effectiveness */}
      {chart && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">
            Attack Effectiveness
          </h2>
          <div className="space-y-3">
            {chart.strong.length > 0 && (
              <div>
                <p className="text-xs text-emerald-400 mb-1.5">Super effective (×2)</p>
                <div className="flex flex-wrap gap-1.5">
                  {chart.strong.map((t) => <TypeBadge key={t} type={t} size="md" />)}
                </div>
              </div>
            )}
            {chart.weak.length > 0 && (
              <div>
                <p className="text-xs text-red-400 mb-1.5">Not very effective (×0.5)</p>
                <div className="flex flex-wrap gap-1.5">
                  {chart.weak.map((t) => <TypeBadge key={t} type={t} size="md" />)}
                </div>
              </div>
            )}
            {chart.immune.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">No effect (×0)</p>
                <div className="flex flex-wrap gap-1.5">
                  {chart.immune.map((t) => <TypeBadge key={t} type={t} size="md" />)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl bg-[var(--surface)] p-1">
        {(["pokemon", "moves"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-medium transition-all",
              tab === t ? "bg-[var(--accent)] text-white shadow" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {t === "pokemon" ? "Pokémon" : "Moves"}
          </button>
        ))}
      </div>

      {tab === "pokemon" && (
        <div className="flex flex-col gap-2">
          {pokemon.length === 0 ? (
            <p className="text-center text-sm text-[var(--text-secondary)] py-8">No Pokémon of this type.</p>
          ) : (
            pokemon.map((p) => (
              <Link
                key={p.name}
                href={`/pokemon/${p.name.toLowerCase()}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-all hover:border-[var(--accent)] hover:bg-[var(--surface-elevated)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[var(--text-secondary)]">#{String(p.id).padStart(3, "0")}</span>
                  <span className="font-semibold text-[var(--text-primary)]">{p.name}</span>
                </div>
                <div className="flex gap-1">
                  {p.types.map((t) => <TypeBadge key={t} type={t} asLink={false} />)}
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {tab === "moves" && (
        <div className="flex flex-col gap-2">
          {moves.length === 0 ? (
            <p className="text-center text-sm text-[var(--text-secondary)] py-8">No moves of this type.</p>
          ) : (
            moves.map((m) => (
              <Link
                key={m.name}
                href={`/moves/${m.name.toLowerCase().replace(/ /g, "-")}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-all hover:border-[var(--accent)] hover:bg-[var(--surface-elevated)]"
              >
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{m.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{m.category}</p>
                </div>
                <p className="font-bold text-[var(--text-primary)]">
                  {m.power ?? "—"} <span className="text-xs font-normal text-[var(--text-secondary)]">BP</span>
                </p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
