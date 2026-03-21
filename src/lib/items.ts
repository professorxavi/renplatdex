import _ITEMS from "./data/items.json";

export type Item = {
  item: string;
  name: string;
  locations: string[];
};

export type TM = {
  tm: string;
  name: string;
  location: string;
  obtained: string;
};

export type Plate = {
  item: string;
  name: string;
  "trainer-location": string;
};

export type KeyItem = {
  item: string;
  name: string;
  location: string;
  obtained: string;
};

export type ItemCategory = "items" | "tms" | "plates" | "key-items";

export type ItemsData = {
  items: Item[];
  tms: TM[];
  plates: Plate[];
  "key-items": KeyItem[];
};

const ITEMS = _ITEMS as ItemsData;

export function getAllItems(): ItemsData {
  return ITEMS;
}

export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  items: "Items",
  tms: "TMs",
  plates: "Plates",
  "key-items": "Key Items",
};
