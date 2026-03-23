const fs = require('fs');

const text = fs.readFileSync('docs/TrainerPokemon.txt', 'utf8');
const lines = text.split(/\r?\n/).map(l => l.replace(/\t/g, ' '));

const result = {};
let currentLocation = null;
let inDetailBlock = false;
let currentDetailTrainer = null;
let currentDetailPokemon = [];

function isLocationSeparator(line) {
  return /^={80,}/.test(line.trim());
}

function isDetailLine(line) {
  return /\(Lv\.\s*\d+\)\s*@.+\//.test(line);
}

function isSimpleTrainerLine(line) {
  return /\s{2,}.+Lv\.\s*\d+/.test(line) && !isDetailLine(line);
}

function nextNonBlankLine(idx) {
  for (let j = idx + 1; j < lines.length; j++) {
    if (lines[j].trim()) return lines[j];
  }
  return '';
}

function parseSimplePokemon(str) {
  return str.split(',').map(s => {
    const m = s.trim().match(/^(.+?)\s+Lv\.\s*(\d+)$/);
    if (m) return { species: m[1].trim(), lvl: parseInt(m[2]) };
    return null;
  }).filter(Boolean);
}

function parseSimpleTrainerLine(line) {
  const m = line.match(/^(.+?)\s{2,}(.+)$/);
  if (!m) return null;
  return {
    trainerName: m[1].trim(),
    pokemon: parseSimplePokemon(m[2].trim())
  };
}

function parseDetailLine(line) {
  const m = line.trim().match(/^(.+?)\s*\(Lv\.\s*(\d+)\)\s*@\s*(.+?)\s*\/\s*(.+?)\s*\/\s*(.+?)\s*\/\s*(.+)$/);
  if (!m) return null;

  const species = m[1].trim();
  const lvl = parseInt(m[2]);
  const item = m[3].trim();
  const nature = m[4].trim();
  const ability = m[5].trim().replace(/\s*\(!\)$/, '').trim();
  const moves = m[6].split(',').map(mv => mv.trim());

  const poke = { species, lvl };
  if (item && item.toLowerCase() !== 'none') poke.item = item;
  if (nature && nature !== '?') poke.nature = nature;
  if (ability) poke.ability = ability;
  if (moves.length) poke.moves = moves;

  return poke;
}

function flushDetailBlock() {
  if (!inDetailBlock || !currentDetailTrainer || !currentDetailPokemon.length || !currentLocation) {
    inDetailBlock = false;
    currentDetailTrainer = null;
    currentDetailPokemon = [];
    return;
  }

  const trainers = result[currentLocation];
  const existing = trainers.findIndex(t => t.trainerName === currentDetailTrainer);
  const entry = { trainerName: currentDetailTrainer, pokemon: currentDetailPokemon };

  if (existing >= 0) {
    trainers[existing] = entry;
  } else {
    trainers.push(entry);
  }

  inDetailBlock = false;
  currentDetailTrainer = null;
  currentDetailPokemon = [];
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  if (isLocationSeparator(line)) {
    flushDetailBlock();
    // Previous non-empty line is the location name
    let j = i - 1;
    while (j >= 0 && !lines[j].trim()) j--;
    if (j >= 0) {
      const loc = lines[j].trim();
      if (!result[loc]) result[loc] = [];
      currentLocation = loc;
    }
    continue;
  }

  if (!currentLocation) continue;

  if (!trimmed) {
    flushDetailBlock();
    continue;
  }

  if (isDetailLine(line)) {
    if (inDetailBlock) {
      const poke = parseDetailLine(line);
      if (poke) currentDetailPokemon.push(poke);
    }
    continue;
  }

  if (isSimpleTrainerLine(line)) {
    flushDetailBlock();
    const entry = parseSimpleTrainerLine(line);
    if (entry) result[currentLocation].push(entry);
    continue;
  }

  // Non-trainer line: check if it's a detail block header by looking ahead
  flushDetailBlock();
  if (isDetailLine(nextNonBlankLine(i))) {
    inDetailBlock = true;
    currentDetailTrainer = trimmed;
    currentDetailPokemon = [];
  }
  // Otherwise it's a section label (Rematches, With Rock Climb, etc.) — skip
}

flushDetailBlock();

fs.writeFileSync('docs/TrainerPokemon.json', JSON.stringify(result, null, 2));

const locationCount = Object.keys(result).length;
const trainerCount = Object.values(result).reduce((sum, arr) => sum + arr.length, 0);
console.log(`Done! ${locationCount} locations, ${trainerCount} trainer entries`);
Object.keys(result).slice(0, 8).forEach(loc => {
  console.log(`  "${loc}": ${result[loc].length} trainers`);
});
