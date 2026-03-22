import { getAllPokemon, getAllMoves, type PokemonType } from "@/lib/dex";
import TypeTabs from "./TypeTabs";

interface Props {
  params: Promise<{ type: string }>;
}

export default async function TypePage({ params }: Props) {
  const { type: slug } = await params;
  const typeName = (slug.charAt(0).toUpperCase() + slug.slice(1)) as PokemonType;

  const pokemon = getAllPokemon().filter((p) => p.types.includes(typeName));
  const moves = getAllMoves().filter((m) => m.type === typeName);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <TypeTabs typeName={typeName} pokemon={pokemon} moves={moves} />
    </div>
  );
}
