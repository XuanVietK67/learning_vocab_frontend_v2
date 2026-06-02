import Link from "next/link";
import { Trash2Icon } from "lucide-react";

import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteVocabularyAction } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";
import type { AdminVocabulary } from "@/lib/admin/types";
import { languageLabel } from "@/lib/languages";

const TH = "px-3 py-2 text-left text-xs font-medium text-muted-foreground";
const TD = "px-3 py-2.5 align-middle";

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
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
            <th className={TH}>POS</th>
            <th className={TH}>Lang</th>
            <th className={TH}>CEFR</th>
            <th className={TH}>Source</th>
            <th className={TH}>Status</th>
            <th className={cn(TH, "text-right")}>Senses</th>
            <th className={TH}>Topics</th>
            <th className={TH}>Updated</th>
            <th className={cn(TH, "text-right")}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((vocab) => (
            <tr
              key={vocab.id}
              className="border-b border-border/60 last:border-0 hover:bg-muted/30"
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
              <td className={cn(TD, "text-muted-foreground")}>
                {vocab.partOfSpeech}
              </td>
              <td className={cn(TD, "text-muted-foreground")}>
                {languageLabel(vocab.language)}
              </td>
              <td className={TD}>{vocab.cefrLevel ? <Badge>{vocab.cefrLevel}</Badge> : "—"}</td>
              <td className={TD}>
                <Badge>{vocab.source}</Badge>
              </td>
              <td className={TD}>
                {vocab.isApproved ? (
                  <Badge className="bg-primary/10 text-primary">Approved</Badge>
                ) : (
                  <Badge>Pending</Badge>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
