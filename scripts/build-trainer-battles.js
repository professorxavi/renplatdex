'use strict';

const fs   = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { Dex } = require('@pkmn/dex');

const XLSX_PATH    = path.join(__dirname, '../docs/trainers/TrainerBattles.xlsx');
const JSON_OUT_PATH = path.join(__dirname, '../src/lib/data/trainerBattles.json');

const MANDATORY_COLOR = 'EA9999';
const OPTIONAL_COLOR  = 'A4C2F4';

const SPLIT_ORDER = [
  'Roark Split',
  'Gardenia Split',
  'Fantina Split',
  'Maylene Split',
  'Wake Split',
  'Byron Split',
  'Candice Split',
  'Volkner Split',
  'Champion Split',
];

// Move name typo corrections from the xlsx source
const MOVE_NAME_FIXES = {
  'Seisimic Toss': 'Seismic Toss',
  'Energy':        'Energy Ball',
  'Capitvate':     'Captivate',
  'Acurpressure':  'Acupressure',
};

// Moves that are actually abilities misplaced in the move slots
// Value: ability to fall back to if pokemon has no ability set (null = just drop it)
const MOVE_IS_ABILITY = {
  'Vital Spirit': 'Vital Spirit',
};

// Location strings in the xlsx that should be normalized to a canonical name
const LOCATION_OVERRIDES = {
  'Elite Four - Aaron':   'Pokemon League',
  'Elite Four - Bertha':  'Pokemon League',
  'Elite Four - Flint':   'Pokemon League',
  'Elite Four - Lucian':  'Pokemon League',
  'Pokemon League - Champion': 'Pokemon League',
};
function normalizeLocation(raw) {
  if (LOCATION_OVERRIDES[raw]) return LOCATION_OVERRIDES[raw];
  if (/^Each Elite Four member/i.test(raw)) return 'Pokemon League';
  if (/^Cynthia will use/i.test(raw)) return 'Pokemon League';
  return raw;
}

// Col I labels that mark data rows — used to distinguish them from section headers
const DATA_LABELS = new Set([
  'Pokemon Sprite', 'Pokemon Name', 'Level', 'Nature\n(+Stat -Stat)',
  'Ability', 'Held Item', 'Move 1', 'Move 2', 'Move 3', 'Move 4',
]);

// Single-word names that are static encounters, not trainers
const STATIC_ENCOUNTERS = new Set(['Spiritomb']);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractSpriteUrl(formula) {
  if (!formula) return null;
  const m = formula.match(/image\("([^"]+)"/);
  return m ? m[1] : null;
}

/** "Timid \n(+Spe -Atk)" → "Timid"  |  "Lax/Hasty" stays as-is */
function parseNature(raw) {
  if (!raw || raw === 'Nature\n(+Stat -Stat)') return null;
  return raw.split(/\n/)[0].trim() || null;
}

