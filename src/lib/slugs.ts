export function toPokemonSlug(name: string): string {
  return name.toLowerCase()
    .replace(/ /g, "-")
    .replace(/['\u2019]/g, "")
    .replace(/\./g, "")
    .replace(/♀/g, "f")
    .replace(/♂/g, "m");
}

export function toMoveSlug(name: string): string {
  return name.toLowerCase().replace(/ /g, "-");
}

export function toLocationSlug(name: string): string {
  return name.toLowerCase().replace(/ - /g, "-").replace(/ /g, "-").replace(/[.']/g, "");
}
