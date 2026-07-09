import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2Icon } from "lucide-react";

import { DraftApproveBanner } from "./draft-approve-banner";
import { SenseList } from "./sense-list";
import { TopicsForm } from "./topics-form";
import { VocabEditor } from "./vocab-editor";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteVocabularyAction } from "@/lib/admin/actions";
import { getTopics } from "@/lib/admin/topics";
import { getVocabularyDetail } from "@/lib/admin/vocabularies";

export const metadata: Metadata = {
  title: "Edit vocabulary",
};

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

  // Admin read resolves system words incl. unapproved drafts; 404s on unknown
  // ids and user-created words.
  if (!vocab) notFound();

  return (
    <VocabEditor
      vocab={vocab}
      draftBanner={
        !vocab.isApproved ? <DraftApproveBanner vocabId={vocab.id} /> : null
      }
      deleteSlot={
        <form action={deleteVocabularyAction}>
          <input type="hidden" name="id" value={vocab.id} />
          <ConfirmButton
            size="sm"
            message={`Delete "${vocab.lemma}"? This cannot be undone.`}
            aria-label="Delete word"
          >
            <Trash2Icon />
            <span className="hidden sm:inline">Delete</span>
          </ConfirmButton>
        </form>
      }
      senses={<SenseList vocabularyId={vocab.id} senses={vocab.senses} />}
      topics={
        <TopicsForm
          vocabId={vocab.id}
          topics={topics}
          linkedSlugs={vocab.topics.map((t) => t.slug)}
        />
      }
    />
  );
}
