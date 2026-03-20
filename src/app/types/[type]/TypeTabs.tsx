"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import Link from "next/link";
import TypeBadge from "@/components/TypeBadge";
import type { Pokemon, Move, PokemonType } from "@/lib/dex";
import { TYPE_COLORS } from "@/lib/type-colors";

const TYPE_CHART: Partial<Record<PokemonType, {
  attack: { strong: PokemonType[]; weak: PokemonType[]; immune: PokemonType[] };
  defense: { strong: PokemonType[]; weak: PokemonType[]; immune: PokemonType[] };
}>> = {
  Fire:     { attack: { strong: ["Grass","Ice","Bug","Steel"],           weak: ["Fire","Water","Rock","Dragon"],                  immune: [] },         defense: { strong: ["Fire","Grass","Ice","Bug","Steel","Fairy"],              weak: ["Water","Ground","Rock"],              immune: [] } },
  Water:    { attack: { strong: ["Fire","Ground","Rock"],                weak: ["Water","Grass","Dragon"],                        immune: [] },         defense: { strong: ["Fire","Water","Ice","Steel"],                            weak: ["Electric","Grass"],                   immune: [] } },
  Electric: { attack: { strong: ["Water","Flying"],                      weak: ["Electric","Grass","Dragon"],                     immune: ["Ground"] }, defense: { strong: ["Electric", "Flying", "Steel"],                                      weak: ["Ground"],                             immune: [] } },
  Grass:    { attack: { strong: ["Water","Ground","Rock"],               weak: ["Fire","Grass","Poison","Flying","Bug","Dragon","Steel"], immune: [] }, defense: { strong: ["Water","Electric","Grass","Ground"],                     weak: ["Fire","Poison","Flying","Bug","Ice"],  immune: [] } },
  Dragon:   { attack: { strong: ["Dragon"],                             weak: ["Steel"],                                         immune: ["Fairy"] },  defense: { strong: ["Fire","Water","Electric","Grass"],                       weak: ["Ice", "Dragon","Fairy"],                     immune: [] } },
  Normal:   { attack: { strong: [],                                     weak: ["Rock","Steel"],                                  immune: ["Ghost"] },  defense: { strong: [],                                                        weak: ["Fighting"],                           immune: ["Ghost"] } },
  Fighting: { attack: { strong: ["Normal","Ice","Rock","Dark","Steel"],  weak: ["Poison","Flying","Psychic","Bug","Fairy"],        immune: ["Ghost"] }, defense: { strong: ["Rock","Bug","Dark"],                                     weak: ["Flying","Psychic","Fairy"],           immune: [] } },
  Poison:   { attack: { strong: ["Grass","Fairy"],                      weak: ["Poison","Ground","Rock","Ghost"],                 immune: ["Steel"] }, defense: { strong: ["Grass", "Fighting","Poison", "Bug","Fairy"],                     weak: ["Ground","Psychic"],                   immune: [] } },
  Ground:   { attack: { strong: ["Fire","Electric","Poison","Rock","Steel"], weak: ["Grass","Bug"],                              immune: ["Flying"] }, defense: { strong: ["Poison","Rock"],                                         weak: ["Water","Grass","Ice"],                immune: ["Electric"] } },
  Flying:   { attack: { strong: ["Grass","Fighting","Bug"],             weak: ["Electric","Rock","Steel"],                       immune: [] },         defense: { strong: ["Grass","Fighting","Bug"],                                weak: ["Electric","Rock","Ice"],              immune: ["Ground"] } },
  Psychic:  { attack: { strong: ["Fighting","Poison"],                  weak: ["Psychic","Steel"],                               immune: ["Dark"] },   defense: { strong: ["Fighting","Psychic"],                                    weak: ["Bug","Ghost","Dark"],                 immune: [] } },
  Bug:      { attack: { strong: ["Grass","Psychic","Dark"],             weak: ["Fire","Fighting","Poison", "Flying","Ghost","Steel","Fairy"], immune: [] },       defense: { strong: ["Grass", "Ground","Fighting"],                             weak: ["Fire","Flying","Rock"],               immune: [] } },
  Rock:     { attack: { strong: ["Fire","Ice","Flying","Bug"],          weak: ["Fighting","Ground","Steel"],                     immune: [] },         defense: { strong: ["Normal","Fire","Poison","Flying"],                       weak: ["Water","Grass","Fighting","Ground","Steel"], immune: [] } },
  Ghost:    { attack: { strong: ["Psychic","Ghost"],                    weak: ["Dark"],                                          immune: ["Normal"] }, defense: { strong: ["Poison","Bug"],                                          weak: ["Ghost","Dark"],                       immune: ["Normal","Fighting"] } },
  Ice:      { attack: { strong: ["Grass","Ground","Flying","Dragon"],   weak: ["Fire","Water","Ice","Steel"],                    immune: [] },         defense: { strong: ["Ice"],                                                   weak: ["Fire","Fighting","Rock","Steel"],     immune: [] } },
  Dark:     { attack: { strong: ["Psychic","Ghost"],                    weak: ["Fighting","Dark","Fairy"],                       immune: [] },         defense: { strong: ["Ghost","Dark"],                                          weak: ["Fighting","Bug","Fairy"],             immune: ["Psychic"] } },
  Steel:    { attack: { strong: ["Ice","Rock","Fairy"],                 weak: ["Fire","Water","Electric","Steel"],               immune: [] },         defense: { strong: ["Normal","Dragon","Grass","Ice","Flying","Psychic","Bug","Rock","Steel","Fairy"], weak: ["Fire","Fighting","Ground"], immune: ["Poison"] } },
  Fairy:    { attack: { strong: ["Fighting","Dragon","Dark"],           weak: ["Fire","Poison","Steel"],                         immune: [] },         defense: { strong: ["Fighting","Bug","Dark"],                                 weak: ["Poison","Steel"],                     immune: ["Dragon"] } },
};

