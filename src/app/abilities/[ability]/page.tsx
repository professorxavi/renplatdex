import { getAbility, getAllPokemon } from "@/lib/dex";
import TypeBadge from "@/components/TypeBadge";
import { notFound } from "next/navigation";
import Link from "next/link";

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
        </h2>
        {withAbility.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No Pokémon found in mock data.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {withAbility.map((p) => {
              const isHidden = p.hiddenAbility?.toLowerCase() === ability.name.toLowerCase();
              return (
                <Link
                  key={p.name}
                  href={`/pokemon/${p.name.toLowerCase()}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-[var(--surface-elevated)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[var(--text-secondary)]">#{String(p.id).padStart(3, "0")}</span>
                    <span className="font-medium text-[var(--text-primary)]">{p.name}</span>
                    {isHidden && (
                      <span className="text-[10px] text-[var(--text-secondary)] border border-dashed border-[var(--border)] rounded px-1">H</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {p.types.map((t, i) => <TypeBadge key={`${t}-${i}`} type={t} asLink={false} />)}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
