"use client";

import { Loader2Icon } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type ButtonProps = React.ComponentProps<typeof Button>;

interface ConfirmButtonProps extends ButtonProps {
  /** Native confirm() prompt shown before the form submits. */
  message: string;
}

/**
 * Submit button that asks for confirmation before allowing a destructive form
 * action to run. Must be rendered inside a `<form action={serverAction}>`.
 */
export function ConfirmButton({
  children,
  message,
  variant = "destructive",
  size = "sm",
  onClick,
  ...props
}: ConfirmButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...props}
    >
      {pending && <Loader2Icon className="animate-spin" />}
      {children}
    </Button>
  );
}
