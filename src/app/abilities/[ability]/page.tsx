import { getAbility, getAllPokemon, getAllAbilities } from "@/lib/dex";
import TypeBadge from "@/components/TypeBadge";
import { TYPE_TEXT_COLORS } from "@/lib/type-colors";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateStaticParams() {
  return getAllAbilities().map((a) => ({ ability: a.name.toLowerCase().replace(/ /g, "-") }));
}

interface Props {
  params: Promise<{ ability: string }>;
}

export default async function AbilityPage({ params }: Props) {
  const { ability: slug } = await params;
  const abilityName = decodeURIComponent(slug).replace(/-/g, " ");
  const ability = getAbility(abilityName);
  if (!ability) notFound();

  const withAbility = getAllPokemon().filter(
    (p) =>
      p.abilities.some((a) => a.toLowerCase() === ability.name.toLowerCase()) ||
      p.hiddenAbility?.toLowerCase() === ability.name.toLowerCase()
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-1">Ability</p>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{ability.name}</h1>
        <p className="text-sm text-[var(--text-primary)] leading-relaxed">{ability.description}</p>
      </div>

      {/* Pokémon with this ability */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">
          Pokémon with this ability
          <span className="ml-2 font-normal opacity-60">({withAbility.length})</span>
        </h2>
        {withAbility.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No Pokémon found in mock data.</p>
        ) : (
          <div className="rounded-xl border border-[var(--border)] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="w-px whitespace-nowrap px-2 sm:px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">#</th>
                  <th className="px-2 sm:px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Pokémon</th>
                  <th className="whitespace-nowrap px-2 sm:px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Type</th>
                  <th className="hidden sm:table-cell w-px whitespace-nowrap px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Slot</th>
                </tr>
              </thead>
              <tbody>
                {withAbility.map((p) => {
                  const isHidden = p.hiddenAbility?.toLowerCase() === ability.name.toLowerCase();
                  return (
                    <tr key={p.name} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-elevated)]">
                      <td className="w-px whitespace-nowrap px-2 sm:px-3 py-1.5 text-xs font-mono text-[var(--text-secondary)]">
                        {String(p.id).padStart(3, "0")}
                      </td>
                      <td className="px-2 sm:px-3 py-1.5">
                        <Link href={`/pokemon/${p.name.toLowerCase()}`} className="text-xs sm:text-sm font-medium text-red-400 hover:underline">
                          {p.name}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-2 sm:px-3 py-1.5">
                        <span className="sm:hidden flex gap-2">
                          {p.types.map((t, i) => <span key={`${t}-${i}`} className={`text-xs font-semibold ${TYPE_TEXT_COLORS[t]}`}>{t}</span>)}
                        </span>
                        <span className="hidden sm:flex gap-1">
                          {p.types.map((t, i) => <TypeBadge key={`${t}-${i}`} type={t} asLink={false} />)}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell w-px whitespace-nowrap px-3 py-1.5 text-xs text-[var(--text-secondary)]">
                        {isHidden ? "Hidden" : "Normal"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
