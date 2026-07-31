"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TopNav as UserTopNav } from "@/components/user/top-nav";
import { TopNav as PublicTopNav } from "@/components/public/top-nav";
import { useAppSelector } from "@/lib/redux/hooks";
import { useBooksQuery } from "@/lib/api/books";
import { useCategoriesQuery } from "@/lib/api/categories";
import { COVER_IMAGES } from "@/lib/book-covers";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";

const RATINGS = [5, 4, 3, 2, 1];

export default function BookListPage() {
  return (
    <Suspense fallback={null}>
      <BookListContent />
    </Suspense>
  );
}

function BookListContent() {
  const { user, isHydrated } = useAppSelector((state) => state.auth);
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get("categoryId");
  const q = searchParams.get("q") ?? undefined;
  const [categoryId, setCategoryId] = useState<number | null>(
    categoryIdParam ? Number(categoryIdParam) : null
  );
  const [minRating, setMinRating] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: categoriesData } = useCategoriesQuery();
  const categories = categoriesData?.categories ?? [];

  const { data, isLoading, isError, error, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useBooksQuery({
      categoryId: categoryId ?? undefined,
      minRating: minRating ?? undefined,
      q,
    });

  const books = data?.pages.flatMap((page) => page.books) ?? [];

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen bg-background">
      {user ? <UserTopNav /> : <PublicTopNav />}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <h1 className="text-display-xs font-bold text-foreground">
          {q ? `Search results for "${q}"` : "Book List"}
        </h1>

        <div className="mt-6 flex flex-col gap-8 md:flex-row">
          <aside className="w-full shrink-0 md:w-56">
            <button
              type="button"
              onClick={() => setIsFilterOpen((value) => !value)}
              className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 md:hidden"
            >
              <span className="text-sm font-semibold text-foreground">FILTER</span>
              <SlidersHorizontal className="size-4 text-foreground" />
            </button>

            <div
              className={cn(
                "mt-4 rounded-2xl border border-border bg-card p-5 md:mt-0 md:block",
                isFilterOpen ? "block" : "hidden"
              )}
            >
              <p className="hidden text-sm font-semibold text-foreground md:block">FILTER</p>

              <p className="font-semibold text-foreground md:mt-5">Category</p>
            <div className="mt-3 flex flex-col gap-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={categoryId === category.id}
                    onCheckedChange={(checked) =>
                      setCategoryId(checked ? category.id : null)
                    }
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-md font-normal text-foreground"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-border" />

            <p className="mt-6 font-semibold text-foreground">Rating</p>
            <div className="mt-3 flex flex-col gap-3">
              {RATINGS.map((value) => (
                <div key={value} className="flex items-center gap-2">
                  <Checkbox
                    id={`rating-${value}`}
                    checked={minRating === value}
                    onCheckedChange={(checked) => setMinRating(checked ? value : null)}
                  />
                  <Label
                    htmlFor={`rating-${value}`}
                    className="flex items-center gap-1 text-md font-normal text-foreground"
                  >
                    <Star className="size-4 fill-warning text-warning" />
                    {value}
                  </Label>
                </div>
              ))}
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {isError && (
              <p className="rounded-lg bg-destructive/10 px-4 py-3 text-md text-destructive">
                {error.message}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 md:gap-6">
              {isLoading
                ? Array.from({ length: 8 }).map((_, index) => (
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
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
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

            {!isLoading && books.length === 0 && (
              <p className="text-md text-muted-foreground">No books match this filter.</p>
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
        </div>
      </div>

      <Footer />
    </div>
  );
}
