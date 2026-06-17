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
  /**
   * Forwarded to the underlying Button. Login/register pass `"secondary"` (the
   * soft mint-tint that sits under the loud Google CTA); verify uses the default
   * loud mint.
   */
  variant?: React.ComponentProps<typeof Button>["variant"];
}

/**
 * Submit button wired to the parent `<form>`'s pending state via `useFormStatus`.
 * Must be rendered inside a `<form>`.
 */
export function SubmitButton({
  children,
  className,
  pendingLabel,
  variant = "default",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      disabled={pending}
      className={cn("h-12.5 w-full rounded-full text-[15px] font-bold", className)}
    >
      {pending && <Loader2Icon className="animate-spin" />}
      {pending ? (pendingLabel ?? children) : children}
    </Button>
  );
}
