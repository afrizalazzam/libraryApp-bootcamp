"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Share2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminBookQuery } from "@/lib/api/admin-books";
import { useToast } from "@/components/ui/toast";

export default function AdminBookPreviewPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { showToast } = useToast();

  const { data: book, isLoading, isError, error } = useAdminBookQuery(id);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: book?.title, url });
      } catch {
        // user cancelled the share sheet
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    showToast("Link copied to clipboard.");
  }

  return (
    <div>
      <Link
        href="/admin/books"
        className="inline-flex items-center gap-2 text-lg font-semibold text-foreground"
      >
        <ArrowLeft className="size-5" />
        Preview Book
      </Link>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading book...</p>
      ) : isError ? (
        <p className="mt-6 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load book."}
        </p>
      ) : book ? (
        <div className="mt-6 flex flex-col gap-8 sm:flex-row">
          <div className="mx-auto aspect-[3/4.4] w-full max-w-56 shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:mx-0">
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
            <h2 className="mt-3 text-xl font-bold text-foreground">
              {book.title}
            </h2>
            <p className="mt-1 text-md text-muted-foreground">
              {book.author.name}
            </p>
            <div className="mt-2 flex items-center gap-1 text-sm text-foreground">
              <Star className="size-4 fill-warning text-warning" />
              {book.rating.toFixed(1)}
            </div>

            <div className="mt-5 flex items-center gap-6">
              <div>
                <p className="text-lg font-bold text-foreground">
                  {book.totalCopies}
                </p>
                <p className="text-sm text-muted-foreground">Page</p>
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
              <h3 className="font-semibold text-foreground">Description</h3>
              <p className="mt-2 max-w-2xl text-md text-muted-foreground">
                {book.description || "No description available."}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button variant="outline" size="lg" className="rounded-full px-6">
                Add to Cart
              </Button>
              <Button size="lg" className="rounded-full px-6">
                Borrow Book
              </Button>
              <Button
                variant="outline"
                size="icon-lg"
                className="rounded-full"
                aria-label="Share"
                onClick={handleShare}
              >
                <Share2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
