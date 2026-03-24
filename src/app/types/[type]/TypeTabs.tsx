"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import Link from "next/link";
import TypeBadge from "@/components/TypeBadge";
import type { Pokemon, Move, PokemonType } from "@/lib/dex";
import { TYPE_COLORS, TYPE_TEXT_COLORS } from "@/lib/type-colors";
import { toPokemonSlug } from "@/lib/slugs";
import { TYPE_CHART } from "@/lib/type-chart";

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
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-x-auto">
          {pokemon.length === 0 ? (
            <p className="text-center text-sm text-[var(--text-secondary)] py-8">No Pokémon of this type.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="w-px whitespace-nowrap px-2 sm:px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">#</th>
                  <th className="px-2 sm:px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Pokémon</th>
                  <th className="px-2 sm:px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Type</th>
                </tr>
              </thead>
              <tbody>
                {pokemon.map((p) => (
                  <tr key={p.name} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-elevated)]">
                    <td className="w-px whitespace-nowrap px-2 sm:px-3 py-1.5 text-xs font-mono text-[var(--text-secondary)]">
                      {String(p.id).padStart(3, "0")}
                    </td>
                    <td className="px-2 sm:px-3 py-1.5">
                      <Link href={`/pokemon/${toPokemonSlug(p.name)}`} className="text-xs sm:text-sm font-medium text-red-400 hover:underline">
                        {p.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-2 sm:px-3 py-1.5">
                      <span className="sm:hidden flex gap-2">
                        {p.types.map((t) => <span key={t} className={`text-xs font-semibold ${TYPE_TEXT_COLORS[t]}`}>{t}</span>)}
                      </span>
                      <span className="hidden sm:flex gap-1">
                        {p.types.map((t) => <TypeBadge key={t} type={t} asLink={false} />)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "moves" && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-x-auto">
          {moves.length === 0 ? (
            <p className="text-center text-sm text-[var(--text-secondary)] py-8">No moves of this type.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="px-2 sm:px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Move</th>
                  <th className="px-2 sm:px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Cat</th>
                  <th className="px-2 sm:px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase text-right">Pwr</th>
                  <th className="px-2 sm:px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase text-right">Acc</th>
                </tr>
              </thead>
              <tbody>
                {moves.map((m) => (
                  <tr key={m.name} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-elevated)]">
                    <td className="px-2 sm:px-3 py-1.5">
                      <Link href={`/moves/${m.name.toLowerCase().replace(/ /g, "-")}`} className="text-xs sm:text-sm font-medium text-red-400 hover:underline">
                        {m.name}
                      </Link>
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 text-xs text-[var(--text-secondary)]">{m.category}</td>
                    <td className="px-2 sm:px-3 py-1.5 text-xs text-right tabular-nums">{m.power ?? "—"}</td>
                    <td className="px-2 sm:px-3 py-1.5 text-xs text-right tabular-nums">{m.accuracy ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
