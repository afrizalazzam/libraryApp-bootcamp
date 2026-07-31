"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecommendedBooksQuery } from "@/lib/api/books";
import { COVER_IMAGES } from "@/lib/book-covers";

export function BookRecommendations() {
  const { data, isLoading, isError, error, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useRecommendedBooksQuery();

  const books = data?.pages.flatMap((page) => page.books) ?? [];

  return (
    <section>
      <h2 className="text-display-xs font-bold text-foreground">Recommendation</h2>

      {isError && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-md text-destructive">
          {error.message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 md:gap-6">
        {isLoading
          ? Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[3/4.4] rounded-xl bg-muted" />
                <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
              </div>
            ))
          : books.map((book, index) => (
              <Link key={book.id} href={`/books/${book.id}`}>
                <div className="relative aspect-[3/4.4] overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={COVER_IMAGES[index % COVER_IMAGES.length]}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 20vw, (min-width: 640px) 33vw, 50vw"
                  />
                </div>
                <p className="mt-3 truncate font-semibold text-foreground">{book.title}</p>
                <p className="truncate text-sm text-muted-foreground">{book.author.name}</p>
                <div className="mt-1 flex items-center gap-1 text-sm text-foreground">
                  <Star className="size-4 fill-warning text-warning" />
                  {book.rating.toFixed(1)}
                </div>
              </Link>
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
