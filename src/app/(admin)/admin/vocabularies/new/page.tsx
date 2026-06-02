import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";

import { CreateVocabForm } from "./create-vocab-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "New vocabulary",
};

export default function NewVocabularyPage() {
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
          New word
        </h1>
        <p className="text-sm text-muted-foreground">
          Adds a system word with one starter sense. You can expand it in the
          editor afterwards.
        </p>
      </header>

      <Card>
        <CardContent className="pt-2">
          <CreateVocabForm />
        </CardContent>
      </Card>
    </div>
  );
}
