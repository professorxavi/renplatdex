import type { PokemonType } from "./dex";

export const TYPE_COLORS: Record<PokemonType, string> = {
  Normal:   "bg-stone-400 text-white",
  Fire:     "bg-orange-500 text-white",
  Water:    "bg-blue-500 text-white",
  Electric: "bg-yellow-400 text-black",
  Grass:    "bg-green-500 text-white",
  Ice:      "bg-cyan-300 text-black",
  Fighting: "bg-red-700 text-white",
  Poison:   "bg-purple-500 text-white",
  Ground:   "bg-amber-600 text-white",
  Flying:   "bg-indigo-400 text-white",
  Psychic:  "bg-pink-500 text-white",
  Bug:      "bg-lime-500 text-white",
  Rock:     "bg-yellow-700 text-white",
  Ghost:    "bg-purple-800 text-white",
  Dragon:   "bg-[#1535A0] text-white",
  Dark:     "bg-neutral-700 text-white",
  Steel:    "bg-slate-400 text-white",
  Fairy:    "bg-pink-300 text-black",
};
