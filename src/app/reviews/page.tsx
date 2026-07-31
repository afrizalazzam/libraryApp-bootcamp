"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TopNav } from "@/components/user/top-nav";
import { Footer } from "@/components/footer";
import { AccountTabs } from "@/components/user/account-tabs";
import { useAppSelector } from "@/lib/redux/hooks";
import { useMyReviewsQuery } from "@/lib/api/reviews";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  const date = new Date(iso);
  const datePart = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart}, ${timePart}`;
}

export default function ReviewsPage() {
  const router = useRouter();
  const { user, isHydrated } = useAppSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) router.replace("/login");
  }, [isHydrated, user, router]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, error, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useMyReviewsQuery({ q: debouncedSearch });

  if (!isHydrated || !user) return null;

  const reviews = data?.pages.flatMap((page) => page.reviews) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <AccountTabs />

        <h1 className="mt-6 text-display-xs font-bold text-foreground">Reviews</h1>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search Reviews"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 rounded-full pl-11 text-base"
          />
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
                  <div className="h-3 w-32 rounded bg-muted" />
                  <div className="mt-4 flex gap-4">
                    <div className="aspect-[3/4.4] w-20 rounded-lg bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 w-48 rounded bg-muted" />
                      <div className="mt-2 h-3 w-32 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              ))
            : reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</p>

                  <div className="mt-4 border-t border-border" />

                  <div className="mt-4 flex items-center gap-4">
                    <div className="aspect-[3/4.4] w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {review.book.coverImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={review.book.coverImage}
                          alt={review.book.title}
                          className="size-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <span className="inline-block rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                        {review.book.category.name}
                      </span>
                      <p className="mt-2 font-semibold text-foreground">{review.book.title}</p>
                      <p className="text-sm text-muted-foreground">{review.book.author.name}</p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border" />

                  <div className="mt-4 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={cn(
                          "size-4",
                          index < review.star
                            ? "fill-warning text-warning"
                            : "fill-muted text-muted"
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-md text-muted-foreground">{review.comment}</p>
                </div>
              ))}
        </div>

        {!isLoading && reviews.length === 0 && (
          <p className="mt-6 text-md text-muted-foreground">
            You haven&apos;t written any reviews yet.
          </p>
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
    </div>
  );
}
