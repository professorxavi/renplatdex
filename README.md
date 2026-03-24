# RenPlat Dex

A Pokédex for Pokémon Renegade Platinum — a romhack of Pokémon Platinum by Drayano.

Covers all Gen 4 Pokémon and moves updated to reflect Gen 7 values, with Renegade Platinum-specific overrides applied on top (stat changes, type changes, ability changes, evolution method changes, move replacements, and custom learnsets).

All data for Renegade Platinum was generated using Documentation provided with the Rom patches.

## Features

- **Pokémon** — stats, types, type weaknesses, abilities, evolution chains, forms, learnsets, and wild encounter locations
- **Moves** — full move data with learner list
- **Abilities** — descriptions with Pokémon that have the ability
- **Locations** — wild encounter tables by method (morning/day/night/surf/fishing/honey tree/Poké Radar/repel manipulation)
- **Trainers** — full trainer rosters with held items, abilities, and moves for all trainers including rivals with starter-variant data
- **Search** — searches across Pokémon, moves, abilities, and locations
- **Responsive** — split-panel layout on desktop, drawer navigation on mobile

## Data Pipeline

Static JSON files are pre-generated from `@pkmn/dex` and `@pkmn/data` and committed to the repo. Run these scripts when source data changes:

```bash
node scripts/gen-gen7-overrides.mjs       # Gen 4 → Gen 7 Pokémon stat/type diffs
node scripts/gen-gen7-move-overrides.mjs  # Gen 4 → Gen 7 move diffs
node scripts/gen-movelist.mjs             # Final move list with RP overrides applied
node scripts/gen-evolutions.mjs           # Evolution chains with RP method overrides
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- [Next.js](https://nextjs.org) 15 (App Router)
- [Tailwind CSS](https://tailwindcss.com) v4
- [@pkmn/dex](https://github.com/pkmn/ps) + [@pkmn/data](https://github.com/pkmn/ps) for Pokémon data
- [Ubuntu](https://fonts.google.com/specimen/Ubuntu) font via `next/font/google`
