"use client";

import { GlobeIcon, Loader2Icon, LockIcon, Share2Icon, UsersIcon } from "lucide-react";

import { Modal } from "./modal";

/**
 * The privacy gate before publishing (design §6.1 / API §1). Publishing exposes
 * every word in the list — including the author's own user-created words — so
 * this dialog says so plainly before the first share. Reassures that it's
 * one-tap reversible and that learners only get their own private copy.
 */
export function PublishConfirmDialog({
  name,
  vocabCount,
  busy,
  onCancel,
  onConfirm,
}: {
  name: string;
  vocabCount: number;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal onClose={onCancel} dismissible={!busy} width={470}>
      <div className="mb-4 flex gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-[13px] bg-(--warn-soft) text-(--warn)">
          <GlobeIcon className="size-6" strokeWidth={2.2} />
        </span>
        <div>
          <h2 className="font-heading mt-0.5 text-lg font-bold leading-tight tracking-tight text-(--ink)">
            Share “{name}” with everyone?
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-(--ink-2)">
            Anyone can find this list in the community and copy it — including all{" "}
            <strong className="text-(--ink)">
              {vocabCount} {vocabCount === 1 ? "word" : "words"}, even the ones you added
              yourself.
            </strong>
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-2 rounded-[14px] border border-(--line) bg-(--card-2) px-4 py-3">
        <Reassure icon={LockIcon}>You can make it private again at any time — one tap.</Reassure>
        <Reassure icon={UsersIcon}>
          Learners get their own private copy; your list stays yours.
        </Reassure>
      </div>

      <div className="flex justify-end gap-2.5">
        <button
          type="button"
          className="lr-btn lr-btn--ghost lr-btn--lg"
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="lr-btn lr-btn--primary lr-btn--lg"
          disabled={busy}
          onClick={onConfirm}
        >
          {busy ? (
            <>
              <Loader2Icon className="size-4 animate-spin" /> Sharing…
            </>
          ) : (
            <>
              <Share2Icon className="size-4" /> Share list
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}

function Reassure({
  icon: Icon,
  children,
}: {
  icon: typeof LockIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 text-[13px] font-medium text-(--ink-2)">
      <Icon className="size-4 shrink-0 text-(--primary)" />
      {children}
    </div>
  );
}
