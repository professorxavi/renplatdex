const BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

/**
 * Some alternate forms are stored under a dedicated PokeAPI ID rather than
 * the "{national-id}-{form}.png" pattern. Add entries here as needed.
 */
const FORM_SPRITE_IDS: Record<string, number> = {
  // Deoxys
  "Deoxys-Attack":   10001,
  "Deoxys-Defense":  10002,
  "Deoxys-Speed":    10003,
  // Rotom forms
  "Rotom-Heat":  10008,
  "Rotom-Wash":  10009,
  "Rotom-Frost": 10010,
  "Rotom-Fan":   10011,
  "Rotom-Mow":   10012,
  // Shaymin
  "Shaymin-Sky":      10006,
  // Giratina
  "Giratina-Origin":  10007,
  // Wormadam
  "Wormadam-Sandy":   10004,
  "Wormadam-Trash":   10005,
  // Castform
  "Castform-Sunny":   10013,
  "Castform-Rainy":   10014,
  "Castform-Snowy":   10015,
};

/**
 * Returns the PokeAPI sprite URL for a given Pokémon.
 *
 * Priority:
 *  1. Explicit mapping in FORM_SPRITE_IDS (e.g. Rotom forms)
 *  2. Alternate form detected via baseSpecies → "{id}-{suffix}.png"
 *  3. Base form (including names with hyphens like Ho-Oh) → "{id}.png"
 *
 * @param baseSpecies - The base species name from @pkmn/dex. When provided,
 *   a form suffix is only appended if `name !== baseSpecies`, correctly
 *   handling Pokémon whose base name contains a hyphen.
 */
export function getSpriteUrl(id: number, name: string, baseSpecies?: string): string {
  if (name in FORM_SPRITE_IDS) {
    return `${BASE}/${FORM_SPRITE_IDS[name]}.png`;
  }

  const isAltForm = baseSpecies ? name !== baseSpecies : false;
  if (isAltForm) {
    const hyphen = name.indexOf("-");
    const formSuffix = hyphen !== -1 ? name.slice(hyphen + 1).toLowerCase() : null;
    if (formSuffix) {
      return `${BASE}/${id}-${formSuffix}.png`;
    }
  }

  return `${BASE}/${id}.png`;
}
