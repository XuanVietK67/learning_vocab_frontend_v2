import { Trash2Icon } from "lucide-react";

import { ActionForm } from "@/components/admin/action-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteUserAction } from "@/lib/admin/user-actions";
import type { UserResponse } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

const TH = "px-3 py-2 text-left text-xs font-medium text-muted-foreground";
const TD = "px-3 py-2.5 align-middle";

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Table of user accounts with a per-row delete. Admin rows aren't deletable. */
export function UsersTable({ users }: { users: UserResponse[] }) {
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
      <table className="w-full border-collapse text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className={TH}>User</th>
            <th className={TH}>Email</th>
            <th className={TH}>Role</th>
            <th className={TH}>Status</th>
            <th className={TH}>Joined</th>
            <th className={cn(TH, "text-right")}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-border/60 last:border-0 hover:bg-muted/30"
            >
              <td className={cn(TD, "font-medium")}>{user.username}</td>
              <td className={cn(TD, "text-muted-foreground")}>{user.email}</td>
              <td className={TD}>
                <Badge
                  className={cn(
                    user.role === "admin" && "bg-primary/10 text-primary",
                  )}
                >
                  {user.role}
                </Badge>
              </td>
              <td className={TD}>
                {user.isEmailVerified ? (
                  <Badge>Verified</Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Unverified
                  </span>
                )}
              </td>
              <td className={cn(TD, "whitespace-nowrap text-muted-foreground tabular-nums")}>
                {user.createdAt.slice(0, 10)}
              </td>
              <td className={cn(TD, "text-right")}>
                {user.role === "admin" ? (
                  <span className="text-xs text-muted-foreground">—</span>
                ) : (
                  <ActionForm action={deleteUserAction} successMessage="User deleted">
                    <input type="hidden" name="id" value={user.id} />
                    <ConfirmButton
                      variant="ghost"
                      size="icon-sm"
                      message={`Delete "${user.username}"? This permanently removes the account and cascades their data.`}
                      aria-label={`Delete ${user.username}`}
                    >
                      <Trash2Icon className="text-muted-foreground" />
                    </ConfirmButton>
                  </ActionForm>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
