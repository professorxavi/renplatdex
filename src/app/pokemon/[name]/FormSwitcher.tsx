"use client";

import { useRouter } from "next/navigation";
import type { FormVariant } from "@/lib/dex";
import { cn } from "@/lib/cn";

interface Props {
  currentName: string;
  baseName: string;
  forms: FormVariant[];
}

export default function FormSwitcher({ currentName, baseName, forms }: Props) {
  const router = useRouter();

  const navigate = (name: string) => router.push(`/pokemon/${name.toLowerCase()}`);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Forms</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate(baseName)}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
            currentName === baseName
              ? "border-[var(--accent)] bg-[var(--accent)]/10 text-red-300"
              : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
          )}
        >
          Base
        </button>
        {forms.map((form) => (
          <button
            key={form.name}
            onClick={() => navigate(form.name)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              currentName === form.name
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-red-300"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
            )}
          >
            {form.formName}
          </button>
        ))}
      </div>
    </div>
  );
}
