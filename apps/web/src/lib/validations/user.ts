/**
 * Zod schema for the admin user actions. The admin surface only exposes
 * delete-by-id (`DELETE /v1/admin/users/:id`) — there is no list endpoint —
 * so the only input to validate is a UUID.
 */
import { z } from "zod";

export const deleteUserSchema = z.object({
  id: z.uuid("Enter a valid user ID (UUID)."),
});

export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
