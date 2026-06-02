import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";

import { ImportForm } from "./import-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Import vocabulary",
};

export default function ImportVocabularyPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/admin/vocabularies"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Vocabulary
      </Link>

      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Bulk import
        </h1>
        <p className="text-sm text-muted-foreground">
          Upsert many words at once. Existing words are matched by language +
          lemma + part of speech and patched in place.
        </p>
      </header>

      <Card>
        <CardContent className="pt-2">
          <ImportForm />
        </CardContent>
      </Card>
    </div>
  );
}
