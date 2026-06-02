"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import type { ActionResult } from "@/lib/admin/types";

const INITIAL: ActionResult = { ok: false };

type Action = (
  prev: ActionResult,
  formData: FormData,
) => Promise<ActionResult>;

interface ActionFormProps {
  action: Action;
  children: React.ReactNode;
  className?: string;
  /** Toast shown after a successful submit. */
  successMessage?: string;
  /** Reset uncontrolled inputs on success — off for "edit in place" forms. */
  resetOnSuccess?: boolean;
}

/**
 * Thin client wrapper around a mutation Server Action: wires `useActionState`,
 * renders an inline error, resets/toasts on success. Children are the (mostly
 * server-rendered) form fields and submit button.
 */
export function ActionForm({
  action,
  children,
  className,
  successMessage,
  resetOnSuccess = false,
}: ActionFormProps) {
  const [state, formAction] = useActionState(action, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);
  const lastState = useRef<ActionResult>(INITIAL);

  useEffect(() => {
    if (state === lastState.current) return;
    lastState.current = state;
    if (state.ok) {
      if (resetOnSuccess) formRef.current?.reset();
      if (successMessage) toast.success(successMessage);
    }
  }, [state, successMessage, resetOnSuccess]);

  return (
    <form ref={formRef} action={formAction} className={className}>
      {children}
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
