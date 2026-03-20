// Pokemon, moves, and abilities are now sourced from @pkmn/dex via src/lib/dex.ts
// This file retains mock data for items and locations only.

export type { PokemonType, MoveCategory, Pokemon, Move, Ability, SearchResult } from "./dex";
export { TYPE_COLORS } from "./type-colors";
export type { Location, EncounterEntry } from "./locations";
export { getAllLocations } from "./locations";

export interface Item {
  name: string;
  description: string;
}

export const MOCK_ITEMS: Item[] = [
  { name: "Choice Band", description: "An item to be held by a Pokémon. This curious band has a strong effect on its holder, sharply boosting its Attack stat but only allowing the use of one move." },
  { name: "Life Orb", description: "An item to be held by a Pokémon. It boosts the power of moves, but at the cost of some HP on each hit." },
  { name: "Leftovers", description: "An item to be held by a Pokémon. The holder's HP is slowly but steadily restored throughout every battle." },
  { name: "Focus Sash", description: "An item to be held by a Pokémon. If the holder has full HP, it will survive a hit that would KO it with just 1 HP remaining." },
];
