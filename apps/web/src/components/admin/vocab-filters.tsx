"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CEFR_LEVELS } from "@/lib/admin/types";
import { LANGUAGES, languageLabel } from "@/lib/languages";

/** Sentinel select value meaning "no filter" (Base UI Select needs a value). */
const ANY = "any";

const SOURCE_LABELS: Record<string, string> = {
  system: "System",
  user: "User",
};

/**
 * Filter bar for the admin vocab list. Filters live in the URL (search params)
 * so the page stays a Server Component and links/back-button work. Changing any
 * control resets pagination to page 1.
 */
export function VocabFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const language = searchParams.get("language") ?? ANY;
  const cefrLevel = searchParams.get("cefrLevel") ?? ANY;
  const source = searchParams.get("source") ?? ANY;
  const hasFilters = ["q", "language", "cefrLevel", "source"].some((key) =>
    searchParams.has(key),
  );

  function apply(next: Record<string, string | null>): void {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "" || value === ANY) params.delete(key);
      else params.set(key, value);
    }
    params.delete("page"); // any filter change returns to the first page
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function clearAll(): void {
    setQ("");
    router.push(pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q: q.trim() });
        }}
      >
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search lemma…"
            aria-label="Search by lemma"
            className="h-8 w-44 pl-8"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">
          Search
        </Button>
      </form>

      <Select
        value={language}
        onValueChange={(v) => apply({ language: String(v) })}
      >
        <SelectTrigger size="sm" aria-label="Filter by language">
          <SelectValue>
            {(v: string) => (v === ANY ? "Any language" : languageLabel(v))}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any language</SelectItem>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={cefrLevel}
        onValueChange={(v) => apply({ cefrLevel: String(v) })}
      >
        <SelectTrigger size="sm" aria-label="Filter by CEFR level">
          <SelectValue>
            {(v: string) => (v === ANY ? "Any level" : v)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any level</SelectItem>
          {CEFR_LEVELS.map((level) => (
            <SelectItem key={level} value={level}>
              {level}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={source} onValueChange={(v) => apply({ source: String(v) })}>
        <SelectTrigger size="sm" aria-label="Filter by source">
          <SelectValue>
            {(v: string) => (v === ANY ? "Any source" : SOURCE_LABELS[v])}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any source</SelectItem>
          <SelectItem value="system">System</SelectItem>
          <SelectItem value="user">User</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearAll}
          aria-label="Clear filters"
        >
          <XIcon className="size-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
