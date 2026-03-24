import type { PokemonType } from "@/lib/dex";

export const TYPE_CHART: Partial<Record<PokemonType, {
  attack: { strong: PokemonType[]; weak: PokemonType[]; immune: PokemonType[] };
  defense: { strong: PokemonType[]; weak: PokemonType[]; immune: PokemonType[] };
}>> = {
  Fire:     { attack: { strong: ["Grass","Ice","Bug","Steel"],                    weak: ["Fire","Water","Rock","Dragon"],                         immune: [] },         defense: { strong: ["Fire","Grass","Ice","Bug","Steel","Fairy"],                         weak: ["Water","Ground","Rock"],                   immune: [] } },
  Water:    { attack: { strong: ["Fire","Ground","Rock"],                         weak: ["Water","Grass","Dragon"],                               immune: [] },         defense: { strong: ["Fire","Water","Ice","Steel"],                                      weak: ["Electric","Grass"],                        immune: [] } },
  Electric: { attack: { strong: ["Water","Flying"],                               weak: ["Electric","Grass","Dragon"],                            immune: ["Ground"] }, defense: { strong: ["Electric","Flying","Steel"],                                       weak: ["Ground"],                                  immune: [] } },
  Grass:    { attack: { strong: ["Water","Ground","Rock"],                        weak: ["Fire","Grass","Poison","Flying","Bug","Dragon","Steel"], immune: [] },         defense: { strong: ["Water","Electric","Grass","Ground"],                               weak: ["Fire","Poison","Flying","Bug","Ice"],       immune: [] } },
  Dragon:   { attack: { strong: ["Dragon"],                                       weak: ["Steel"],                                               immune: ["Fairy"] },  defense: { strong: ["Fire","Water","Electric","Grass"],                                 weak: ["Ice","Dragon","Fairy"],                     immune: [] } },
  Normal:   { attack: { strong: [],                                               weak: ["Rock","Steel"],                                        immune: ["Ghost"] },  defense: { strong: [],                                                                 weak: ["Fighting"],                                immune: ["Ghost"] } },
  Fighting: { attack: { strong: ["Normal","Ice","Rock","Dark","Steel"],            weak: ["Poison","Flying","Psychic","Bug","Fairy"],              immune: ["Ghost"] }, defense: { strong: ["Rock","Bug","Dark"],                                               weak: ["Flying","Psychic","Fairy"],                immune: [] } },
  Poison:   { attack: { strong: ["Grass","Fairy"],                                weak: ["Poison","Ground","Rock","Ghost"],                       immune: ["Steel"] }, defense: { strong: ["Grass","Fighting","Poison","Bug","Fairy"],                          weak: ["Ground","Psychic"],                        immune: [] } },
  Ground:   { attack: { strong: ["Fire","Electric","Poison","Rock","Steel"],       weak: ["Grass","Bug"],                                         immune: ["Flying"] }, defense: { strong: ["Poison","Rock"],                                                  weak: ["Water","Grass","Ice"],                     immune: ["Electric"] } },
  Flying:   { attack: { strong: ["Grass","Fighting","Bug"],                       weak: ["Electric","Rock","Steel"],                             immune: [] },         defense: { strong: ["Grass","Fighting","Bug"],                                          weak: ["Electric","Rock","Ice"],                   immune: ["Ground"] } },
  Psychic:  { attack: { strong: ["Fighting","Poison"],                            weak: ["Psychic","Steel"],                                     immune: ["Dark"] },   defense: { strong: ["Fighting","Psychic"],                                              weak: ["Bug","Ghost","Dark"],                      immune: [] } },
  Bug:      { attack: { strong: ["Grass","Psychic","Dark"],                       weak: ["Fire","Fighting","Poison","Flying","Ghost","Steel","Fairy"], immune: [] },   defense: { strong: ["Grass","Ground","Fighting"],                                       weak: ["Fire","Flying","Rock"],                    immune: [] } },
  Rock:     { attack: { strong: ["Fire","Ice","Flying","Bug"],                    weak: ["Fighting","Ground","Steel"],                           immune: [] },         defense: { strong: ["Normal","Fire","Poison","Flying"],                                 weak: ["Water","Grass","Fighting","Ground","Steel"], immune: [] } },
  Ghost:    { attack: { strong: ["Psychic","Ghost"],                              weak: ["Dark"],                                                immune: ["Normal"] }, defense: { strong: ["Poison","Bug"],                                                    weak: ["Ghost","Dark"],                            immune: ["Normal","Fighting"] } },
  Ice:      { attack: { strong: ["Grass","Ground","Flying","Dragon"],             weak: ["Fire","Water","Ice","Steel"],                          immune: [] },         defense: { strong: ["Ice"],                                                             weak: ["Fire","Fighting","Rock","Steel"],           immune: [] } },
  Dark:     { attack: { strong: ["Psychic","Ghost"],                              weak: ["Fighting","Dark","Fairy"],                             immune: [] },         defense: { strong: ["Ghost","Dark"],                                                    weak: ["Fighting","Bug","Fairy"],                  immune: ["Psychic"] } },
  Steel:    { attack: { strong: ["Ice","Rock","Fairy"],                           weak: ["Fire","Water","Electric","Steel"],                     immune: [] },         defense: { strong: ["Normal","Dragon","Grass","Ice","Flying","Psychic","Bug","Rock","Steel","Fairy"], weak: ["Fire","Fighting","Ground"], immune: ["Poison"] } },
  Fairy:    { attack: { strong: ["Fighting","Dragon","Dark"],                     weak: ["Fire","Poison","Steel"],                               immune: [] },         defense: { strong: ["Fighting","Bug","Dark"],                                           weak: ["Poison","Steel"],                          immune: ["Dragon"] } },
};

export function getTypeWeaknesses(types: PokemonType[]): { fourX: PokemonType[]; twoX: PokemonType[] } {
  const weakSets = types.map(t => new Set(TYPE_CHART[t]?.defense.weak ?? []));
  const immuneSets = types.map(t => new Set(TYPE_CHART[t]?.defense.immune ?? []));
  const strongSets = types.map(t => new Set(TYPE_CHART[t]?.defense.strong ?? []));

  const allWeakTypes = new Set(weakSets.flatMap(s => [...s]));
  const fourX: PokemonType[] = [];
  const twoX: PokemonType[] = [];

  for (const type of allWeakTypes) {
    // Skip if immune to this type from any of the pokemon's types
    if (immuneSets.some(s => s.has(type))) continue;

    const weakCount = weakSets.filter(s => s.has(type)).length;
    const strongCount = strongSets.filter(s => s.has(type)).length;
    const net = weakCount - strongCount;

    if (net >= 2) fourX.push(type);
    else if (net === 1) twoX.push(type);
  }

  return { fourX, twoX };
}
