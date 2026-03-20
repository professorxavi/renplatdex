import LOCATIONS_DATA from "./locations.json";

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

const LOCATIONS = LOCATIONS_DATA as Location[];

export function getAllLocations(): Location[] {
  return LOCATIONS;
}

export function getLocation(name: string): Location | undefined {
  return LOCATIONS.find((l) => l.name.toLowerCase() === name.toLowerCase());
}
