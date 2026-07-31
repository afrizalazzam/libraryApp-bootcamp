"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { useRelatedBooksQuery } from "@/lib/api/books";
import { COVER_IMAGES } from "@/lib/book-covers";

export function RelatedBooks({
  categoryId,
  excludeBookId,
}: {
  categoryId: number;
  excludeBookId: number;
}) {
  const { data: books, isLoading } = useRelatedBooksQuery(categoryId, excludeBookId);

  if (!isLoading && (!books || books.length === 0)) return null;

  return (
    <section>
      <h2 className="text-display-xs font-bold text-foreground">Related Books</h2>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 md:gap-6">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[3/4.4] rounded-xl bg-muted" />
                <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
              </div>
            ))
          : books?.map((book, index) => (
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
    </section>
  );
}
