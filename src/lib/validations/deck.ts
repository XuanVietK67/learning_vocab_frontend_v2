/**
 * Zod schema for the user "create list" form (`POST /v1/me/decks`). Re-checked
 * on the server inside the action. Decks created here are always private —
 * the backend sets `owner_id`/`visibility`, so the body carries only the
 * top-level fields it accepts.
 */
import { z } from "zod";

const LANGUAGE_RE = /^[a-z]{2}(-[A-Z]{2})?$/;
const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export const createDeckSchema = z.object({
  name: z.string().trim().min(1, "Give your list a name.").max(80, "Keep it under 80 characters."),
  description: z
    .string()
    .trim()
    .max(280)
    .optional()
    .transform((v) => (v ? v : undefined)),
  language: z.string().regex(LANGUAGE_RE, "Choose a language."),
  cefrLevel: z.enum(CEFR).optional(),
});

export type CreateDeckInput = z.infer<typeof createDeckSchema>;
