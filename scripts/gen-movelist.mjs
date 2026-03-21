/**
 * Builds the final Renegade Platinum move list and writes it to
 * src/lib/data/movelist.json. Order follows gen4 num, with each replaced move
 * sitting in the same position as the move it replaces.
 *
 * Pipeline per move:
 *   gen4 base → apply gen7-move-overrides → (or replace with gen7 move) → apply rp-move-overrides
 *
 * Run once (or whenever overrides change):
 *   node scripts/gen-movelist.mjs
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
const gen7 = gens.get(7);

const GEN7_MOVE_OVERRIDES  = JSON.parse(readFileSync(resolve(srcData, "gen7-move-overrides.json"),  "utf-8"));
const RP_MOVE_OVERRIDES    = JSON.parse(readFileSync(resolve(srcData, "rp-move-overrides.json"),    "utf-8"));
const RP_MOVE_REPLACEMENTS = JSON.parse(readFileSync(resolve(srcData, "rp-move-replacements.json"), "utf-8"));

function mapRaw(m) {
  return {
    name:        m.name,
    type:        m.type,
    category:    m.category,
    power:       m.basePower || null,
    accuracy:    m.accuracy === true ? null : m.accuracy,
    pp:          m.pp,
    priority:    m.priority,
    flags:       Object.keys(m.flags),
    description: m.desc || m.shortDesc || "",
  };
}

function applyOverride(move, o) {
  return {
    ...move,
    type:     o.type     ?? move.type,
    category: o.category ?? move.category,
    power:    "basePower" in o ? (o.basePower || null) : move.power,
    accuracy: "accuracy"  in o ? (o.accuracy === true ? null : o.accuracy) : move.accuracy,
    pp:       o.pp ?? move.pp,
  };
}

// Moves whose Gen4 display name should be overridden in the output.
const MOVE_NAME_OVERRIDES = {
  "Vise Grip": "Vicegrip",
  "Twineedle": "Twin Needle",
};


const moves = [];
let replacedCount = 0;

for (const m of gen4.moves) {
  if (!m || !m.exists || m.isNonstandard || m.num <= 0) continue;
  // Skip Hidden Power type variants (Hidden Power Fire, etc.) — keep only base Hidden Power
  if (m.name.startsWith("Hidden Power ")) continue;

  let move;
  if (m.name in RP_MOVE_REPLACEMENTS) {
    // Swap out for the gen7 replacement move
    const newName = RP_MOVE_REPLACEMENTS[m.name];
    const g7 = gen7.moves.get(newName);
    if (!g7?.exists) {
      console.warn(`  Warning: replacement move "${newName}" not found in gen7`);
      continue;
    }
    move = mapRaw(g7);
    if (move.name in RP_MOVE_OVERRIDES) move = applyOverride(move, RP_MOVE_OVERRIDES[move.name]);
    replacedCount++;
  } else {
    // Regular gen4 move — apply gen7 overrides then RP overrides
    move = mapRaw(m);
    if (move.name in MOVE_NAME_OVERRIDES) move = { ...move, name: MOVE_NAME_OVERRIDES[move.name] };
    if (move.name in GEN7_MOVE_OVERRIDES) move = applyOverride(move, GEN7_MOVE_OVERRIDES[move.name]);
    if (move.name in RP_MOVE_OVERRIDES)   move = applyOverride(move, RP_MOVE_OVERRIDES[move.name]);
  }

  moves.push(move);
}

const outPath = resolve(srcData, "movelist.json");
writeFileSync(outPath, JSON.stringify(moves, null, 2) + "\n");

console.log(
  `Written ${outPath}\n` +
  `  ${moves.length} moves total (${replacedCount} replaced from gen7)`
);
