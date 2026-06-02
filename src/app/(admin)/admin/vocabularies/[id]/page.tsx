import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";

import { VocabFieldsForm } from "./vocab-fields-form";
import { ActionForm } from "@/components/admin/action-form";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteVocabularyAction,
  updateVocabularyTopicsAction,
} from "@/lib/admin/actions";
import { getTopics } from "@/lib/admin/topics";
import { getVocabularyDetail } from "@/lib/admin/vocabularies";
import { languageLabel } from "@/lib/languages";

export const metadata: Metadata = {
  title: "Edit vocabulary",
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}

export default async function EditVocabularyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [vocab, topics] = await Promise.all([
    getVocabularyDetail(id),
    getTopics(),
  ]);

  // No admin GET-by-id exists; the public read only resolves system words.
  if (!vocab) notFound();

  const linkedSlugs = new Set(vocab.topics.map((t) => t.slug));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/admin/vocabularies"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Vocabulary
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {vocab.lemma}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{vocab.partOfSpeech}</Badge>
            <Badge>{languageLabel(vocab.language)}</Badge>
            {vocab.cefrLevel && <Badge>{vocab.cefrLevel}</Badge>}
            <Badge>{vocab.source}</Badge>
          </div>
        </div>
        <form action={deleteVocabularyAction}>
          <input type="hidden" name="id" value={vocab.id} />
          <ConfirmButton message={`Delete "${vocab.lemma}"? This cannot be undone.`}>
            Delete word
          </ConfirmButton>
        </form>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <VocabFieldsForm vocab={vocab} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Topics</CardTitle>
        </CardHeader>
        <CardContent>
          {topics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No topics in the catalog yet.
            </p>
          ) : (
            <ActionForm
              action={updateVocabularyTopicsAction}
              successMessage="Topics updated"
              className="flex flex-col gap-4"
            >
              <input type="hidden" name="id" value={vocab.id} />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {topics.map((topic) => (
                  <label
                    key={topic.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="slugs"
                      value={topic.slug}
                      defaultChecked={linkedSlugs.has(topic.slug)}
                      className="size-4 accent-primary"
                    />
                    <span className="truncate">{topic.name}</span>
                  </label>
                ))}
              </div>
              <div>
                <AdminSubmit variant="outline">Save topics</AdminSubmit>
              </div>
            </ActionForm>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Senses ({vocab.senses.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {vocab.senses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This word has no senses yet.
            </p>
          ) : (
            vocab.senses.map((sense) => (
              <div
                key={sense.id}
                className="flex flex-col gap-2 rounded-lg border border-border/60 p-3"
              >
                <div className="flex items-baseline gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded bg-muted text-xs font-semibold">
                    {sense.senseOrder}
                  </span>
                  <span className="font-medium">{sense.gloss ?? "—"}</span>
                </div>
                {sense.definition && (
                  <p className="text-sm text-muted-foreground">
                    {sense.definition}
                  </p>
                )}
                {sense.translations.length > 0 && (
                  <ul className="flex flex-col gap-0.5 text-sm">
                    {sense.translations.map((t) => (
                      <li key={t.id}>
                        <span className="text-muted-foreground">
                          {t.language}:
                        </span>{" "}
                        {t.translation}
                      </li>
                    ))}
                  </ul>
                )}
                {sense.examples.length > 0 && (
                  <ul className="flex flex-col gap-1 border-l-2 border-border pl-3 text-sm">
                    {sense.examples.map((ex) => (
                      <li key={ex.id}>
                        <span className="italic">{ex.sentence}</span>
                        {ex.translation && (
                          <span className="text-muted-foreground">
                            {" "}
                            — {ex.translation}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
          <p className="text-xs text-muted-foreground">
            Editing senses, translations, and examples individually is coming
            next.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
