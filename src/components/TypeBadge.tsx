import type { PokemonType } from "@/lib/dex";
import { TYPE_COLORS } from "@/lib/type-colors";
import { cn } from "@/lib/cn";
import Link from "next/link";

interface TypeBadgeProps {
  type: PokemonType;
  className?: string;
  asLink?: boolean;
  size?: "sm" | "md";
}

export default function TypeBadge({ type, className, asLink = true, size = "sm" }: TypeBadgeProps) {
  const color = TYPE_COLORS[type];
  const base = cn(
    "inline-flex items-center rounded-full font-semibold tracking-wide uppercase",
    size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
    color,
    className
  );

  if (asLink) {
    return (
      <Link href={`/types/${type.toLowerCase()}`} className={cn(base, "hover:opacity-80 transition-opacity")}>
        {type}
      </Link>
    );
  }
  return <span className={base}>{type}</span>;
}
