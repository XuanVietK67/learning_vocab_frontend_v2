import type { Metadata } from "next";

import { Pagination } from "@/components/admin/pagination";
import { UsersTable } from "@/components/admin/users-table";
import { listAdminUsers } from "@/lib/admin/users";

export const metadata: Metadata = {
  title: "Users",
};

const PAGE_SIZE = 20;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** First value of a (possibly repeated) search param. */
function one(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.length > 0 ? v : undefined;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const pageNum = Number.parseInt(one(sp.page) ?? "1", 10);
  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;

  const result = await listAdminUsers({ page, limit: PAGE_SIZE });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-8 sm:px-6 lg:py-10">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Users
        </h1>
        <p className="text-sm text-muted-foreground">
          All accounts. Admin accounts can&apos;t be deleted.
        </p>
      </header>

      {result.data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-16 text-center text-sm text-muted-foreground">
          No users to show. This list needs the{" "}
          <code>GET /v1/admin/users</code> endpoint — once the backend serves it,
          accounts appear here.
        </div>
      ) : (
        <>
          <UsersTable users={result.data} />
          <Pagination
            page={result.page}
            limit={result.limit}
            total={result.total}
          />
        </>
      )}
    </div>
  );
}
