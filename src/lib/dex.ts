import { Dex } from "@pkmn/dex";
import { Generations } from "@pkmn/data";
import _GEN7_OVERRIDES from "./gen7-overrides.json";
import _RP_POKEMON_OVERRIDES from "./rp-pokemon-overrides.json";
import _MOVELIST from "./movelist.json";
type Gen7Override = { types?: string[]; stats?: Record<string, number> };
type RpPokemonOverride = { types?: string[]; stats?: Record<string, number>; abilities?: string[]; learnset?: Record<string, string[]> };
const GEN7_OVERRIDES = _GEN7_OVERRIDES as Record<string, Gen7Override>;
const RP_POKEMON_OVERRIDES = _RP_POKEMON_OVERRIDES as Record<string, RpPokemonOverride>;
const MOVELIST = _MOVELIST as Move[];
const MOVE_BY_ID = new Map(MOVELIST.map((m) => [m.name.toLowerCase().replace(/ /g, ""), m]));

const gens = new Generations(Dex);
export const gen4 = gens.get(4);


// ─── Types ────────────────────────────────────────────────────────────────────

export type PokemonType =
  | "Normal" | "Fire" | "Water" | "Electric" | "Grass" | "Ice"
  | "Fighting" | "Poison" | "Ground" | "Flying" | "Psychic" | "Bug"
  | "Rock" | "Ghost" | "Dragon" | "Dark" | "Steel" | "Fairy";

export type MoveCategory = "Physical" | "Special" | "Status";

export interface FormVariant {
  name: string;
  formName: string;
  types: PokemonType[];
}

export interface Pokemon {
  id: number;
  name: string;
  baseSpecies: string;
  types: PokemonType[];
  stats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  abilities: string[];
  hiddenAbility?: string;
  weight: number;
  eggGroups: string[];
  genderRatio?: string;
  evolutions?: { name: string; method: string }[];
  forms: FormVariant[];
}

export interface Move {
  name: string;
  type: PokemonType;
  category: MoveCategory;
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  flags: string[];
  description: string;
}

