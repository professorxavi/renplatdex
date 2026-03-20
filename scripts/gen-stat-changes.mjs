/**
 * Generates src/lib/statChanges.json — a map of every Gen 4 Pokémon whose
 * final RP stats differ from their Gen 4 base stats, showing the delta.
 *
 * Pipeline:
 *   gen4 base stats
 *   → apply gen7-overrides.json (gen 5-7 stat changes)
 *   → apply rp-pokemon-overrides.json (RP-specific stat changes)
 *   → compare against gen4 base, record signed differences
 *
 * Positive = stat increased, negative = stat decreased.
 * Only changed stats are included per Pokémon; only Pokémon with changes appear.
 *
 * Run once (or whenever overrides change):
 *   node scripts/gen-stat-changes.mjs
 */

import { Dex } from "@pkmn/dex";
import { Generations } from "@pkmn/data";
import { writeFileSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcData = resolve(__dirname, "../src/lib/data");

const gens = new Generations(Dex);
const gen4 = gens.get(4);

const GEN7_OVERRIDES    = JSON.parse(readFileSync(resolve(srcData, "gen7-overrides.json"), "utf8"));
const RP_OVERRIDES      = JSON.parse(readFileSync(resolve(srcData, "rp-pokemon-overrides.json"), "utf8"));

const result = {};

for (const s4 of gen4.species) {
  if (!s4 || !s4.exists || s4.isNonstandard || s4.num <= 0) continue;

  const base   = s4.baseStats; // { hp, atk, def, spa, spd, spe }
  const g7     = GEN7_OVERRIDES[s4.name]?.stats ?? {};
  const rp     = RP_OVERRIDES[s4.name.toLowerCase()]?.stats ?? {};

  // Build final stats by applying overrides in order
  const final = { ...base, ...g7, ...rp };

  const deltas = {};
  for (const key of Object.keys(base)) {
    const diff = final[key] - base[key];
    if (diff !== 0) deltas[key] = diff;
  }

  if (Object.keys(deltas).length > 0) {
    result[s4.name] = { stats: deltas };
  }
}

const outPath = resolve(srcData, "statChanges.json");
writeFileSync(outPath, JSON.stringify(result, null, 2) + "\n");

const count = Object.keys(result).length;
const totalDeltas = Object.values(result).reduce((n, e) => n + Object.keys(e.stats).length, 0);
console.log(`Done — ${count} Pokémon with stat changes, ${totalDeltas} total stat deltas`);
console.log(`Written to ${outPath}`);
