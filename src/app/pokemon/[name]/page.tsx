import { getLearnset, getEvolutionChain, getPokemonPrevo, getAllPokemon, getPokemon } from "@/lib/dex";
import { toPokemonSlug } from "@/lib/slugs";
import STAT_CHANGES from "@/lib/data/statChanges.json";
import type { EvoChainNode } from "@/lib/dex";
import { getSpriteUrl } from "@/lib/sprites";
import { getPokemonLocations, toLocationSlug } from "@/lib/locations";
import { getTypeWeaknesses } from "@/lib/type-chart";
import TypeBadge from "@/components/TypeBadge";
import { TYPE_TEXT_COLORS } from "@/lib/type-colors";
import StatBar from "@/components/StatBar";
import FormSwitcher from "./FormSwitcher";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

export async function generateStaticParams() {
  const allPokemon = getAllPokemon();
  const params: { name: string }[] = allPokemon.map((p) => ({ name: toPokemonSlug(p.name) }));
  for (const pokemon of allPokemon) {
    for (const form of pokemon.forms) {
      params.push({ name: toPokemonSlug(form.name) });
    }
  }
  return params;
}

interface Props {
  params: Promise<{ name: string }>;
}

export default async function PokemonPage({ params }: Props) {
  const { name: slug } = await params;
  let pokemon = getAllPokemon().find((p) => toPokemonSlug(p.name) === slug);
  if (!pokemon) {
    outer: for (const p of getAllPokemon()) {
      for (const form of p.forms) {
        if (toPokemonSlug(form.name) === slug) {
          pokemon = getPokemon(form.name);
          break outer;
        }
      }
    }
  }
  if (!pokemon) return notFound();

  const bst = Object.values(pokemon.stats).reduce((a, b) => a + b, 0);
  const { fourX, twoX } = getTypeWeaknesses(pokemon.types);
  const learnset = await getLearnset(pokemon.name);
  const encounters = getPokemonLocations(pokemon.name);
  const evoChain = getEvolutionChain(pokemon.name);

  function MoveTable({ moves, showLevel }: { moves: typeof learnset.levelUp; showLevel?: boolean }) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              {showLevel && <th className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase w-12">Lv</th>}
              <th className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Move</th>
              <th className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Type</th>
              <th className="hidden sm:table-cell px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Cat</th>
              <th className="hidden sm:table-cell px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase text-right">Pwr</th>
              <th className="hidden sm:table-cell px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase text-right">Acc</th>
            </tr>
          </thead>
          <tbody>
            {moves.map((m, i) => (
              <tr key={`${m.name}-${i}`} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-elevated)]">
                {showLevel && <td className="px-3 py-1.5 text-xs text-[var(--text-secondary)] tabular-nums">{m.level}</td>}
                <td className="px-3 py-1.5">
                  <Link href={`/moves/${m.name.toLowerCase().replace(/ /g, "-")}`} className="text-xs sm:text-sm font-medium text-red-400 hover:underline">
                    {m.name}
                  </Link>
                </td>
                <td className="px-3 py-1.5">
                  <span className={`sm:hidden text-xs font-semibold ${TYPE_TEXT_COLORS[m.type]}`}>{m.type}</span>
                  <span className="hidden sm:inline"><TypeBadge type={m.type} asLink={false} /></span>
                </td>
                <td className="hidden sm:table-cell px-3 py-1.5 text-xs text-[var(--text-secondary)]">{m.category}</td>
                <td className="hidden sm:table-cell px-3 py-1.5 text-xs text-right tabular-nums">{m.power ?? "—"}</td>
                <td className="hidden sm:table-cell px-3 py-1.5 text-xs text-right tabular-nums">{m.accuracy ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Collect all unique methods from the chain that are too long to display inline
  const SYMBOLS = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨"];
  const METHOD_THRESHOLD = 14;

  function collectMethods(node: EvoChainNode, acc: string[] = []): string[] {
    for (const evo of node.evolutions) {
      acc.push(evo.method);
      collectMethods(evo.into, acc);
    }
    return acc;
  }

  const longMethods = [...new Set(collectMethods(evoChain).filter(m => m.length > METHOD_THRESHOLD))];
  const methodSymbols = new Map(longMethods.map((m, i) => [m, SYMBOLS[i]]));

  function EvoNode({ node }: { node: EvoChainNode }) {
    const isCurrent = node.name === pokemon.name;

    const nameLink = (
      <Link
        href={`/pokemon/${toPokemonSlug(node.name)}`}
        className={`text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
          isCurrent
            ? "text-red-400"
            : "text-[var(--text-primary)] hover:text-red-400"
        }`}
      >
        {node.name}
      </Link>
    );

    if (node.evolutions.length === 0) return nameLink;

    const methodConnector = (method: string) => {
      const symbol = methodSymbols.get(method);
      return (
        <div className="flex flex-col items-center w-8 sm:w-20 shrink-0 mx-1 sm:mx-3 mt-3 sm:mt-0">
          <ArrowRight size={10} className="text-[var(--text-secondary)] sm:hidden" />
          <ArrowRight size={14} className="text-[var(--text-secondary)] hidden sm:block" />
          <span className="text-[10px] text-[var(--text-secondary)] text-center whitespace-nowrap mt-1 sm:mt-0">
            {symbol ?? method}
          </span>
        </div>
      );
    };

    if (node.evolutions.length === 1) {
      return (
        <div className="flex items-center">
          {nameLink}
          {methodConnector(node.evolutions[0].method)}
          <EvoNode node={node.evolutions[0].into} />
        </div>
      );
    }

    // Branched evolutions: name on left, stacked branches on right
    return (
      <div className="flex items-center">
        {nameLink}
        <div className="flex flex-col gap-2">
          {node.evolutions.map((evo, i) => (
            <div key={`${evo.into.name}-${i}`} className="flex items-center">
              {methodConnector(evo.method)}
              <EvoNode node={evo.into} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  function SectionHeader({ title, count }: { title: string; count: number }) {
    return (
      <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">
        {title} <span className="font-normal opacity-60">({count})</span>
      </h3>
    );
  }

  const movesTab = (
    <div className="space-y-5">
      {learnset.levelUp.length > 0 && (
        <div>
          <SectionHeader title="Level-Up" count={learnset.levelUp.length} />
          <MoveTable moves={learnset.levelUp} showLevel />
        </div>
      )}
      {learnset.tm.length > 0 && (
        <div>
          <SectionHeader title="TM / HM" count={learnset.tm.length} />
          <MoveTable moves={learnset.tm} />
        </div>
      )}
      {learnset.tutor.length > 0 && (
        <div>
          <SectionHeader title="Move Tutor" count={learnset.tutor.length} />
          <MoveTable moves={learnset.tutor} />
        </div>
      )}
      {learnset.egg.length > 0 && (
        <div>
          <SectionHeader title="Egg Moves" count={learnset.egg.length} />
          <MoveTable moves={learnset.egg} />
        </div>
      )}
      {learnset.levelUp.length === 0 && learnset.tm.length === 0 && learnset.tutor.length === 0 && learnset.egg.length === 0 && (
        <p className="text-sm text-[var(--text-secondary)] px-1">No Gen 4 learnset data available.</p>
      )}
    </div>
  );


  return (
    <div className="mx-auto max-w-3xl px-4 py-8 flex flex-col gap-6">
      {/* Header card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex flex-col gap-4">
          {/* Sprite + identity */}
          <div className="flex items-start gap-4">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-elevated)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getSpriteUrl(pokemon.id, pokemon.name, pokemon.baseSpecies)}
                alt={pokemon.name}
                className="h-24 w-24 object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-mono text-[var(--text-secondary)]">#{String(pokemon.id).padStart(3, "0")}</p>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">{pokemon.name}</h1>
              <div className="flex gap-1.5 mt-2">
                {pokemon.types.map((t, i) => (
                  <TypeBadge key={`${t}-${i}`} type={t} size="md" />
                ))}
              </div>
            </div>
          </div>

          {/* Extra info */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[var(--text-secondary)]">Weight</span>
              <span className="font-medium">{pokemon.weight}kg</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[var(--text-secondary)]">Gender</span>
              <span className="font-medium">{pokemon.genderRatio ?? "Genderless"}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[var(--text-secondary)]">Egg Groups</span>
              <span className="font-medium">{pokemon.eggGroups.join(", ")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Base stats */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Base Stats</h2>
        {Object.entries(pokemon.stats).map(([key, val]) => {
          const deltas = (STAT_CHANGES as Record<string, { stats: Record<string, number> }>)[pokemon.name]?.stats;
          return <StatBar key={key} statKey={key} value={val} delta={deltas?.[key]} />;
        })}
        <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3 text-sm">
          <span className="font-semibold text-[var(--text-secondary)]">Total</span>
          <span className="text-lg font-bold text-[var(--text-primary)] pr-5">{bst}</span>
        </div>
      </div>

      {/* Type Weaknesses */}
      {(fourX.length > 0 || twoX.length > 0) && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Type Weaknesses</h2>
          <div className="flex flex-col gap-4">
            {fourX.length > 0 && (
              <div className="flex-1">
                <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2">4×</p>
                <div className="flex flex-wrap gap-1.5">
                  {fourX.map(t => <TypeBadge key={t} type={t} />)}
                </div>
              </div>
            )}
            {twoX.length > 0 && (
              <div className="flex-1">
                <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2">2×</p>
                <div className="flex flex-wrap gap-1.5">
                  {twoX.map(t => <TypeBadge key={t} type={t} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Abilities */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Abilities</h2>
        <div className="flex flex-wrap gap-2">
          {pokemon.abilities.map((a, i) => (
            <Link
              key={`${a}-${i}`}
              href={`/abilities/${a.toLowerCase().replace(/ /g, "-")}`}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent)] hover:text-red-300"
            >
              {a}
            </Link>
          ))}
          {pokemon.hiddenAbility && (
            <Link
              href={`/abilities/${pokemon.hiddenAbility.toLowerCase().replace(/ /g, "-")}`}
              className="rounded-lg border border-dashed border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-red-300"
            >
              {pokemon.hiddenAbility} <span className="text-[10px] opacity-60">(H)</span>
            </Link>
          )}
        </div>
      </div>

      {/* Evolution chain */}
      {(evoChain.evolutions.length > 0 || getPokemonPrevo(pokemon.name)) && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Evolution</h2>
          <div className="flex justify-center">
            <EvoNode node={evoChain} />
          </div>
          {longMethods.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-col gap-1">
              {longMethods.map((m) => (
                <p key={m} className="text-[10px] text-[var(--text-secondary)]">
                  <span className="mr-1">{methodSymbols.get(m)}</span>{m}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form switcher */}
      {pokemon.forms.length > 0 && (
        <FormSwitcher
          currentName={pokemon.name}
          baseName={pokemon.baseSpecies}
          forms={pokemon.forms}
        />
      )}

      {/* Locations */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Locations</h2>
        {encounters.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">
            {getPokemonPrevo(pokemon.name)
              ? `Evolve ${getPokemonPrevo(pokemon.name)}.`
              : "Not available in the wild."}
          </p>
        ) : (
          <div className="rounded-xl border border-[var(--border)] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="px-2 sm:px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Location</th>
                  <th className="whitespace-nowrap px-2 sm:px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Method</th>
                  <th className="hidden sm:table-cell w-px whitespace-nowrap px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase text-center">Level</th>
                  <th className="w-px whitespace-nowrap px-2 sm:px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase text-right">Rate</th>
                </tr>
              </thead>
              <tbody>
                {encounters.map((enc, i) => {
                  const levelStr = enc.levels.length === 1 ? `${enc.levels[0]}` : `${enc.levels[0]}–${enc.levels[enc.levels.length - 1]}`;
                  return (
                    <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-elevated)]">
                      <td className="px-2 sm:px-3 py-1.5">
                        <Link href={`/locations/${toLocationSlug(enc.location)}`} className="text-xs sm:text-sm font-medium text-red-400 hover:underline">
                          {enc.location}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-2 sm:px-3 py-1.5 text-xs text-[var(--text-secondary)]">{enc.method.charAt(0).toUpperCase() + enc.method.slice(1)}</td>
                      <td className="hidden sm:table-cell px-3 py-1.5 text-xs text-center tabular-nums text-[var(--text-secondary)]">
                        {levelStr}
                      </td>
                      <td className="w-px whitespace-nowrap px-2 sm:px-3 py-1.5 text-xs text-right tabular-nums font-medium text-[var(--text-primary)]">
                        {enc.rate === "-" ? "—" : `${enc.rate}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Moves */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Moves</h2>
        {movesTab}
      </div>
    </div>
  );
}
