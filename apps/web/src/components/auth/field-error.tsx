import { TriangleAlertIcon } from "lucide-react";

interface FieldErrorProps {
  id: string;
  messages?: string[];
}

/** Inline, accessible validation message for a single field. */
export function FieldError({ id, messages }: FieldErrorProps) {
  if (!messages?.length) return null;
  return (
    <p
      id={id}
      role="alert"
      className="flex items-center gap-1.5 text-[13px] font-medium text-(--bad-ink)"
    >
      <TriangleAlertIcon className="size-3.5 shrink-0" />
      <span>{messages[0]}</span>
    </p>
  );
}
