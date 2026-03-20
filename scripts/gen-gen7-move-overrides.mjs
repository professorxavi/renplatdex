/**
 * Computes per-move overrides where Gen 7 values differ from Gen 4 values,
 * then writes the result to src/lib/gen7-move-overrides.json.
 *
 * Only records fields that actually changed — nothing else is stored.
 *
 * Run once (or whenever you want to refresh):
 *   node scripts/gen-gen7-move-overrides.mjs
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

for (const m4 of gen4.moves) {
  if (!m4 || !m4.exists || m4.isNonstandard || m4.num <= 0) continue;

  const m7 = gen7.moves.get(m4.id);
  if (!m7 || !m7.exists) continue;

  const override = {};

  if (m4.type !== m7.type) override.type = m7.type;
  if (m4.category !== m7.category) override.category = m7.category;
  if (m4.basePower !== m7.basePower) override.basePower = m7.basePower;
  if (m4.accuracy !== m7.accuracy) override.accuracy = m7.accuracy;
  if (m4.pp !== m7.pp) override.pp = m7.pp;

  if (Object.keys(override).length > 0) {
    overrides[m4.name] = override;
  }
}

const outPath = resolve(__dirname, "../src/lib/gen7-move-overrides.json");
writeFileSync(outPath, JSON.stringify(overrides, null, 2) + "\n");

const total = Object.keys(overrides).length;
const counts = { type: 0, category: 0, basePower: 0, accuracy: 0, pp: 0 };
for (const o of Object.values(overrides)) {
  for (const key of Object.keys(counts)) {
    if (key in o) counts[key]++;
  }
}
console.log(
  `Written ${outPath}\n` +
  `  ${total} moves with overrides\n` +
  `  type: ${counts.type}, category: ${counts.category}, basePower: ${counts.basePower}, accuracy: ${counts.accuracy}, pp: ${counts.pp}`
);
