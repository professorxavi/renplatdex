import { getLocation, getAllLocations, toLocationSlug, ENCOUNTER_TYPE_LABELS, sortEncounterTypes } from "@/lib/locations";
import { toPokemonSlug } from "@/lib/slugs";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import TypeBadge from "@/components/TypeBadge";
import { TYPE_TEXT_COLORS } from "@/lib/type-colors";
import { getPokemon } from "@/lib/dex";

export async function generateStaticParams() {
  return getAllLocations().map((l) => ({ location: toLocationSlug(l.name) }));
}

interface Props {
  params: Promise<{ location: string }>;
}

export default async function LocationPage({ params }: Props) {
  const { location: slug } = await params;
  const location = getLocation(decodeURIComponent(slug));
  if (!location) notFound();

  const encounterTypes = sortEncounterTypes(Object.keys(location.encounters));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={16} className="text-rose-400" />
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest">Sinnoh</p>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{location.name}</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {encounterTypes.length} encounter {encounterTypes.length === 1 ? "method" : "methods"}
        </p>
      </div>

      {/* One node per encounter type */}
      {encounterTypes.map((type) => {
        const entries = location.encounters[type];
        const label = ENCOUNTER_TYPE_LABELS[type] ?? type;

        if (type === "repelManip") {
          const sortedEntries = [...entries].sort((a, b) => {
            const rateA = typeof a.rate === "number" ? a.rate : parseFloat(String(a.rate).split("/")[0]) || 0;
            const rateB = typeof b.rate === "number" ? b.rate : parseFloat(String(b.rate).split("/")[0]) || 0;
            return rateB - rateA;
          });
          const repelLevel = entries[0]?.levels.length === 2
            ? `Lv. ${entries[0].levels[0]} / ${entries[0].levels[1]}`
            : `Lv. ${entries[0]?.levels[0]}`;
          return (
            <div key={type} className="rounded-2xl border border-amber-500/30 bg-[var(--surface)] overflow-x-auto">
              <div className="px-5 py-3 border-b border-amber-500/30 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400">{label}</h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Use a Repel at {repelLevel}</p>
                </div>
                <span className="text-xs text-[var(--text-secondary)] opacity-60">{entries.length} slot{entries.length !== 1 ? "s" : ""}</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left">
                    <th className="px-2 sm:px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Pokémon</th>
                    <th className="w-px whitespace-nowrap px-2 sm:px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase text-right">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.map((enc, i) => {
                    const isCombo = enc.pokemon.includes("/");
                    const names = enc.pokemon.split("/");
                    return (
                      <tr key={`${enc.pokemon}-${i}`} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-elevated)] transition-colors">
                        <td className="px-2 sm:px-4 py-2">
                          {isCombo ? (
                            <span className="flex gap-1 text-xs sm:text-sm font-medium">
                              {names.map((n, j) => (
                                <span key={n}>
                                  <Link href={`/pokemon/${toPokemonSlug(n.trim())}`} className="text-red-400 hover:underline">{n.trim()}</Link>
                                  {j < names.length - 1 && <span className="text-[var(--text-secondary)] mx-1">/</span>}
                                </span>
                              ))}
                            </span>
                          ) : (
                            <Link href={`/pokemon/${toPokemonSlug(enc.pokemon)}`} className="text-xs sm:text-sm font-medium text-red-400 hover:underline">
                              {enc.pokemon}
                            </Link>
                          )}
                        </td>
                        <td className="w-px whitespace-nowrap px-2 sm:px-4 py-2 text-xs text-right tabular-nums font-medium text-[var(--text-primary)]">
                          {typeof enc.rate === "string" ? enc.rate.replace("—", "—") + "%" : `${enc.rate}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <div key={type} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-x-auto">
            <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">{label}</h2>
              <span className="text-xs text-[var(--text-secondary)] opacity-60">{entries.length} slot{entries.length !== 1 ? "s" : ""}</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="px-2 sm:px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Pokémon</th>
                  <th className="whitespace-nowrap px-2 sm:px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Type</th>
                  <th className="hidden sm:table-cell w-px whitespace-nowrap px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase text-center">Level</th>
                  <th className="w-px whitespace-nowrap px-2 sm:px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase text-right">Rate</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((enc, i) => {
                  const pokemon = getPokemon(enc.pokemon);
                  const levelStr = enc.levels.length === 1 ? `${enc.levels[0]}` : `${enc.levels[0]}–${enc.levels[enc.levels.length - 1]}`;
                  return (
                    <tr key={`${enc.pokemon}-${i}`} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-elevated)] transition-colors">
                      <td className="px-2 sm:px-4 py-2">
                        <Link
                          href={`/pokemon/${toPokemonSlug(enc.pokemon)}`}
                          className="text-xs sm:text-sm font-medium text-red-400 hover:underline"
                        >
                          {enc.pokemon}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-2 sm:px-4 py-2">
                        <span className="sm:hidden flex gap-1.5">
                          {pokemon?.types.map((t, i) => (
                            <span key={`${t}-${i}`} className={`text-xs font-semibold ${TYPE_TEXT_COLORS[t]}`}>{t}</span>
                          ))}
                        </span>
                        <span className="hidden sm:flex gap-1">
                          {pokemon?.types.map((t, i) => (
                            <TypeBadge key={`${t}-${i}`} type={t} asLink={false} />
                          ))}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell w-px whitespace-nowrap px-4 py-2 text-center tabular-nums text-[var(--text-secondary)]">{levelStr}</td>
                      <td className="w-px whitespace-nowrap px-2 sm:px-4 py-2 text-xs text-right tabular-nums font-medium text-[var(--text-primary)]">
                        {enc.rate === "-" ? "—" : `${enc.rate}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
