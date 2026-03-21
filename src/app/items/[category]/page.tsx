import { getAllItems, ITEM_CATEGORY_LABELS } from "@/lib/items";
import type { ItemCategory } from "@/lib/items";
import { notFound } from "next/navigation";
import { Package } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ category: string }>;
}

export default async function ItemCategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const category = slug as ItemCategory;

  if (!ITEM_CATEGORY_LABELS[category]) notFound();

  const allItems = getAllItems();
  const entries = allItems[category];
  const label = ITEM_CATEGORY_LABELS[category];

  // Determine columns based on category
  const columns =
    category === "items"
      ? ["Item", "Name", "Locations"]
      : category === "tms"
      ? ["TM", "Move", "Location", "Obtained"]
      : category === "plates"
      ? ["Item", "Name", "Location"]
      : ["Item", "Name", "Location", "Obtained"];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-center gap-2 mb-1">
          <Package size={16} className="text-[var(--accent)]" />
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest">Items</p>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{label}</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{entries.length} entries</p>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              {columns.map((col) => (
                <th key={col} className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {category === "items" &&
              allItems.items.map((item) => (
                <tr key={item.item} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-elevated)]">
                  <td className="px-4 py-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.item}.png`} alt={item.name} width={24} height={24} />
                  </td>
                  <td className="px-4 py-2.5 font-medium text-[var(--text-primary)]">{item.name}</td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">{item.locations.join(", ")}</td>
                </tr>
              ))}
            {category === "tms" &&
              allItems.tms.map((tm) => (
                <tr key={tm.tm} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-elevated)]">
                  <td className="px-4 py-2.5 font-mono text-xs text-[var(--text-secondary)]">{tm.tm}</td>
                  <td className="px-4 py-2.5 font-medium">
                    <Link href={`/moves/${encodeURIComponent(tm.name.toLowerCase())}`} className="text-[var(--accent)] hover:underline">
                      {tm.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">{tm.location}</td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">{tm.obtained}</td>
                </tr>
              ))}
            {category === "plates" &&
              allItems.plates.map((plate) => (
                <tr key={plate.item} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-elevated)]">
                  <td className="px-4 py-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${plate.item}.png`} alt={plate.name} width={24} height={24} />
                  </td>
                  <td className="px-4 py-2.5 font-medium text-[var(--text-primary)]">{plate.name}</td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">{plate["trainer-location"]}</td>
                </tr>
              ))}
            {category === "key-items" &&
              allItems["key-items"].map((item) => (
                <tr key={item.item} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-elevated)]">
                  <td className="px-4 py-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.item}.png`} alt={item.name} width={24} height={24} />
                  </td>
                  <td className="px-4 py-2.5 font-medium text-[var(--text-primary)]">{item.name}</td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">{item.location}</td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">{item.obtained}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
