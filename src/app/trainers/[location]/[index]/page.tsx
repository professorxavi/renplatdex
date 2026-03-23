import Link from "next/link";
import { notFound } from "next/navigation";
import trainerData from "@/lib/data/trainerPokemon.json";
import { toLocationSlug, toPokemonSlug, toMoveSlug } from "@/lib/slugs";
import { getSpriteUrl } from "@/lib/sprites";
import { TYPE_COLORS } from "@/lib/type-colors";
import type { PokemonType } from "@/lib/dex";

type Move = {
  name: string;
  type?: string;
  category?: string;
};

type Pokemon = {
  species: string;
  speciesId?: number;
  lvl: number;
  item?: string;
  nature?: string;
  ability?: string;
  moves?: Move[];
};

type TrainerEntry = {
  trainerName: string;
  pokemon: Pokemon[];
};

const locationEntries = Object.entries(trainerData as Record<string, TrainerEntry[]>);

export function generateStaticParams() {
  return locationEntries.flatMap(([location, trainers]) =>
    trainers.map((_, i) => ({
      location: toLocationSlug(location),
      index: String(i),
    }))
  );
}

function findTrainer(locationSlug: string, index: number) {
  for (const [location, trainers] of locationEntries) {
    if (toLocationSlug(location) === locationSlug) {
      const trainer = trainers[index];
      if (trainer) return { location, trainer };
    }
  }
  return null;
}

function MovePill({ move }: { move: Move }) {
  const typeColor = move.type
    ? TYPE_COLORS[move.type as PokemonType]
    : "bg-[var(--surface-elevated)] text-[var(--text-primary)]";

  return (
    <Link
      href={`/moves/${toMoveSlug(move.name)}`}
      className={`flex h-8 items-center rounded-lg px-3 text-xs font-semibold transition-opacity hover:opacity-80 ${typeColor}`}
    >
      {move.name}
    </Link>
  );
}

function PartyPokemonCard({ pokemon }: { pokemon: Pokemon }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-3 justify-between">
      {/* Sprite + name + level */}
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-elevated)]">
          {pokemon.speciesId && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getSpriteUrl(pokemon.speciesId, pokemon.species, pokemon.species)}
              alt={pokemon.species}
              className="h-14 w-14 object-contain"
            />
          )}
        </div>
        <div>
          <p className="text-xs font-mono text-[var(--text-secondary)]">Lv. {pokemon.lvl}</p>
          <Link
            href={`/pokemon/${toPokemonSlug(pokemon.species)}`}
            className="text-lg font-bold text-[var(--text-primary)] hover:text-red-300 transition-colors"
          >
            {pokemon.species}
          </Link>
        </div>
      </div>

      {/* Item / Nature / Ability */}
      {(pokemon.item || pokemon.nature || pokemon.ability) && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          {pokemon.item && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[var(--text-secondary)]">Item</span>
              <span className="font-medium text-[var(--text-primary)]">{pokemon.item}</span>
            </div>
          )}
          {pokemon.nature && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[var(--text-secondary)]">Nature</span>
              <span className="font-medium text-[var(--text-primary)]">{pokemon.nature}</span>
            </div>
          )}
          {pokemon.ability && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[var(--text-secondary)]">Ability</span>
              <span className="font-medium text-[var(--text-primary)]">{pokemon.ability}</span>
            </div>
          )}
        </div>
      )}

      {/* Moves */}
      {pokemon.moves && (
        <div className="flex flex-col gap-2 pt-1 border-t border-[var(--border)] mt-auto">
          <span className="text-xs text-[var(--text-secondary)]">Moves</span>
          <div className="grid grid-cols-2 gap-3 pt-1">
            {pokemon.moves.map((move) => (
              <MovePill key={move.name} move={move} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function TrainerDetailPage({
  params,
}: {
  params: Promise<{ location: string; index: string }>;
}) {
  const { location: locationSlug, index: indexStr } = await params;
  const index = parseInt(indexStr, 10);
  const result = findTrainer(locationSlug, index);

  if (!result || isNaN(index)) notFound();

  const { location, trainer } = result;

  return (
    <div className="px-6 py-8 flex flex-col gap-6">
      <div>
        <p className="text-xs text-[var(--text-secondary)] mb-1">{location}</p>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{trainer.trainerName}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{trainer.pokemon.length} Pokémon</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {trainer.pokemon.map((p, i) => (
          <PartyPokemonCard key={i} pokemon={p} />
        ))}
      </div>
    </div>
  );
}
