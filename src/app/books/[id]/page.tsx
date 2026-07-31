"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopNav } from "@/components/user/top-nav";
import { useAppSelector } from "@/lib/redux/hooks";
import { useBookQuery } from "@/lib/api/books";
import { useBorrowBookMutation } from "@/lib/api/loans";
import { useAddToCartMutation } from "@/lib/api/cart";
import { useToast } from "@/components/ui/toast";
import { BookReviews } from "@/components/user/book-reviews";
import { RelatedBooks } from "@/components/user/related-books";
import { Footer } from "@/components/footer";

export default function BookDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const router = useRouter();
  const { showToast } = useToast();

  const { user, isHydrated } = useAppSelector((state) => state.auth);
  const { data: book, isLoading, isError, error } = useBookQuery(id);
  const borrowMutation = useBorrowBookMutation();
  const addToCartMutation = useAddToCartMutation();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) router.replace("/login");
  }, [isHydrated, user, router]);

  if (!isHydrated || !user) return null;

  function handleBorrow() {
    borrowMutation.mutate(
      { bookId: id },
      {
        onSuccess: () => showToast("Book borrowed successfully."),
        onError: (err) => showToast(err.message, "error"),
      }
    );
  }

  function handleAddToCart() {
    addToCartMutation.mutate(id, {
      onSuccess: () => showToast("Added to cart."),
      onError: (err) => showToast(err.message, "error"),
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          <Link href="/" className="text-primary hover:underline">
            Home
          </Link>
          {book && (
            <>
              <ChevronRight className="size-4 text-muted-foreground" />
              <span className="text-primary">{book.category.name}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
              <span className="text-foreground">{book.title}</span>
            </>
          )}
        </nav>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading book...</p>
        ) : isError ? (
          <p className="mt-6 rounded-lg bg-destructive/10 px-4 py-3 text-md text-destructive">
            {error.message}
          </p>
        ) : book ? (
          <div className="mt-6 flex flex-col gap-8 sm:flex-row">
            <div className="mx-auto aspect-[3/4.4] w-full max-w-72 shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:mx-0">
              {book.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="size-full object-cover"
                />
              )}
            </div>

            <div className="flex-1">
              <span className="inline-block rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                {book.category.name}
              </span>
              <h1 className="mt-3 text-display-xs font-bold text-foreground">
                {book.title}
              </h1>
              <p className="mt-1 text-md text-muted-foreground">{book.author.name}</p>
              <div className="mt-2 flex items-center gap-1 text-sm text-foreground">
                <Star className="size-4 fill-warning text-warning" />
                {book.rating.toFixed(1)}
              </div>

              <div className="mt-5 flex items-center gap-6">
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {book.availableCopies}
                  </p>
                  <p className="text-sm text-muted-foreground">Stock</p>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {book.reviewCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {book.reviewCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Reviews</p>
                </div>
              </div>

              <div className="mt-5 border-t border-border" />

              <div className="mt-5">
                <h2 className="font-semibold text-foreground">Description</h2>
                <p className="mt-2 max-w-2xl text-md text-muted-foreground">
                  {book.description || "No description available."}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-6"
                  disabled={addToCartMutation.isPending}
                  onClick={handleAddToCart}
                >
                  {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                </Button>
                <Button
                  size="lg"
                  className="rounded-full px-6"
                  disabled={borrowMutation.isPending || book.availableCopies < 1}
                  onClick={handleBorrow}
                >
                  {borrowMutation.isPending
                    ? "Borrowing..."
                    : book.availableCopies < 1
                      ? "Out of Stock"
                      : "Borrow Book"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {book && (
          <>
            <div className="mt-10 border-t border-border" />
            <div className="mt-8">
              <BookReviews bookId={book.id} rating={book.rating} />
            </div>
            <div className="mt-12">
              <RelatedBooks categoryId={book.category.id} excludeBookId={book.id} />
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
