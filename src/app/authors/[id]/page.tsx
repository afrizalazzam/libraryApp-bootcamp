"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BookMarked, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopNav as UserTopNav } from "@/components/user/top-nav";
import { TopNav as PublicTopNav } from "@/components/public/top-nav";
import { Footer } from "@/components/footer";
import { useAppSelector } from "@/lib/redux/hooks";
import { useAuthorBooksQuery } from "@/lib/api/authors";
import { COVER_IMAGES } from "@/lib/book-covers";

export default function AuthorPage() {
  const params = useParams<{ id: string }>();
  const authorId = Number(params.id);
  const { user, isHydrated } = useAppSelector((state) => state.auth);

  const { data, isLoading, isError, error, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useAuthorBooksQuery(authorId);

  const author = data?.pages[0]?.author;
  const bookCount = data?.pages[0]?.bookCount ?? 0;
  const books = data?.pages.flatMap((page) => page.books) ?? [];

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen bg-background">
      {user ? <UserTopNav /> : <PublicTopNav />}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        {isError ? (
          <p className="rounded-lg bg-destructive/10 px-4 py-3 text-md text-destructive">
            {error.message}
          </p>
        ) : (
          <>
            {isLoading ? (
              <div className="flex animate-pulse items-center gap-3 rounded-2xl bg-card p-4 shadow-md">
                <div className="size-14 shrink-0 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="mt-2 h-3 w-20 rounded bg-muted" />
                </div>
              </div>
            ) : author ? (
              <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-md">
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
                    {bookCount} books
                  </div>
                </div>
              </div>
            ) : null}

            <h1 className="mt-8 text-display-xs font-bold text-foreground">Book List</h1>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 md:gap-6">
              {isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
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
                      <p className="mt-3 truncate font-semibold text-foreground">
                        {book.title}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {book.author.name}
                      </p>
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
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
