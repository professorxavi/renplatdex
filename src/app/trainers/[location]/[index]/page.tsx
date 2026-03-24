import Link from "next/link";
import { notFound } from "next/navigation";
import battlesRaw from "@/lib/data/trainerBattles.json";
import { toPokemonSlug, toMoveSlug } from "@/lib/slugs";
import { getSpriteUrl } from "@/lib/sprites";
import { TYPE_COLORS } from "@/lib/type-colors";
import type { PokemonType } from "@/lib/dex";

type Move = {
  name: string;
  type?: string;
  category?: string;
};

type BattlePokemon = {
  species: string;
  speciesId?: number;
  lvl: number;
  ivs?: number;
  item?: string;
  nature?: string;
  ability?: string;
  moves?: Move[];
};

type TrainerBattle = {
  trainerName: string;
  trainerSprite?: string | null;
  location: string | null;
  split: string;
  mandatory?: boolean;
  notes?: string;
  pokemon: BattlePokemon[];
};

const battles = battlesRaw as TrainerBattle[];

export function generateStaticParams() {
  return battles.map((b, i) => ({
    location: b.split.toLowerCase(),
    index: String(i),
  }));
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

function PartyPokemonCard({ pokemon }: { pokemon: BattlePokemon }) {
  const hasDetails = pokemon.item || pokemon.nature || pokemon.ability || pokemon.ivs !== undefined;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-3">
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

      {/* Item / Nature / Ability / IVs */}
      {hasDetails && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
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
          {pokemon.item && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[var(--text-secondary)]">Item</span>
              <span className="font-medium text-[var(--text-primary)]">{pokemon.item}</span>
            </div>
          )}
          {pokemon.ivs !== undefined && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[var(--text-secondary)]">IVs</span>
              <span className="font-medium text-[var(--text-primary)]">{pokemon.ivs}</span>
            </div>
          )}
        </div>
      )}

      {/* Moves */}
      {pokemon.moves && pokemon.moves.length > 0 && (
        <div className="flex flex-col gap-2 pt-1 border-t border-[var(--border)] mt-auto">
          <span className="text-xs text-[var(--text-secondary)]">Moves</span>
          <div className="grid grid-cols-2 gap-2">
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
  const { index: indexStr } = await params;
  const index = parseInt(indexStr, 10);

  if (isNaN(index) || index < 0 || index >= battles.length) notFound();

  const trainer = battles[index];

  return (
    <div className="px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        {trainer.trainerSprite && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trainer.trainerSprite}
            alt={trainer.trainerName}
            className="h-20 w-20 object-contain shrink-0 rounded-xl bg-[var(--surface-elevated)] p-1"
          />
        )}
        <div className="flex flex-col gap-1.5 min-w-0">
          <p className="text-xs text-[var(--text-secondary)]">
            {trainer.split} Split · {trainer.location}
          </p>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{trainer.trainerName}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-[var(--text-secondary)]">
              {trainer.pokemon.length} Pokémon
            </span>
            {trainer.mandatory !== undefined && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  trainer.mandatory
                    ? "bg-red-900/40 text-red-300 border border-red-800"
                    : "bg-blue-900/40 text-blue-300 border border-blue-800"
                }`}
              >
                {trainer.mandatory ? "Required" : "Optional"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {trainer.notes && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="text-xs font-semibold text-[var(--text-secondary)] mb-1">Notes</p>
          <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
            {trainer.notes}
          </p>
        </div>
      )}

      {/* Party */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {trainer.pokemon.map((p, i) => (
          <PartyPokemonCard key={i} pokemon={p} />
        ))}
      </div>
    </div>
  );
}