function EffectivenessSection({ title, data, invert }: {
  title: string;
  data: { strong: PokemonType[]; weak: PokemonType[]; immune: PokemonType[] };
  invert?: boolean;
}) {
  return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">{title}</h2>
        <div className="space-y-3">
          {invert && data.immune.length > 0 && (
            <div>
              <p className="text-xs text-emerald-600 mb-1.5">Immune (×0)</p>
              <div className="flex flex-wrap gap-1.5">
                {data.immune.map((t) => <TypeBadge key={t} type={t} size="md" />)}
              </div>
            </div>
          )}
          {data.strong.length > 0 && (
            <div>
              <p className="text-xs text-emerald-400 mb-1.5">
                {invert ? "Not very effective (×0.5)" : "Super effective (×2)"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.strong.map((t) => <TypeBadge key={t} type={t} size="md" />)}
              </div>
            </div>
          )}
          {data.weak.length > 0 && (
            <div>
              <p className="text-xs text-red-400 mb-1.5">
                {invert ? "Super effective (×2)" : "Not very effective (×0.5)"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.weak.map((t) => <TypeBadge key={t} type={t} size="md" />)}
              </div>
            </div>
          )}
          {!invert && data.immune.length > 0 && (
            <div>
              <p className="text-xs text-red-800 mb-1.5">No effect (×0)</p>
              <div className="flex flex-wrap gap-1.5">
                {data.immune.map((t) => <TypeBadge key={t} type={t} size="md" />)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
}

interface Props {
  typeName: PokemonType;
  pokemon: Pokemon[];
  moves: Move[];
}

export default function TypeTabs({ typeName, pokemon, moves }: Props) {
  const [tab, setTab] = useState<"moves" | "pokemon">("pokemon");
  const color = TYPE_COLORS[typeName] ?? "bg-gray-500 text-white";
  const entry = TYPE_CHART[typeName];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
        <span className={`inline-block rounded-full px-6 py-2 text-xl font-bold uppercase tracking-wide ${color}`}>
          {typeName}
        </span>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Type</p>
      </div>

      {entry && <EffectivenessSection title="Attack Effectiveness" data={entry.attack} />}
      {entry && <EffectivenessSection title="Defense Effectiveness" data={entry.defense} invert />}

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
                href={`/moves/${encodeURIComponent(m.name.toLowerCase())}`}
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
