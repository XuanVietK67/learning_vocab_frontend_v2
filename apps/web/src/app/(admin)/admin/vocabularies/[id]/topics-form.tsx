import { CheckIcon, SaveIcon } from "lucide-react";

import { ActionForm } from "@/components/admin/action-form";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateVocabularyTopicsAction } from "@/lib/admin/actions";
import type { Topic } from "@/lib/admin/types";

interface Props {
  vocabId: string;
  topics: Topic[];
  /** Slugs of topics currently linked to the word. */
  linkedSlugs: string[];
}

/** Topic assignment grid — checkbox toggle-cards saved via one Server Action. */
export function TopicsForm({ vocabId, topics, linkedSlugs }: Props) {
  const linked = new Set(linkedSlugs);
  const selected = topics.filter((t) => linked.has(t.slug)).length;

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-baseline gap-2">
          Topics
          <span className="text-sm font-normal text-muted-foreground tabular-nums">
            {selected} / {topics.length}
          </span>
        </CardTitle>
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
            <input type="hidden" name="id" value={vocabId} />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {topics.map((topic) => (
                <label
                  key={topic.id}
                  className="group/topic flex cursor-pointer items-center gap-2.5 rounded-md border border-border bg-card px-3 py-2 text-sm transition-colors select-none has-[:checked]:border-primary/40 has-[:checked]:bg-primary/[0.06] has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50"
                >
                  <span className="grid size-[17px] shrink-0 place-items-center rounded-[5px] border-[1.5px] border-input text-primary-foreground transition-colors group-has-[:checked]/topic:border-primary group-has-[:checked]/topic:bg-primary">
                    <CheckIcon className="size-3 opacity-0 transition-opacity group-has-[:checked]/topic:opacity-100" />
                  </span>
                  <input
                    type="checkbox"
                    name="slugs"
                    value={topic.slug}
                    defaultChecked={linked.has(topic.slug)}
                    className="sr-only"
                  />
                  <span className="truncate text-muted-foreground group-has-[:checked]/topic:font-medium group-has-[:checked]/topic:text-foreground">
                    {topic.name}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {selected} selected
              </span>
              <AdminSubmit variant="outline">
                <SaveIcon />
                Save topics
              </AdminSubmit>
            </div>
          </ActionForm>
        )}
      </CardContent>
    </Card>
  );
}
