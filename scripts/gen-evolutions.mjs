/**
 * Generates src/lib/evolutions.json — a map of every Gen 4 Pokémon to its
 * immediate evolutions and the method required.
 *
 * Only entries that actually have evolutions are written (no empty arrays).
 * The method string mirrors what formatEvoMethod() produces in dex.ts so the
 * two stay in sync until dex.ts is updated to consume this file.
 *
 * Run once (or whenever you need to refresh from the dex package):
 *   node scripts/gen-evolutions.mjs
 */

import { Dex } from "@pkmn/dex";
import { Generations } from "@pkmn/data";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, "../src/lib/evolutions.json");

const gens = new Generations(Dex);
const gen4 = gens.get(4);

function formatEvoMethod(evoName) {
  const raw = Dex.species.get(evoName);
  const parts = [];

  if (!raw.evoType && raw.evoLevel) {
    parts.push(`Level ${raw.evoLevel}`);
  } else {
    switch (raw.evoType) {
      case "useItem":         parts.push(raw.evoItem ?? "Item"); break;
      case "trade":           parts.push(raw.evoItem ? `Trade (${raw.evoItem})` : "Trade"); break;
      case "levelFriendship": parts.push("Friendship"); break;
      case "levelMove":       parts.push(`Know ${raw.evoMove}`); break;
      case "levelHold":       parts.push(raw.evoItem ? `Level up holding ${raw.evoItem}` : "Level up"); break;
      case "levelExtra":      parts.push("Level up"); break;
      default:                if (raw.evoLevel) parts.push(`Level ${raw.evoLevel}`);
    }
  }

  if (raw.evoCondition) parts.push(raw.evoCondition);

  return parts.join(", ") || "???";
}

// RP-specific overrides: { pokemonName: { targetEvoName: newMethod } }
// Item Interaction Changes: trade evolutions replaced with use-item (like a stone).
// Level Changes: adjusted evolution levels.
// Method Changes: trade→level, happiness→Friendship, or happiness+time→stone.
const RP_EVO_OVERRIDES = {
  // Item Interaction Changes
  "Poliwhirl":  { "Politoed":   "King's Rock" },
  "Slowpoke":   { "Slowking":   "King's Rock", "Slowbro": "Level 33" },
  "Onix":       { "Steelix":    "Metal Coat" },
  "Rhydon":     { "Rhyperior":  "Protector" },
  "Seadra":     { "Kingdra":    "Dragon Scale" },
  "Scyther":    { "Scizor":     "Metal Coat" },
  "Electabuzz": { "Electivire": "Electirizer" },
  "Magmar":     { "Magmortar":  "Magmarizer" },
  "Porygon":    { "Porygon2":   "Up-Grade" },
  "Porygon2":   { "Porygon-Z":  "Dubious Disc" },
  "Feebas":     { "Milotic":    "Prism Scale" },
  "Dusclops":   { "Dusknoir":   "Reaper Cloth" },
  "Clamperl":   { "Huntail":    "Deep Sea Tooth", "Gorebyss": "Deep Sea Scale" },
  // Level Changes
  "Ponyta":     { "Rapidash":   "Level 35" },
  "Grimer":     { "Muk":        "Level 35" },
  "Rhyhorn":    { "Rhydon":     "Level 36" },
  "Omanyte":    { "Omastar":    "Level 30" },
  "Kabuto":     { "Kabutops":   "Level 30" },
  "Slugma":     { "Magcargo":   "Level 32" },
  "Aron":       { "Lairon":     "Level 24" },
  "Lairon":     { "Aggron":     "Level 40" },
  "Meditite":   { "Medicham":   "Level 33" },
  "Wailmer":    { "Wailord":    "Level 36" },
  "Trapinch":   { "Vibrava":    "Level 30" },
  "Baltoy":     { "Claydol":    "Level 32" },
  "Lileep":     { "Cradily":    "Level 30" },
  "Anorith":    { "Armaldo":    "Level 30" },
  "Shuppet":    { "Banette":    "Level 32" },
  "Duskull":    { "Dusclops":   "Level 32" },
  "Snorunt":    { "Glalie":     "Level 32" },
  "Spheal":     { "Sealeo":     "Level 24" },
  "Sealeo":     { "Walrein":    "Level 40" },
  "Glameow":    { "Purugly":    "Level 32" },
  "Stunky":     { "Skuntank":   "Level 32" },
  "Skorupi":    { "Drapion":    "Level 30" },
  "Croagunk":   { "Toxicroak":  "Level 33" },
  // Method Changes
  "Kadabra":    { "Alakazam":   "Level 36" },
  "Machoke":    { "Machamp":    "Level 36" },
  "Graveler":   { "Golem":      "Level 36" },
  "Haunter":    { "Gengar":     "Level 36" },
  "Eevee":      { "Espeon": "Sun Stone", "Umbreon": "Moon Stone", "Leafeon": "Leaf Stone", "Glaceon": "Ice Stone" },
  "Budew":      { "Roselia":    "Friendship" },
  "Chingling":  { "Chimecho":   "Friendship" },
  "Riolu":      { "Lucario":    "Friendship" },
};

const result = {};

for (const s of gen4.species) {
  if (!s || !s.exists || s.isNonstandard || s.num <= 0) continue;
  if (!s.evos || s.evos.length === 0) continue;

  const overrides = RP_EVO_OVERRIDES[s.name] ?? {};
  result[s.name] = s.evos.map((evo) => ({
    name: evo,
    method: overrides[evo] ?? formatEvoMethod(evo),
  }));
}

writeFileSync(out, JSON.stringify(result, null, 2));

const total = Object.keys(result).length;
const evoCount = Object.values(result).reduce((sum, arr) => sum + arr.length, 0);
console.log(`Done — ${total} Pokémon with evolutions, ${evoCount} total evolution entries`);
console.log(`Written to ${out}`);