/** "Level 7" → 7 */
function parseLevel(raw) {
  const m = String(raw || '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Parse IVs from the notes string.
 * Returns a number (blanket), an object { default, overrides } (mixed),
 * or null if no IV data present.
 */
function parseIvs(notes) {
  if (!notes) return null;
  let defaultIv = null;
  const overrides = {};

  for (const line of notes.split(/\n/)) {
    // "29 IVs on Onix and Geodude"
    const onMatch = line.match(/(\d+)\s+IVs?\s+on\s+(.+)/i);
    if (onMatch) {
      const iv = parseInt(onMatch[1], 10);
      onMatch[2].split(/\s+and\s+|\s*,\s*/i).forEach(n => {
        overrides[n.trim()] = iv;
      });
      continue;
    }
    // "30 IVs on the rest"
    const restMatch = line.match(/(\d+)\s+IVs?\s+on\s+the\s+rest/i);
    if (restMatch) { defaultIv = parseInt(restMatch[1], 10); continue; }
    // "12 IVs" (blanket)
    const blanket = line.match(/^(\d+)\s+IVs?$/i);
    if (blanket) { defaultIv = parseInt(blanket[1], 10); }
  }

  if (defaultIv === null && Object.keys(overrides).length === 0) return null;
  if (Object.keys(overrides).length === 0) return defaultIv;
  return { default: defaultIv, overrides };
}

function resolveIv(ivData, species) {
  if (ivData === null) return undefined;
  if (typeof ivData === 'number') return ivData;
  if (ivData.overrides[species] !== undefined) return ivData.overrides[species];
  return ivData.default !== null ? ivData.default : undefined;
}

// ---------------------------------------------------------------------------
// Parse a single split sheet
// ---------------------------------------------------------------------------

function parseSplitSheet(wb, sheetName) {
  const splitName = sheetName.replace(' Split', '');
  const ws  = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });

  const entries = [];
  let currentLocation = null;

  for (let i = 14; i < rows.length; i++) {
    const r = rows[i];

    // Section header: non-empty text in col A, empty cols B–H, col I not a data label
    const colA = String(r[0]).trim();
    if (colA && !r[2] && !DATA_LABELS.has(r[8])) {
      currentLocation = normalizeLocation(colA);
      continue;
    }

    // Trainer block starts at the "Pokemon Name" row
    if (r[8] !== 'Pokemon Name') continue;
    if (r[0] === 'Trainer Name') continue; // sheet header template

    const trainerName = String(r[0]).trim();
    if (!trainerName) continue;
    if (STATIC_ENCOUNTERS.has(trainerName)) continue;

    // Sprite URL — walk upward from the trainer name row to find the "Pokemon Sprite" row
    // (doubles have an extra blank row between the sprite and trainer name rows)
    let trainerSprite = null;
    for (let si = i - 1; si >= Math.max(0, i - 3); si--) {
      if (rows[si][8] === 'Pokemon Sprite') {
        const spriteCell = ws['A' + (si + 1)]; // +1 because Excel rows are 1-indexed
        trainerSprite = spriteCell ? extractSpriteUrl(spriteCell.f) : null;
        break;
      }
    }

    // Mandatory flag from cell background color on the trainer name cell
    const nameCell = ws['A' + (i + 1)];
    let mandatory = null;
    if (nameCell && nameCell.s) {
      const color = nameCell.s.fgColor && nameCell.s.fgColor.rgb;
      if (color === MANDATORY_COLOR)      mandatory = true;
      else if (color === OPTIONAL_COLOR)  mandatory = false;
    }

    // Data rows relative to the trainer name row
    const notesRaw   = String(rows[i + 1]?.[0] || '').trim();
    const levelRow   = rows[i + 1] || [];
    const natureRow  = rows[i + 2] || [];
    const abilityRow = rows[i + 3] || [];
    const itemRow    = rows[i + 4] || [];
    const move1Row   = rows[i + 5] || [];
    const move2Row   = rows[i + 6] || [];
    const move3Row   = rows[i + 7] || [];
    const move4Row   = rows[i + 8] || [];

    const ivData = parseIvs(notesRaw);

    // Pokemon in cols C–H (indices 2–7)
    const pokemon = [];
    for (let col = 2; col <= 7; col++) {
      const species = String(r[col] || '').trim();
      if (!species || DATA_LABELS.has(species)) continue;

      const lvl     = parseLevel(levelRow[col]);
      const nature  = parseNature(String(natureRow[col] || ''));
      const ability = String(abilityRow[col] || '').trim() || null;
      const item    = String(itemRow[col] || '').trim() || null;

      // Collect raw move names, apply typo fixes, and pull out misplaced abilities
      const rawMoveNames = [move1Row[col], move2Row[col], move3Row[col], move4Row[col]]
        .map(m => String(m || '').trim())
        .filter(Boolean);

      let abilityFromMove = null;
      const moves = rawMoveNames
        .filter(name => {
          if (name in MOVE_IS_ABILITY) {
            abilityFromMove = MOVE_IS_ABILITY[name];
            return false; // drop from moves list
          }
          return true;
        })
        .map(name => {
          const fixed = MOVE_NAME_FIXES[name] ?? name;
          const moveData = Dex.moves.get(fixed);
          return moveData.exists
            ? { name: fixed, type: moveData.type, category: moveData.category }
            : { name: fixed };
        });

      const ivs = resolveIv(ivData, species);

      const speciesData = Dex.species.get(species);
      const speciesId = speciesData.num > 0 ? speciesData.num : undefined;

      const resolvedAbility = ability || abilityFromMove || null;

      const poke = { species, speciesId, lvl };
      if (ivs !== undefined)    poke.ivs     = ivs;
      if (nature)               poke.nature  = nature;
      if (resolvedAbility)      poke.ability = resolvedAbility;
      if (item)                 poke.item    = item;
      if (moves.length)         poke.moves   = moves;

      pokemon.push(poke);
    }

    const entry = { trainerName, trainerSprite, location: currentLocation, split: splitName };
    if (mandatory !== null) entry.mandatory = mandatory;
    if (notesRaw)           entry.notes     = notesRaw;
    entry.pokemon = pokemon;

    entries.push(entry);
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('Reading xlsx…');
  const wb = xlsx.readFile(XLSX_PATH, { cellStyles: true });

  const allEntries = [];

  for (const sheetName of SPLIT_ORDER) {
    if (!wb.SheetNames.includes(sheetName)) {
      console.warn(`  ⚠  Sheet not found: ${sheetName}`);
      continue;
    }
    const entries = parseSplitSheet(wb, sheetName);
    console.log(`  ${sheetName}: ${entries.length} trainers`);
    allEntries.push(...entries);
  }

  console.log(`\nTotal: ${allEntries.length} entries`);
  fs.writeFileSync(JSON_OUT_PATH, JSON.stringify(allEntries, null, 2));
  console.log(`Wrote ${JSON_OUT_PATH}`);
}

main();
