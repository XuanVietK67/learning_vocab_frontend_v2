import Link from "next/link";
import { ImageIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { ConfirmButton } from "@/components/admin/confirm-button";
import { buttonVariants } from "@/components/ui/button";
import { deleteVocabularyAction } from "@/lib/admin/actions";
import {
  cefrTone,
  sourceTone,
  toneClass,
  type BadgeTone,
} from "@/lib/admin/badge-tones";
import { cn } from "@/lib/utils";
import type { AdminVocabulary } from "@/lib/admin/types";
import { languageLabel } from "@/lib/languages";

/** Max thumbnails shown before collapsing the rest into a "+N" chip. */
const MAX_THUMBS = 4;

const TH = "px-3 py-2 text-left text-xs font-medium text-muted-foreground";
const TD = "px-3 py-2.5 align-middle";

function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Thumbnail grid of every image across a vocabulary's senses. */
function VocabImageCell({ vocab }: { vocab: AdminVocabulary }) {
  const images = vocab.images;

  if (images.length === 0) {
    return (
      <div
        className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground/60 ring-1 ring-inset ring-foreground/10"
        aria-label="No image"
      >
        <ImageIcon className="size-4" />
      </div>
    );
  }

  const shown = images.slice(0, MAX_THUMBS);
  const overflow = images.length - shown.length;

  return (
    <div className="flex items-center gap-1">
      {shown.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={vocab.lemma}
          loading="lazy"
          className="size-9 rounded-md object-cover ring-1 ring-inset ring-foreground/10"
        />
      ))}
      {overflow > 0 && (
        <span className="flex size-9 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground tabular-nums ring-1 ring-inset ring-foreground/10">
          +{overflow}
        </span>
      )}
    </div>
  );
}

/** Read-only table of admin vocabulary rows. */
export function VocabTable({ items }: { items: AdminVocabulary[] }) {
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
      <table className="w-full border-collapse text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className={TH}>Lemma</th>
            <th className={TH}>Image</th>
            <th className={TH}>POS</th>
            <th className={TH}>Lang</th>
            <th className={TH}>CEFR</th>
            <th className={TH}>Source</th>
            <th className={TH}>Status</th>
            <th className={cn(TH, "text-right")}>Senses</th>
            <th className={TH}>Topics</th>
            <th className={TH}>Updated</th>
            <th className={cn(TH, "text-right")}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((vocab) => (
            <tr
              key={vocab.id}
              className="border-b border-border/60 even:bg-muted/20 last:border-0 hover:bg-muted/40"
            >
              <td className={cn(TD, "font-medium")}>
                <Link
                  href={`/admin/vocabularies/${vocab.id}`}
                  className="flex flex-col hover:underline"
                >
                  <span>{vocab.lemma}</span>
                  {vocab.ipa && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {vocab.ipa}
                    </span>
                  )}
                </Link>
              </td>
              <td className={TD}>
                <VocabImageCell vocab={vocab} />
              </td>
              <td className={cn(TD, "text-muted-foreground")}>
                {vocab.partOfSpeech}
              </td>
              <td className={cn(TD, "text-muted-foreground")}>
                {languageLabel(vocab.language)}
              </td>
              <td className={TD}>
                {vocab.cefrLevel ? (
                  <Badge tone={cefrTone(vocab.cefrLevel)}>{vocab.cefrLevel}</Badge>
                ) : (
                  "—"
                )}
              </td>
              <td className={TD}>
                <Badge tone={sourceTone(vocab.source)}>{vocab.source}</Badge>
              </td>
              <td className={TD}>
                {vocab.isApproved ? (
                  <Badge tone="emerald">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Approved
                  </Badge>
                ) : (
                  <Badge tone="amber">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    Pending
                  </Badge>
                )}
              </td>
              <td className={cn(TD, "text-right tabular-nums")}>
                {vocab.senses.length}
              </td>
              <td className={cn(TD, "text-muted-foreground")}>
                {vocab.topics.length > 0
                  ? vocab.topics.map((t) => t.slug).join(", ")
                  : "—"}
              </td>
              <td className={cn(TD, "whitespace-nowrap text-muted-foreground tabular-nums")}>
                {vocab.updatedAt.slice(0, 10)}
              </td>
              <td className={cn(TD, "text-right")}>
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/vocabularies/${vocab.id}`}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon-sm" }),
                    )}
                    aria-label={`Edit ${vocab.lemma}`}
                  >
                    <PencilIcon className="text-muted-foreground" />
                  </Link>
                  <form action={deleteVocabularyAction}>
                    <input type="hidden" name="id" value={vocab.id} />
                    <ConfirmButton
                      variant="ghost"
                      size="icon-sm"
                      message={`Delete "${vocab.lemma}"? This cannot be undone.`}
                      aria-label={`Delete ${vocab.lemma}`}
                    >
                      <Trash2Icon className="text-muted-foreground" />
                    </ConfirmButton>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
