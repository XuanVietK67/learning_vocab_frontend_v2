interface FieldErrorProps {
  id: string;
  messages?: string[];
}

/** Inline, accessible validation message for a single field. */
export function FieldError({ id, messages }: FieldErrorProps) {
  if (!messages?.length) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {messages[0]}
    </p>
  );
}
