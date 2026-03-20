import LOCATIONS_DATA from "./data/locations.json";

export interface EncounterEntry {
  pokemon: string;
  rate: number | "-";
  levels: [number, number];
}

export interface Location {
  name: string;
  encounters: Record<string, EncounterEntry[]>;
}

export const ENCOUNTER_TYPE_LABELS: Record<string, string> = {
  morning:   "Morning",
  day:       "Day",
  night:     "Night",
  surf:      "Surfing",
  oldrod:    "Old Rod",
  goodrod:   "Good Rod",
  superrod:  "Super Rod",
  honeytree: "Honey Tree",
  pokeradar: "Poké Radar",
};

// Preferred display order for encounter types
const ENCOUNTER_TYPE_ORDER = [
  "morning", "day", "night", "surf", "oldrod", "goodrod", "superrod", "honeytree", "pokeradar",
];

export function sortEncounterTypes(types: string[]): string[] {
  return [...types].sort(
    (a, b) => (ENCOUNTER_TYPE_ORDER.indexOf(a) ?? 99) - (ENCOUNTER_TYPE_ORDER.indexOf(b) ?? 99)
  );
}

const LOCATIONS = LOCATIONS_DATA as unknown as Location[];

export function getAllLocations(): Location[] {
  return LOCATIONS;
}

export function toLocationSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getLocation(nameOrSlug: string): Location | undefined {
  return LOCATIONS.find(
    (l) => l.name.toLowerCase() === nameOrSlug.toLowerCase() || toLocationSlug(l.name) === toLocationSlug(nameOrSlug)
  );
}

export interface PokemonEncounter {
  location: string;
  method: string;
  levels: [number, number];
  rate: number | "-";
}

export function getPokemonLocations(pokemonName: string): PokemonEncounter[] {
  const name = pokemonName.toLowerCase();
  const results: PokemonEncounter[] = [];

  for (const loc of LOCATIONS) {
    for (const [type, entries] of Object.entries(loc.encounters)) {
      for (const entry of entries) {
        if (entry.pokemon.toLowerCase() === name) {
          results.push({
            location: loc.name,
            method: ENCOUNTER_TYPE_LABELS[type] ?? type,
            levels: entry.levels,
            rate: entry.rate,
          });
        }
      }
    }
  }

  return results;
}