export interface Ability {
  name: string;
  description: string;
  shortDescription: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatGenderRatio(ratio: { M: number; F: number } | undefined): string | undefined {
  if (!ratio) return "Genderless";
  if (ratio.M === 1) return "Male only";
  if (ratio.F === 1) return "Female only";
  return `${ratio.M * 100}% M / ${ratio.F * 100}% F`;
}

function formatEvoMethod(evoName: string): string {
  const raw = Dex.species.get(evoName);
  const parts: string[] = [];

  if (!raw.evoType && raw.evoLevel) {
    parts.push(`Level ${raw.evoLevel}`);
  } else {
    switch (raw.evoType) {
      case "useItem":   parts.push(raw.evoItem ?? "Item"); break;
      case "trade":     parts.push(raw.evoItem ? `Trade (${raw.evoItem})` : "Trade"); break;
      case "levelFriendship": parts.push("Friendship"); break;
      case "levelMove": parts.push(`Know ${raw.evoMove}`); break;
      case "levelHold": parts.push(raw.evoItem ? `Level up holding ${raw.evoItem}` : "Level up"); break;
      case "levelExtra": parts.push("Level up"); break;
      default:          if (raw.evoLevel) parts.push(`Level ${raw.evoLevel}`);
    }
  }

  if (raw.evoCondition) parts.push(raw.evoCondition);
  return parts.join(", ") || "Level up";
}

type Gen4Species = NonNullable<ReturnType<typeof gen4.species.get>>;

function mapSpecies(s: Gen4Species, forms: FormVariant[]): Pokemon {
  const g7 = GEN7_OVERRIDES[s.name as keyof typeof GEN7_OVERRIDES];
  const rp = RP_POKEMON_OVERRIDES[s.name.toLowerCase() as keyof typeof RP_POKEMON_OVERRIDES];
  return {
    id: s.num,
    name: s.name,
    baseSpecies: s.baseSpecies,
    types: (rp?.types ?? g7?.types ?? s.types) as PokemonType[],
    stats: { ...s.baseStats, ...(g7?.stats ?? {}), ...(rp?.stats ?? {}) },
    abilities: rp?.abilities ?? (Object.entries(s.abilities)
      .filter(([key]) => key !== "H" && key !== "S")
      .map(([, val]) => val)
      .filter(Boolean) as string[]),
    hiddenAbility: s.abilities["H"] || undefined,
    weight: s.weightkg,
    eggGroups: s.eggGroups,
    genderRatio: formatGenderRatio(s.genderRatio as { M: number; F: number } | undefined),
    evolutions: s.evos?.map((evo) => ({ name: evo, method: formatEvoMethod(evo) })),
    forms,
  };
}

// ─── Pokemon ──────────────────────────────────────────────────────────────────

export function getAllPokemon(): Pokemon[] {
  const formsMap = new Map<string, FormVariant[]>();
  for (const s of gen4.species) {
    if (!s || !s.exists || s.isNonstandard || s.num <= 0) continue;
    if (s.baseSpecies !== s.name && s.forme) {
      const list = formsMap.get(s.baseSpecies) ?? [];
      list.push({ name: s.name, formName: s.forme, types: s.types as PokemonType[] });
      formsMap.set(s.baseSpecies, list);
    }
  }

  return [...gen4.species]
    .filter((s): s is NonNullable<typeof s> => !!s && s.exists && !s.isNonstandard && s.num > 0 && s.baseSpecies === s.name)
    .sort((a, b) => a.num - b.num)
    .map((s) => mapSpecies(s, formsMap.get(s.name) ?? []));
}

export function getPokemon(name: string): Pokemon | undefined {
  const s = gen4.species.get(name);
  if (!s || !s.exists) return undefined;
  const forms: FormVariant[] = [];
  for (const sibling of gen4.species) {
    if (!sibling) continue;
    if (sibling.baseSpecies === s.baseSpecies && sibling.name !== s.baseSpecies && sibling.forme) {
      forms.push({ name: sibling.name, formName: sibling.forme, types: sibling.types as PokemonType[] });
    }
  }
  return mapSpecies(s, forms);
}

// ─── Moves ────────────────────────────────────────────────────────────────────

/** Looks up a move from the pre-built movelist by its lowercase ID (e.g. "vinewhip"). */
function resolveMoveById(moveId: string): Move | null {
  return MOVE_BY_ID.get(moveId) ?? null;
}

export function getAllMoves(): Move[] {
  return MOVELIST;
}

export function getMove(name: string): Move | undefined {
  return MOVE_BY_ID.get(name.toLowerCase().replace(/ /g, ""));
}

// ─── Abilities ────────────────────────────────────────────────────────────────

export function getAllAbilities(): Ability[] {
  return [...gen4.abilities]
    .filter((a): a is NonNullable<typeof a> => !!a && a.exists && !a.isNonstandard && a.num > 0)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((a) => ({
      name: a.name,
      description: a.desc || a.shortDesc || "",
      shortDescription: a.shortDesc || "",
    }));
}

export function getAbility(name: string): Ability | undefined {
  const a = gen4.abilities.get(name);
  if (!a || !a.exists) return undefined;
  return {
    name: a.name,
    description: a.desc || a.shortDesc || "",
    shortDescription: a.shortDesc || "",
  };
}

// ─── Learnsets ────────────────────────────────────────────────────────────────

export interface LearnsetMove {
  name: string;
  type: PokemonType;
  category: MoveCategory;
  power: number | null;
  accuracy: number | null;
  pp: number;
  method: "level-up" | "tm" | "tutor" | "egg" | "special";
  level?: number; // only for level-up
}

export interface Learnset {
  levelUp: LearnsetMove[];
  tm: LearnsetMove[];
  tutor: LearnsetMove[];
  egg: LearnsetMove[];
}

/**
 * Parses a learnset source string regardless of gen prefix.
 * e.g. "4L9", "5L9" → level-up at 9; "4M", "5M" → TM; "4T" → tutor; "4E" → egg.
 */
function parseSource(src: string): { method: LearnsetMove["method"]; level?: number } | null {
  const code = src.replace(/^\d+/, "");
  if (code.startsWith("L")) return { method: "level-up", level: parseInt(code.slice(1), 10) };
  if (code === "M") return { method: "tm" };
  if (code === "T") return { method: "tutor" };
  if (code === "E") return { method: "egg" };
  return null;
}

function buildLearnset(learnsetRecord: Record<string, string[]>): Learnset {
  const result: Learnset = { levelUp: [], tm: [], tutor: [], egg: [] };

  for (const [moveId, sources] of Object.entries(learnsetRecord)) {
    const move = resolveMoveById(moveId);
    if (!move) continue;

    const base: Omit<LearnsetMove, "method" | "level"> = {
      name: move.name,
      type: move.type,
      category: move.category,
      power: move.power,
      accuracy: move.accuracy,
      pp: move.pp,
    };

    const seen = new Set<string>();
    for (const src of sources) {
      const parsed = parseSource(src);
      if (!parsed) continue;
      const key = parsed.method === "level-up" ? `level-up:${parsed.level}` : parsed.method;
      if (seen.has(key)) continue;
      seen.add(key);
      if (parsed.method === "level-up") {
        result.levelUp.push({ ...base, method: "level-up", level: parsed.level });
      } else if (parsed.method === "tm") {
        result.tm.push({ ...base, method: "tm" });
      } else if (parsed.method === "tutor") {
        result.tutor.push({ ...base, method: "tutor" });
      } else if (parsed.method === "egg") {
        result.egg.push({ ...base, method: "egg" });
      }
    }
  }

  result.levelUp.sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
  result.tm.sort((a, b) => a.name.localeCompare(b.name));
  result.tutor.sort((a, b) => a.name.localeCompare(b.name));
  result.egg.sort((a, b) => a.name.localeCompare(b.name));

  return result;
}

async function getGen4EggMoves(pokemonName: string): Promise<LearnsetMove[]> {
  const seen = new Map<string, LearnsetMove>(); // moveId → move, deduplicated

  // Walk up the prevo chain so evolved forms inherit their base species' egg moves
  let current: string | undefined = pokemonName;
  while (current) {
    const learnsetData = await gen4.learnsets.get(current);
    if (learnsetData?.learnset) {
      const eggOnly: Record<string, string[]> = {};
      for (const [moveId, sources] of Object.entries(learnsetData.learnset)) {
        if (sources.some((s) => s === "4E")) eggOnly[moveId] = ["4E"];
      }
      for (const move of buildLearnset(eggOnly).egg) {
        const id = move.name.toLowerCase().replace(/ /g, "");
        if (!seen.has(id)) seen.set(id, move);
      }
    }
    current = gen4.species.get(current)?.prevo || undefined;
  }

  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getLearnset(pokemonName: string): Promise<Learnset> {
  const rpData = RP_POKEMON_OVERRIDES[pokemonName.toLowerCase() as keyof typeof RP_POKEMON_OVERRIDES];
  if (rpData?.learnset) {
    const result = buildLearnset(rpData.learnset);
    result.egg = await getGen4EggMoves(pokemonName);
    return result;
  }

  const learnsetData = await gen4.learnsets.get(pokemonName);
  if (!learnsetData?.learnset) return { levelUp: [], tm: [], tutor: [], egg: [] };

  // Filter to gen4 sources only when falling back to @pkmn/data
  const filtered: Record<string, string[]> = {};
  for (const [moveId, sources] of Object.entries(learnsetData.learnset)) {
    const gen4Sources = sources.filter((s) => s.startsWith("4"));
    if (gen4Sources.length > 0) filtered[moveId] = gen4Sources;
  }
  return buildLearnset(filtered);
}

// ─── Move learners ────────────────────────────────────────────────────────────

export interface MoveLearner {
  pokemon: Pokemon;
  methods: string[]; // e.g. ["Level 12", "TM", "Egg"]
}

function formatLearnMethod(src: string): string | null {
  const parsed = parseSource(src);
  if (!parsed) return null;
  if (parsed.method === "level-up") return `Level ${parsed.level}`;
  if (parsed.method === "tm") return "TM";
  if (parsed.method === "tutor") return "Tutor";
  if (parsed.method === "egg") return "Egg";
  return null;
}

export async function getPokemonByMove(moveName: string): Promise<MoveLearner[]> {
  const moveId = moveName.toLowerCase().replace(/ /g, "");
  const allPokemon = getAllPokemon();

  const results = await Promise.all(
    allPokemon.map(async (pokemon) => {
      const rpData = RP_POKEMON_OVERRIDES[pokemon.name.toLowerCase() as keyof typeof RP_POKEMON_OVERRIDES];
      const gen4Data = await gen4.learnsets.get(pokemon.name);

      // Collect sources: RP learnset for non-egg methods, gen4 for egg moves
      const rpSources = rpData?.learnset?.[moveId] ?? [];
      const gen4Sources = (gen4Data?.learnset?.[moveId] ?? []).filter((s) => s === "4E");
      const allSources = [...rpSources.filter((s) => parseSource(s)?.method !== "egg"), ...gen4Sources];
      if (allSources.length === 0) return null;

      const seen = new Set<string>();
      const methods: string[] = [];
      for (const src of allSources) {
        const label = formatLearnMethod(src);
        if (label && !seen.has(label)) { seen.add(label); methods.push(label); }
      }
      if (methods.length === 0) return null;

      return { pokemon, methods } satisfies MoveLearner;
    })
  );

  return results.filter((r): r is MoveLearner => r !== null);
}

// ─── Search ───────────────────────────────────────────────────────────────────

import { getAllLocations } from "./locations";
import type { Location } from "./locations";

export type SearchResult =
  | { kind: "pokemon"; data: Pokemon }
  | { kind: "move"; data: Move }
  | { kind: "ability"; data: Ability }
  | { kind: "location"; data: Location };

export function search(query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results: SearchResult[] = [];

  for (const s of gen4.species) {
    if (!s || !s.exists || s.isNonstandard || s.num <= 0) continue;
    if (s.name.toLowerCase().includes(q)) {
      const pokemon = getPokemon(s.name);
      if (pokemon) results.push({ kind: "pokemon", data: pokemon });
    }
    if (results.filter((r) => r.kind === "pokemon").length >= 20) break;
  }

  let moveCount = 0;
  for (const m of MOVELIST) {
    if (m.name.toLowerCase().includes(q)) {
      results.push({ kind: "move", data: m });
      if (++moveCount >= 10) break;
    }
  }

  for (const a of gen4.abilities) {
    if (!a || !a.exists || a.isNonstandard || a.num <= 0) continue;
    if (a.name.toLowerCase().includes(q)) {
      const ability = getAbility(a.name);
      if (ability) results.push({ kind: "ability", data: ability });
    }
    if (results.filter((r) => r.kind === "ability").length >= 10) break;
  }

  for (const loc of getAllLocations()) {
    if (loc.name.toLowerCase().includes(q)) {
      results.push({ kind: "location", data: loc });
    }
    if (results.filter((r) => r.kind === "location").length >= 10) break;
  }

  return results;
}
