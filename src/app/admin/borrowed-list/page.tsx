"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdminPagination } from "@/components/admin/pagination";
import { AdminTabs } from "@/components/admin/tabs-nav";
import {
  useAdminLoansQuery,
  type AdminLoanRow,
  type LoanStatusFilter,
} from "@/lib/api/admin-loans";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const STATUS_FILTERS: { value: LoanStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "returned", label: "Returned" },
  { value: "overdue", label: "Overdue" },
];

const STATUS_STYLES: Record<AdminLoanRow["displayStatus"], string> = {
  Active: "bg-success/10 text-success",
  Returned: "bg-muted text-muted-foreground",
  Overdue: "bg-destructive/10 text-destructive",
};

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function AdminBorrowedListPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<LoanStatusFilter>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data, isLoading, isError, error } = useAdminLoansQuery({
    q: debouncedSearch,
    status,
    page,
    limit: PAGE_SIZE,
  });

  const loans = data?.loans ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <AdminTabs />
      <h1 className="mt-8 text-display-xs font-bold text-foreground">
        Borrowed List
      </h1>

      <div className="relative mt-6 max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-11 rounded-full pl-11 text-base"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => {
              setStatus(filter.value);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              status === filter.value
                ? "border-primary text-primary"
                : "border-border text-foreground hover:bg-muted"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Loading borrowed list...
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Failed to load borrowed list."}
          </div>
        ) : loans.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No borrowed books found.
          </div>
        ) : (
          loans.map((loan) => (
            <div key={loan.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      STATUS_STYLES[loan.displayStatus]
                    )}
                  >
                    {loan.displayStatus}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                    {formatLongDate(loan.dueAt)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="aspect-[3/4.4] w-32 shrink-0 overflow-hidden rounded-lg bg-muted sm:aspect-auto sm:h-23 sm:w-16">
                    {loan.book.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={loan.book.coverImage}
                        alt={loan.book.title}
                        className="size-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="w-fit rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                      {loan.book.category.name}
                    </span>
                    <p className="font-semibold text-foreground">{loan.book.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {loan.book.author.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatShortDate(loan.borrowedAt)} · Duration{" "}
                      {loan.durationDays} Days
                    </p>
                  </div>
                </div>

                <div className="border-t border-border pt-3 text-left sm:shrink-0 sm:border-t-0 sm:pt-0 sm:text-right">
                  <p className="text-sm text-muted-foreground">borrower&apos;s name</p>
                  <p className="font-semibold text-foreground">{loan.borrower.name}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination && (
        <div className="mt-4 rounded-2xl border border-border bg-card">
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
  );
}
