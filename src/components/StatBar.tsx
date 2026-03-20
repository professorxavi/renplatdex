import { cn } from "@/lib/cn";

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  atk: "Atk",
  def: "Def",
  spa: "SpA",
  spd: "SpD",
  spe: "Spe",
};

function statColor(value: number) {
  if (value >= 120) return "bg-emerald-400";
  if (value >= 90)  return "bg-green-400";
  if (value >= 70)  return "bg-yellow-400";
  if (value >= 50)  return "bg-orange-400";
  return "bg-red-400";
}

interface StatBarProps {
  statKey: string;
  value: number;
  delta?: number;
}

export default function StatBar({ statKey, value, delta }: StatBarProps) {
  const pct = Math.min((value / 255) * 100, 100);
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="w-8 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase">
        {STAT_LABELS[statKey] ?? statKey}
      </span>
      <span className="w-8 text-center text-sm font-bold text-[var(--text-primary)]">{value}</span>
      <div className="flex-1 rounded-full bg-[var(--surface-elevated)] h-2 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", statColor(value))}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-5 text-right text-xs font-semibold tabular-nums">
        {delta !== undefined
          ? <span className={delta > 0 ? "text-emerald-400" : "text-red-400"}>
              {delta > 0 ? `+${delta}` : delta}
            </span>
          : null}
      </span>
    </div>
  );
}
