"use client";

/**
 * Bulk phase 1 — source & options. The admin tags with topics, provides words
 * (paste or upload), picks how to read them (list vs prose) and a language, then
 * extracts candidates. No enrichment runs yet — that's gated behind the confirm
 * step.
 */
import { useRef, useState } from "react";
import {
  ClipboardPasteIcon,
  FileIcon,
  Layers2Icon,
  Loader2Icon,
  SearchIcon,
  TagsIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { TopicPicker } from "./topic-picker";
import { SectionCard } from "@/components/admin/section-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { extractCandidatesAction } from "@/lib/admin/quick";
import type { ExtractMode, ExtractResult, Topic } from "@/lib/admin/types";
import { LANGUAGES } from "@/lib/languages";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ".txt,.csv,.xlsx,.pdf";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const MODES: { value: ExtractMode; title: string; desc: string }[] = [
  {
    value: "list",
    title: "List",
    desc: "Each line / cell / comma entry is kept as-is. Phrases preserved. Best for word lists & glossaries.",
  },
  {
    value: "prose",
    title: "Prose",
    desc: "Tokenises running text and strips stopwords. Best for articles & passages.",
  },
];

interface Props {
  topics: Topic[];
  selectedTopics: string[];
  setSelectedTopics: (slugs: string[]) => void;
  mode: ExtractMode;
  setMode: (m: ExtractMode) => void;
  language: string;
  setLanguage: (l: string) => void;
  onExtracted: (result: ExtractResult) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SourcePhase({
  topics,
  selectedTopics,
  setSelectedTopics,
  mode,
  setMode,
  language,
  setLanguage,
  onExtracted,
}: Props) {
  const [srcMode, setSrcMode] = useState<"paste" | "upload">("paste");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const itemCount = text.trim()
    ? text.trim().split(/[\s,;\n]+/).filter(Boolean).length
    : 0;
  const canExtract = srcMode === "paste" ? itemCount > 0 : !!file;

  function pickFile(f: File | null) {
    if (!f) return;
    if (f.size > MAX_BYTES) {
      toast.error("That file is larger than 5 MB.");
      return;
    }
    setFile(f);
  }

  async function extract() {
    setExtracting(true);
    const fd = new FormData();
    if (srcMode === "upload" && file) fd.append("file", file);
    else fd.append("text", text);
    fd.append("mode", mode);
    fd.append("language", language);

    const res = await extractCandidatesAction(fd);
    setExtracting(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    onExtracted(res.data);
  }

  return (
    <div className="grid gap-5">
      <SectionCard
        accent="violet"
        icon={<TagsIcon />}
        title="Tag with topics"
        description="Optional — every imported word lands in these topics. Only existing topics can be picked."
      >
        <TopicPicker
          topics={topics}
          selected={selectedTopics}
          onChange={setSelectedTopics}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Pick a topic, then paste your list — everything you import is tagged,
          even words that already exist.
        </p>
      </SectionCard>

      <SectionCard
        accent="indigo"
        icon={<ClipboardPasteIcon />}
        title="Your words"
        description="Paste a list, or upload a file. We extract candidates first — you confirm before any AI runs."
      >
        <div className="mb-3 flex w-fit rounded-lg border bg-muted/40 p-0.5">
          {(
            [
              ["paste", "Paste text", ClipboardPasteIcon],
              ["upload", "Upload file", UploadIcon],
            ] as const
          ).map(([k, label, Icon]) => (
            <button
              key={k}
              type="button"
              onClick={() => setSrcMode(k)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                srcMode === k
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        {srcMode === "paste" ? (
          <div>
            <textarea
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
              placeholder={"ephemeral\nserendipity\nubiquitous, paradigm\ncogent\n…"}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-[13px] outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>One per line, or comma-separated. Phrases kept in List mode.</span>
              <span className="tabular-nums">
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        ) : !file ? (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              pickFile(e.dataTransfer.files?.[0] ?? null);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-9 text-center transition-colors",
              dragOver
                ? "border-primary bg-primary/5"
                : "border-input hover:border-muted-foreground/40 hover:bg-muted/30",
            )}
          >
            <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <UploadIcon className="size-5" />
            </span>
            <span className="text-sm font-medium">
              Drop a file or <span className="text-primary">browse</span>
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              .txt, .csv, .xlsx, .pdf — up to 5 MB
            </span>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
          </label>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300">
              <FileIcon className="size-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{file.name}</div>
              <div className="text-xs text-muted-foreground tabular-nums">
                {formatBytes(file.size)}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setFile(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              aria-label="Remove file"
              className="text-muted-foreground"
            >
              <XIcon />
            </Button>
          </div>
        )}
      </SectionCard>

      <SectionCard
        accent="sky"
        icon={<Layers2Icon />}
        title="How to read it"
        description="This changes results — choose based on your source."
      >
        <div className="grid gap-2.5 sm:grid-cols-2">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={cn(
                "rounded-xl border p-3.5 text-left transition-all",
                mode === m.value
                  ? "border-primary bg-primary/[0.03] ring-2 ring-primary/20"
                  : "hover:border-muted-foreground/30",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-4 items-center justify-center rounded-full border text-[10px]",
                    mode === m.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input",
                  )}
                >
                  {mode === m.value && "✓"}
                </span>
                <span className="text-sm font-semibold">{m.title}</span>
              </div>
              <p className="mt-1.5 pl-6 text-xs leading-snug text-muted-foreground">
                {m.desc}
              </p>
            </button>
          ))}
        </div>
        <div className="mt-3 w-44">
          <Label htmlFor="bulk-language">Language</Label>
          <select
            id="bulk-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={cn(selectClass, "mt-1.5")}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </SectionCard>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="text-xs text-muted-foreground">
          We won’t spend the AI pipeline yet — you’ll confirm the candidate list
          first.
        </p>
        <Button size="lg" disabled={!canExtract || extracting} onClick={extract}>
          {extracting ? <Loader2Icon className="animate-spin" /> : <SearchIcon />}
          Find words
        </Button>
      </div>
    </div>
  );
}
