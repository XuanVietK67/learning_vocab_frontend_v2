"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { approveDraftAction } from "@/lib/admin/quick";

/**
 * Pre-approval banner shown on the edit screen for an unapproved AI draft.
 * Approving here mirrors the review queue: it flips `isApproved` and kicks off
 * background audio/image generation, then refreshes the route so the banner
 * clears and the now-published state renders.
 */
export function DraftApproveBanner({ vocabId }: { vocabId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function approve() {
    setBusy(true);
    const res = await approveDraftAction(vocabId);
    if (!res.ok) {
      toast.error(res.error ?? "Could not approve the draft.");
      setBusy(false);
      return;
    }
    toast.success(
      "Published — audio & images are generating in the background.",
    );
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200/70 bg-amber-50/50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20">
      <div className="flex items-center gap-2.5 text-sm">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
          <SparklesIcon className="size-4" />
        </span>
        <div>
          <p className="font-medium">Unapproved AI draft</p>
          <p className="text-muted-foreground">
            Edit the fields below, then approve to publish. Drafts aren’t visible
            to learners.
          </p>
        </div>
      </div>
      <Button size="sm" disabled={busy} onClick={approve}>
        {busy ? <Loader2Icon className="animate-spin" /> : <CheckIcon />}
        Approve &amp; publish
      </Button>
    </div>
  );
}
