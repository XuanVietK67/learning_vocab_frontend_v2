import { TriangleAlertIcon } from "lucide-react";

/** Top-level form error banner (e.g. "Invalid email or password"). */
export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-2xl bg-(--bad-soft) px-3.5 py-3 text-sm font-medium text-(--bad-ink)"
    >
      <TriangleAlertIcon className="mt-px size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
