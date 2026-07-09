/**
 * Chrome for admin pages: the persistent admin sidebar + a role guard, shared by
 * every route in the `(admin)` group. Unauthenticated users go to login;
 * authenticated non-admins are bounced back to their dashboard (the admin
 * surface must never render for a `role: "user"` account). `getMe()` is cached,
 * so pages can call it again for their own data without a second backend hit.
 */
import { redirect } from "next/navigation";

import { AdminMobileBar, AdminSidebar } from "@/components/admin/admin-nav";
import { getMe } from "@/lib/auth/me";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMe();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex flex-1">
      <AdminSidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileBar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
