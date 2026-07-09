"use client";

import { Fragment, useState } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";

import { ActionForm } from "@/components/admin/action-form";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteTopicAction, updateTopicAction } from "@/lib/admin/topic-actions";
import type { Topic } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const TH = "px-3 py-2 text-left text-xs font-medium text-muted-foreground";
const TD = "px-3 py-2.5 align-middle";

/** Topics manager rendered as a table; "Edit" expands an inline edit row. */
export function TopicsTable({ topics }: { topics: Topic[] }) {
  const [editing, setEditing] = useState<string | null>(null);

  if (topics.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
        No topics yet — use “New topic” to add one.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
      <table className="w-full border-collapse text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className={TH}>Slug</th>
            <th className={TH}>Name</th>
            <th className={TH}>Description</th>
            <th className={cn(TH, "text-right")}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {topics.map((topic) => {
            const isEditing = editing === topic.slug;
            const fieldId = (name: string) => `edit-${topic.slug}-${name}`;

            return (
              <Fragment key={topic.id}>
                <tr
                  className={cn(
                    "border-b border-border/60 hover:bg-muted/30",
                    isEditing && "bg-muted/30",
                  )}
                >
                  <td className={TD}>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                      {topic.slug}
                    </code>
                  </td>
                  <td className={cn(TD, "font-medium")}>{topic.name}</td>
                  <td className={cn(TD, "max-w-xs truncate text-muted-foreground")}>
                    {topic.description ?? "—"}
                  </td>
                  <td className={cn(TD, "text-right")}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${topic.slug}`}
                        aria-pressed={isEditing}
                        onClick={() =>
                          setEditing(isEditing ? null : topic.slug)
                        }
                      >
                        <PencilIcon className="text-muted-foreground" />
                      </Button>
                      <form action={deleteTopicAction}>
                        <input type="hidden" name="slug" value={topic.slug} />
                        <ConfirmButton
                          variant="ghost"
                          size="icon-sm"
                          message={`Delete topic "${topic.slug}"? Vocabularies keep their other tags.`}
                          aria-label={`Delete ${topic.slug}`}
                        >
                          <Trash2Icon className="text-muted-foreground" />
                        </ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>

                {isEditing && (
                  <tr className="border-b border-border/60 bg-muted/20">
                    <td className={cn(TD, "p-3")} colSpan={4}>
                      <ActionForm
                        action={updateTopicAction}
                        successMessage="Topic saved"
                        onSuccess={() => setEditing(null)}
                        className="grid gap-3 sm:grid-cols-2"
                      >
                        <input type="hidden" name="slug" value={topic.slug} />
                        <div className="grid gap-2">
                          <Label htmlFor={fieldId("name")}>Name</Label>
                          <Input
                            id={fieldId("name")}
                            name="name"
                            defaultValue={topic.name}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={fieldId("iconUrl")}>Icon URL</Label>
                          <Input
                            id={fieldId("iconUrl")}
                            name="iconUrl"
                            type="url"
                            defaultValue={topic.iconUrl ?? ""}
                          />
                        </div>
                        <div className="grid gap-2 sm:col-span-2">
                          <Label htmlFor={fieldId("description")}>
                            Description
                          </Label>
                          <Input
                            id={fieldId("description")}
                            name="description"
                            defaultValue={topic.description ?? ""}
                          />
                        </div>
                        <div className="flex gap-2 sm:col-span-2">
                          <AdminSubmit variant="outline">Save</AdminSubmit>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditing(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </ActionForm>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
