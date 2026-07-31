"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TopNav } from "@/components/user/top-nav";
import { Footer } from "@/components/footer";
import { AccountTabs } from "@/components/user/account-tabs";
import { ReviewDialog } from "@/components/user/review-dialog";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setLoansSearch, setLoansStatus } from "@/lib/redux/features/uiSlice";
import { useMyLoansQuery, type Loan, type LoanStatusFilter } from "@/lib/api/loans";
import { useAllMyReviewsQuery } from "@/lib/api/reviews";
import { cn } from "@/lib/utils";

const FILTERS: { value: LoanStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "returned", label: "Returned" },
  { value: "overdue", label: "Overdue" },
];

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function statusBadgeClass(status: string) {
  return status.toLowerCase() === "overdue"
    ? "bg-destructive/10 text-destructive"
    : "bg-success/10 text-success";
}

export default function BorrowedListPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isHydrated } = useAppSelector((state) => state.auth);
  const { status, search } = useAppSelector((state) => state.ui.loans);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [reviewTarget, setReviewTarget] = useState<Loan | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) router.replace("/login");
  }, [isHydrated, user, router]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, error, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useMyLoansQuery({ status, q: debouncedSearch });
  const { data: myReviews } = useAllMyReviewsQuery();

  const reviewByBookId = useMemo(() => {
    const map = new Map<number, { star: number; comment: string }>();
    myReviews?.forEach((review) => map.set(review.book.id, review));
    return map;
  }, [myReviews]);

  if (!isHydrated || !user) return null;

  const loans = data?.pages.flatMap((page) => page.loans) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <AccountTabs />

        <h1 className="mt-6 text-display-xs font-bold text-foreground">Borrowed List</h1>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search book"
            value={search}
            onChange={(event) => dispatch(setLoansSearch(event.target.value))}
            className="h-11 rounded-full pl-11 text-base"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => dispatch(setLoansStatus(filter.value))}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                status === filter.value
                  ? "border-primary text-primary"
                  : "border-border text-foreground hover:border-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {isError && (
          <p className="mt-6 rounded-lg bg-destructive/10 px-4 py-3 text-md text-destructive">
            {error.message}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-2xl border border-border p-4">
                  <div className="h-4 w-40 rounded bg-muted" />
                  <div className="mt-4 flex gap-4">
                    <div className="aspect-[3/4.4] w-20 rounded-lg bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 w-48 rounded bg-muted" />
                      <div className="mt-2 h-3 w-32 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              ))
            : loans.map((loan) => {
                const existingReview = reviewByBookId.get(loan.book.id);

                return (
                  <div key={loan.id} className="rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            statusBadgeClass(loan.displayStatus)
                          )}
                        >
                          {loan.displayStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Due Date</span>
                        <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                          {formatLongDate(loan.dueAt)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-border" />

                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex flex-1 items-center gap-4">
                        <div className="aspect-[3/4.4] w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {loan.book.coverImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={loan.book.coverImage}
                              alt={loan.book.title}
                              className="size-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <span className="inline-block rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                            {loan.book.category.name}
                          </span>
                          <p className="mt-2 font-semibold text-foreground">{loan.book.title}</p>
                          <p className="text-sm text-muted-foreground">{loan.book.author.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatShortDate(loan.borrowedAt)} · Duration {loan.durationDays} Days
                          </p>
                        </div>
                      </div>

                      {!existingReview && (
                        <Button
                          size="lg"
                          className="w-full rounded-full sm:w-auto"
                          onClick={() => setReviewTarget(loan)}
                        >
                          Give Review
                        </Button>
                      )}
                    </div>

                    {existingReview && (
                      <>
                        <div className="mt-4 border-t border-border" />
                        <div className="mt-4 flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={cn(
                                "size-4",
                                index < existingReview.star
                                  ? "fill-warning text-warning"
                                  : "fill-muted text-muted"
                              )}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-md text-muted-foreground">
                          {existingReview.comment}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
        </div>

        {!isLoading && loans.length === 0 && (
          <p className="mt-6 text-md text-muted-foreground">No borrowed books found.</p>
        )}

        {hasNextPage && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              size="lg"
              className="h-11 rounded-full px-6"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>

      <Footer />

      {reviewTarget && (
        <ReviewDialog
          bookId={reviewTarget.book.id}
          bookTitle={reviewTarget.book.title}
          open={!!reviewTarget}
          onOpenChange={(open) => !open && setReviewTarget(null)}
        />
      )}
    </div>
  );
}
