import { getMove, getPokemonByMove } from "@/lib/dex";
import TypeBadge from "@/components/TypeBadge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface Props {
  params: Promise<{ move: string }>;
}

const CATEGORY_STYLES: Record<string, string> = {
  Physical: "bg-orange-900/40 text-orange-300 border border-orange-700",
  Special:  "bg-blue-900/40 text-blue-300 border border-blue-700",
  Status:   "bg-gray-800 text-gray-300 border border-gray-600",
};

export default async function MovePage({ params }: Props) {
  const { move: slug } = await params;
  const moveName = decodeURIComponent(slug);
  const move = getMove(moveName);
  if (!move) notFound();

  const learners = await getPokemonByMove(move.name);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{move.name}</h1>
          <span className={cn("rounded-lg px-3 py-1 text-sm font-semibold", CATEGORY_STYLES[move.category])}>
            {move.category}
          </span>
        </div>

        <div className="flex gap-2 mb-6">
          <TypeBadge type={move.type} size="md" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Power", value: move.power ?? "—" },
            { label: "Accuracy", value: move.accuracy ? `${move.accuracy}%` : "—" },
            { label: "PP", value: move.pp },
            { label: "Priority", value: move.priority ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-[var(--surface-elevated)] p-3 text-center">
              <p className="text-xs text-[var(--text-secondary)] mb-1">{label}</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{value}</p>
            </div>
          ))}
        </div>

      </div>

      {/* Description */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Effect</h2>
        <p className="text-sm text-[var(--text-primary)] leading-relaxed">{move.description}</p>
      </div>

      {/* Learners */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">
          Pokémon that learn this move
          <span className="ml-2 font-normal opacity-60">({learners.length})</span>
        </h2>
        {learners.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No Pokémon learn this move in Gen 4.</p>
        ) : (
          <div className="rounded-xl border border-[var(--border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase w-12">#</th>
                  <th className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Pokémon</th>
                  <th className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Type</th>
                  <th className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">Method</th>
                </tr>
              </thead>
              <tbody>
                {learners.map(({ pokemon: p, methods }) => (
                  <tr key={p.name} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-elevated)]">
                    <td className="px-3 py-1.5 text-xs font-mono text-[var(--text-secondary)]">
                      {String(p.id).padStart(3, "0")}
                    </td>
                    <td className="px-3 py-1.5">
                      <Link
                        href={`/pokemon/${p.name.toLowerCase()}`}
                        className="font-medium text-red-400 hover:underline"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="flex gap-1">
                        {p.types.map((t, i) => <TypeBadge key={`${t}-${i}`} type={t} asLink={false} />)}
                      </div>
                    </td>
                    <td className="px-3 py-1.5 text-xs text-[var(--text-secondary)]">
                      {methods.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
