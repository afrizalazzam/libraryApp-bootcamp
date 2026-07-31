"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReviewsQuery } from "@/lib/api/reviews";
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

export function BookReviews({
  bookId,
  rating,
}: {
  bookId: number;
  rating: number;
}) {
  const { data, isLoading, isError, error, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useReviewsQuery(bookId);

  const reviews = data?.pages.flatMap((page) => page.reviews) ?? [];
  const total = data?.pages[0]?.pagination.total ?? 0;

  return (
    <section>
      <h2 className="text-display-xs font-bold text-foreground">Review</h2>

      <div className="mt-2 flex items-center gap-1 text-md text-foreground">
        <Star className="size-4 fill-warning text-warning" />
        <span className="font-semibold">{rating.toFixed(1)}</span>
        <span className="text-muted-foreground">({total} Ulasan)</span>
      </div>

      {isError && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-md text-destructive">
          {error.message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-2xl bg-card p-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="size-10 shrink-0 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="mt-2 h-3 w-32 rounded bg-muted" />
                  </div>
                </div>
                <div className="mt-3 h-3 w-full rounded bg-muted" />
                <div className="mt-2 h-3 w-2/3 rounded bg-muted" />
              </div>
            ))
          : reviews.map((review) => (
              <div key={review.id} className="rounded-2xl bg-card p-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src="/foto-profil.png"
                      alt={review.user.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{review.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-0.5">
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

                <p className="mt-3 text-md text-muted-foreground">{review.comment}</p>
              </div>
            ))}
      </div>

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
    </section>
  );
}
