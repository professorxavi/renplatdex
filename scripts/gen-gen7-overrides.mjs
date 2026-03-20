/**
 * Computes per-Pokémon stat and type overrides where Gen 7 values differ from
 * Gen 4 values, then writes the result to src/lib/gen7-overrides.json.
 *
 * Only records fields that actually changed — nothing else is stored.
 *
 * Run once (or whenever you want to refresh):
 *   node scripts/gen-gen7-overrides.mjs
 */

import { Dex } from "@pkmn/dex";
import { Generations } from "@pkmn/data";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const gens = new Generations(Dex);
const gen4 = gens.get(4);
const gen7 = gens.get(7);

const overrides = {};

for (const s4 of gen4.species) {
  if (!s4 || !s4.exists || s4.isNonstandard || s4.num <= 0) continue;

  const s7 = gen7.species.get(s4.id);
  if (!s7 || !s7.exists) continue;

  const override = {};

  // Types
  if (JSON.stringify(s4.types) !== JSON.stringify(s7.types)) {
    override.types = s7.types;
  }

  // Base stats — only record stat keys that actually changed
  const changedStats = {};
  for (const key of Object.keys(s4.baseStats)) {
    if (s4.baseStats[key] !== s7.baseStats[key]) {
      changedStats[key] = s7.baseStats[key];
    }
  }
  if (Object.keys(changedStats).length > 0) {
    override.stats = changedStats;
  }

  if (Object.keys(override).length > 0) {
    overrides[s4.name] = override;
  }
}

const outPath = resolve(__dirname, "../src/lib/gen7-overrides.json");
writeFileSync(outPath, JSON.stringify(overrides, null, 2) + "\n");

const pokemonCount = Object.keys(overrides).length;
const typesCount = Object.values(overrides).filter((o) => o.types).length;
const statsCount = Object.values(overrides).filter((o) => o.stats).length;
console.log(
  `Written ${outPath}\n` +
  `  ${pokemonCount} Pokémon with overrides (${typesCount} type changes, ${statsCount} stat changes)`
);
