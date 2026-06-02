/** Shared shape returned by form Server Actions, consumed via `useActionState`. */
export interface FormState {
  /** Top-level error (e.g. "Invalid email or password"). */
  error?: string;
  /** Per-field validation messages, keyed by input `name`. */
  fieldErrors?: Record<string, string[]>;
  /** Non-sensitive values echoed back to repopulate the form after an error. */
  values?: Record<string, string>;
}

export const EMPTY_FORM_STATE: FormState = {};
