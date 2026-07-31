"use client";

import Image from "next/image";
import Link from "next/link";
import { BookMarked } from "lucide-react";
import { usePopularAuthorsQuery } from "@/lib/api/authors";

export function PopularAuthors() {
  const { data, isLoading, isError, error } = usePopularAuthorsQuery();
  const authors = data?.authors ?? [];

  return (
    <section>
      <div className="border-t border-border" />

      <h2 className="mt-8 text-display-xs font-bold text-foreground">Popular Authors</h2>

      {isError && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-md text-destructive">
          {error.message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse items-center gap-3 rounded-2xl bg-card p-4 shadow-md"
              >
                <div className="size-14 shrink-0 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="mt-2 h-3 w-16 rounded bg-muted" />
                </div>
              </div>
            ))
          : authors.map((author) => (
              <Link
                key={author.id}
                href={`/authors/${author.id}`}
                className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-md"
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src="/foto-profil.png"
                    alt={author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{author.name}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <BookMarked className="size-4 text-primary" />
                    {author.bookCount} books
                  </div>
                </div>
              </Link>
            ))}
      </div>

    </section>
  );
}
