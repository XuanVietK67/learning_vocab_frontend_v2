import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

/**
 * Push a `{ field: messages[] }` map (from the shared `fieldErrorsFrom`) onto
 * react-hook-form. Returns a form-level message for the `_form` key, if any.
 */
export function applyFieldErrors<T extends FieldValues>(
  fieldErrors: Record<string, string[]>,
  setError: UseFormSetError<T>,
): string | undefined {
  let formError: string | undefined;
  for (const [key, messages] of Object.entries(fieldErrors)) {
    const msg = messages[0];
    if (!msg) continue;
    if (key === "_form") formError = msg;
    else setError(key as Path<T>, { message: msg });
  }
  return formError;
}
