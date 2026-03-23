import type { Pokemon } from "@/lib/dex";
import TypeBadge from "@/components/TypeBadge";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { getSpriteUrl } from "@/lib/sprites";
import { toPokemonSlug } from "@/lib/slugs";

interface PokemonCardProps {
  pokemon: Pokemon;
  className?: string;
}

export default function PokemonCard({ pokemon, className }: PokemonCardProps) {
  return (
    <Link
      href={`/pokemon/${toPokemonSlug(pokemon.name)}`}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:border-[var(--accent)] hover:bg-[var(--surface-elevated)] hover:shadow-lg hover:shadow-red-500/5",
        className
      )}
    >
      <div className="flex h-20 items-center justify-center rounded-lg bg-[var(--surface-elevated)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getSpriteUrl(pokemon.id, pokemon.name, pokemon.baseSpecies)}
          alt={pokemon.name}
          className="h-16 w-16 object-contain"
        />
      </div>

      <div>
        <p className="text-[10px] font-mono text-[var(--text-secondary)]">#{String(pokemon.id).padStart(3, "0")}</p>
        <p className="font-bold text-[var(--text-primary)] group-hover:text-red-300 transition-colors">
          {pokemon.name}
        </p>
      </div>

      <div className="flex gap-1 flex-wrap">
        {pokemon.types.map((t, i) => (
          <TypeBadge key={`${t}-${i}`} type={t} asLink={false} />
        ))}
      </div>

    </Link>
  );
}
