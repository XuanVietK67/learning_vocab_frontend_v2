/**
 * Canonical list of UI-selectable languages (ISO 639-1, optionally with region —
 * see docs/frontend_handoff.md). Single source of truth for onboarding and the
 * admin surfaces; don't hand-duplicate this list.
 */
export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "vi", label: "Tiếng Việt" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "zh", label: "中文" },
  { value: "pt-BR", label: "Português (Brasil)" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["value"];

/** Human label for a language code, falling back to the raw code if unknown. */
export function languageLabel(code: string | null | undefined): string {
  if (!code) return "";
  return LANGUAGES.find((lang) => lang.value === code)?.label ?? code;
}
