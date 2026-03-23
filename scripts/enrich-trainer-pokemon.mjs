/**
 * Enriches src/lib/data/trainerPokemon.json by adding speciesId to each
 * pokemon entry, looked up from the @pkmn/dex Gen 4 species data.
 *
 *   node scripts/enrich-trainer-pokemon.mjs
 */

import { Dex } from "@pkmn/dex";
import { Generations } from "@pkmn/data";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(__dirname, "../src/lib/data/trainerPokemon.json");

const gens = new Generations(Dex);
const gen4 = gens.get(4);

const data = JSON.parse(readFileSync(dataPath, "utf8"));

const missing = new Set();

for (const trainers of Object.values(data)) {
  for (const trainer of trainers) {
    for (const pokemon of trainer.pokemon) {
      const species = gen4.species.get(pokemon.species);
      if (species?.num > 0) {
        pokemon.speciesId = species.num;
      } else {
        missing.add(pokemon.species);
      }
    }
  }
}

writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log("Done.");
if (missing.size > 0) {
  console.log(`Could not resolve ${missing.size} species:`, [...missing].sort());
}
