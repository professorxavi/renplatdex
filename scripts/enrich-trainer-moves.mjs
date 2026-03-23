/**
 * Enriches src/lib/data/trainerPokemon.json by replacing each move string
 * with { name, type, category } looked up from movelist.json.
 *
 *   node scripts/enrich-trainer-moves.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(__dirname, "../src/lib/data/trainerPokemon.json");
const movelistPath = resolve(__dirname, "../src/lib/data/movelist.json");

const data = JSON.parse(readFileSync(dataPath, "utf8"));
const movelist = JSON.parse(readFileSync(movelistPath, "utf8"));
const replacements = JSON.parse(readFileSync(resolve(__dirname, "../src/lib/data/rp-move-replacements.json"), "utf8"));

// Build lookup by normalised name (lowercase, no spaces/hyphens/punctuation)
const moveIndex = new Map(
  movelist.map((m) => [m.name.toLowerCase().replace(/[^a-z0-9]/g, ""), m])
);

// Build replacements lookup by normalised old name → normalised new name
const replacementIndex = new Map(
  Object.entries(replacements).map(([oldName, newName]) => [
    oldName.toLowerCase().replace(/[^a-z0-9]/g, ""),
    newName.toLowerCase().replace(/[^a-z0-9]/g, ""),
  ])
);

const missing = new Set();

for (const trainers of Object.values(data)) {
  for (const trainer of trainers) {
    for (const pokemon of trainer.pokemon) {
      if (!pokemon.moves) continue;
      pokemon.moves = pokemon.moves.map((move) => {
        const moveName = typeof move === "string" ? move : move.name;
        const key = moveName.toLowerCase().replace(/[^a-z0-9]/g, "");
        const resolvedKey = replacementIndex.get(key) ?? key;
        const entry = moveIndex.get(resolvedKey);
        if (!entry) {
          missing.add(moveName);
          return { name: moveName };
        }
        return { name: entry.name, type: entry.type, category: entry.category };
      });
    }
  }
}

writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log("Done.");
if (missing.size > 0) {
  console.log(`Could not resolve ${missing.size} moves:`, [...missing].sort());
}
