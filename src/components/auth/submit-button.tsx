"use client";

import { Loader2Icon } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmitButtonProps {
  children: React.ReactNode;
  className?: string;
  /** Shown (with a spinner) while the form action is pending. */
  pendingLabel?: string;
}

/**
 * Submit button wired to the parent `<form>`'s pending state via `useFormStatus`.
 * Must be rendered inside a `<form>`.
 */
export function SubmitButton({ children, className, pendingLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={cn("h-11 w-full text-sm", className)}
    >
      {pending && <Loader2Icon className="animate-spin" />}
      {pending ? (pendingLabel ?? children) : children}
    </Button>
  );
}
