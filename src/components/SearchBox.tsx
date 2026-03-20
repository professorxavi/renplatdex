"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import type { SearchResult } from "@/lib/dex";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toLocationSlug } from "@/lib/locations";

interface Filter {
  label: string;
  value: string;
}

function resultHref(r: SearchResult): string {
  switch (r.kind) {
    case "pokemon":  return `/pokemon/${r.data.name.toLowerCase()}`;
    case "move":     return `/moves/${encodeURIComponent(r.data.name.toLowerCase())}`;
    case "ability":  return `/abilities/${r.data.name.toLowerCase().replace(/ /g, "-")}`;
    case "location": return `/locations/${toLocationSlug(r.data.name)}`;
  }
}

function kindLabel(kind: SearchResult["kind"]) {
  const labels: Record<string, string> = {
    pokemon: "Pokémon", move: "Move", ability: "Ability", location: "Location",
  };
  return labels[kind] ?? kind;
}

function kindColor(kind: SearchResult["kind"]) {
  const colors: Record<string, string> = {
    pokemon:  "text-red-400 bg-red-900/40",
    move:     "text-cyan-400 bg-cyan-900/40",
    ability:  "text-amber-400 bg-amber-900/40",
    location: "text-emerald-400 bg-emerald-900/40",
  };
  return colors[kind] ?? "text-gray-400 bg-gray-800";
}

function ResultRow({
  result,
  active,
  onClick,
  rowRef,
}: {
  result: SearchResult;
  active: boolean;
  onClick: () => void;
  rowRef?: React.Ref<HTMLAnchorElement>;
}) {
  const href = resultHref(result);

  const subtitle = (() => {
    switch (result.kind) {
      case "pokemon":
        return result.data.types.join(" / ");
      case "move":
        return `${result.data.type} · ${result.data.category} · ${result.data.power ?? "—"} BP`;
      case "ability":
        return result.data.shortDescription;
      case "location": {
        const count = new Set(Object.values(result.data.encounters).flat().map((e) => e.pokemon)).size;
        return `${count} Pokémon · Sinnoh`;
      }
    }
  })();

  return (
    <Link
      ref={rowRef}
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors",
        active ? "bg-[var(--surface-elevated)]" : "hover:bg-[var(--surface-elevated)]"
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
          {result.kind === "pokemon"
            ? `#${String(result.data.id).padStart(3, "0")} ${result.data.name}`
            : result.data.name}
        </p>
        <p className="text-xs text-[var(--text-secondary)] truncate">{subtitle}</p>
      </div>
      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", kindColor(result.kind))}>
        {kindLabel(result.kind)}
      </span>
    </Link>
  );
}

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRowRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();

  const runSearch = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); setActiveIndex(-1); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
      setActiveIndex(-1);
    }, 150);
  }, []);

  useEffect(() => {
    runSearch(query);
  }, [query, runSearch]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Scroll active row into view
  useEffect(() => {
    activeRowRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function close() {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }

  function removeFilter(index: number) {
    setFilters((f) => f.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && results[activeIndex]) {
        router.push(resultHref(results[activeIndex]));
        close();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    } else if (e.key === "Backspace" && !query && filters.length > 0) {
      setFilters((f) => f.slice(0, -1));
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-xl border bg-[var(--surface)] px-4 py-3 transition-all",
          open
            ? "border-[var(--accent)] shadow-lg shadow-red-500/10"
            : "border-[var(--border)] hover:border-gray-500"
        )}
        onClick={() => { inputRef.current?.focus(); setOpen(true); }}
      >
        <Search size={16} className="shrink-0 text-[var(--text-secondary)]" />

        {filters.map((f, i) => (
          <span
            key={i}
            className="flex items-center gap-1 rounded-full bg-[var(--accent)]/20 px-2 py-0.5 text-xs font-medium text-red-300"
          >
            {f.label}
            <button onClick={(e) => { e.stopPropagation(); removeFilter(i); }}>
              <X size={10} />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={filters.length === 0 ? "Search Pokémon, moves, abilities…" : "Add more filters…"}
          className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none"
        />

        {(query || filters.length > 0) && (
          <button
            onClick={(e) => { e.stopPropagation(); setQuery(""); setFilters([]); setResults([]); setActiveIndex(-1); }}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div ref={listRef} className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl">
          {results.map((r, i) => (
            <ResultRow
              key={i}
              result={r}
              active={i === activeIndex}
              rowRef={i === activeIndex ? activeRowRef : undefined}
              onClick={close}
            />
          ))}
        </div>
      )}

      {open && query && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-2xl">
          <p className="text-sm text-[var(--text-secondary)]">No results for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
