import { getPokemon, getLearnset } from "@/lib/dex";
import { getSpriteUrl } from "@/lib/sprites";
import TypeBadge from "@/components/TypeBadge";
import StatBar from "@/components/StatBar";
import FormSwitcher from "./FormSwitcher";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface Props {
  params: Promise<{ name: string }>;
}

export default async function PokemonPage({ params }: Props) {
  const { name } = await params;
  const pokemon = getPokemon(decodeURIComponent(name));
  if (!pokemon) notFound();

  const bst = Object.values(pokemon.stats).reduce((a, b) => a + b, 0);
  const learnset = await getLearnset(pokemon.name);

  function MoveTable({ moves, showLevel }: { moves: typeof learnset.levelUp; showLevel?: boolean }) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              {showLevel && <th className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase w-12">Lv</th>}
              <th className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Move</th>
              <th className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Type</th>
              <th className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Cat</th>
              <th className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase text-right">Pwr</th>
              <th className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase text-right">Acc</th>
            </tr>
          </thead>
          <tbody>
            {moves.map((m, i) => (
              <tr key={`${m.name}-${i}`} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-elevated)]">
                {showLevel && <td className="px-3 py-1.5 text-xs text-[var(--text-secondary)] tabular-nums">{m.level}</td>}
                <td className="px-3 py-1.5">
                  <Link href={`/moves/${m.name.toLowerCase().replace(/ /g, "-")}`} className="font-medium text-red-400 hover:underline">
                    {m.name}
                  </Link>
                </td>
                <td className="px-3 py-1.5"><TypeBadge type={m.type} asLink={false} /></td>
                <td className="px-3 py-1.5 text-xs text-[var(--text-secondary)]">{m.category}</td>
                <td className="px-3 py-1.5 text-xs text-right tabular-nums">{m.power ?? "—"}</td>
                <td className="px-3 py-1.5 text-xs text-right tabular-nums">{m.accuracy ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <div className="flex items-start gap-6">
          {/* Sprite */}
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-elevated)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getSpriteUrl(pokemon.id, pokemon.name, pokemon.baseSpecies)}
              alt={pokemon.name}
              className="h-24 w-24 object-contain"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <p className="text-xs font-mono text-[var(--text-secondary)]">#{String(pokemon.id).padStart(3, "0")}</p>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">{pokemon.name}</h1>
              </div>
            </div>

            <div className="flex gap-1.5 mb-4">
              {pokemon.types.map((t, i) => (
                <TypeBadge key={`${t}-${i}`} type={t} size="md" />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Weight</span>
                <span className="font-medium">{pokemon.weight}kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Gender</span>
                <span className="font-medium">{pokemon.genderRatio ?? "Genderless"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Egg Groups</span>
                <span className="font-medium">{pokemon.eggGroups.join(", ")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Base stats */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Base Stats</h2>
        {Object.entries(pokemon.stats).map(([key, val]) => (
          <StatBar key={key} statKey={key} value={val} />
        ))}
        <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3 text-sm">
          <span className="font-semibold text-[var(--text-secondary)]">Total</span>
          <span className="text-lg font-bold text-[var(--text-primary)]">{bst}</span>
        </div>
      </div>

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
      {pokemon.evolutions && pokemon.evolutions.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Evolution</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/pokemon/${pokemon.name.toLowerCase()}`}
              className="rounded-lg bg-[var(--surface-elevated)] px-3 py-1.5 text-sm font-bold text-red-400"
            >
              {pokemon.name}
            </Link>
            {pokemon.evolutions.map((evo, i) => (
              <div key={`${evo.name}-${i}`} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <ArrowRight size={14} className="text-[var(--text-secondary)]" />
                  <span className="text-[10px] text-[var(--text-secondary)]">{evo.method}</span>
                </div>
                <Link
                  href={`/pokemon/${evo.name.toLowerCase()}`}
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent)]"
                >
                  {evo.name}
                </Link>
              </div>
            ))}
          </div>
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

      {/* Moves */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Moves</h2>
        {movesTab}
      </div>
    </div>
  );
}
