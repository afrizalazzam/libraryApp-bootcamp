"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdminPagination } from "@/components/admin/pagination";
import { AdminTabs } from "@/components/admin/tabs-nav";
import { useAdminUsersQuery } from "@/lib/api/admin";

const PAGE_SIZE = 10;

function formatDate(iso: string) {
  const date = new Date(iso);
  const datePart = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart}, ${timePart}`;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data, isLoading, isError, error } = useAdminUsersQuery({
    q: debouncedSearch,
    page,
    limit: PAGE_SIZE,
  });

  const users = data?.users ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <AdminTabs />
      <h1 className="mt-8 text-display-xs font-bold text-foreground">User</h1>

      <div className="relative mt-6 max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search user"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-11 rounded-full pl-11 text-base"
        />
      </div>

      {/* Mobile: stacked cards */}
      <div className="mt-6 flex flex-col gap-4 sm:hidden">
        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Loading users...
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load users."}
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No users found.
          </div>
        ) : (
          users.map((user, index) => (
            <div
              key={user.id}
              className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4 text-sm"
            >
              <UserRow label="No" value={(page - 1) * PAGE_SIZE + index + 1} />
              <UserRow label="Name" value={user.name} />
              <UserRow label="Email" value={user.email} />
              <UserRow label="Nomor Handphone" value={user.phone ?? "-"} />
              <UserRow label="Created at" value={formatDate(user.createdAt)} />
            </div>
          ))
        )}

        {pagination && (
          <div className="rounded-2xl border border-border bg-card">
            <AdminPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Desktop: table */}
      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-border bg-card sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">
                  No
                </th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">
                  Name
                </th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">
                  Nomor Handphone
                </th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">
                  Email
                </th>
                <th className="px-6 py-3 text-sm font-medium text-muted-foreground">
                  Created at
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-destructive"
                  >
                    {error instanceof Error
                      ? error.message
                      : "Failed to load users."}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className="border-t border-border">
                    <td className="px-6 py-4 text-sm text-foreground">
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {user.phone ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="border-t border-border">
            <AdminPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function UserRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
