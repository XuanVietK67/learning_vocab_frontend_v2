/**
 * Zod schemas for the admin topic forms — re-checked on the server inside the
 * actions. Rules mirror docs/frontend_handoff.md (`POST /v1/admin/topics`,
 * `PATCH /:slug`). The slug is the identifier and is not editable (rename =
 * delete + recreate).
 */
import { z } from "zod";

const SLUG_RE = /^[a-z0-9-]+$/;

/** Treat empty/whitespace-only form values as "absent". */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const iconUrl = z
  .union([z.literal(""), z.url("Enter a valid URL.").max(2048)])
  .optional()
  .transform((v) => (v ? v : undefined));

export const createTopicSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters.")
    .max(64)
    .regex(SLUG_RE, "Use lowercase letters, numbers, and hyphens only."),
  name: z.string().trim().min(1, "Name is required.").max(128),
  description: optionalText(512),
  iconUrl,
});

export const updateTopicSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(128),
  description: optionalText(512),
  iconUrl,
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
