"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TopNav } from "@/components/user/top-nav";
import { Footer } from "@/components/footer";
import { useAppSelector } from "@/lib/redux/hooks";
import { useCartQuery } from "@/lib/api/cart";

export default function CartPage() {
  const router = useRouter();
  const { user, isHydrated } = useAppSelector((state) => state.auth);

  const { data: cart, isLoading, isError, error } = useCartQuery();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) router.replace("/login");
  }, [isHydrated, user, router]);

  useEffect(() => {
    if (cart) setSelectedIds(new Set(cart.items.map((item) => item.id)));
  }, [cart]);

  if (!isHydrated || !user) return null;

  const items = cart?.items ?? [];
  const allSelected = items.length > 0 && selectedIds.size === items.length;

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? new Set(items.map((item) => item.id)) : new Set());
  }

  function toggleItem(id: number, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleCheckout() {
    router.push(`/checkout?items=${Array.from(selectedIds).join(",")}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <h1 className="text-display-xs font-bold text-foreground">My Cart</h1>

        {isError ? (
          <p className="mt-6 rounded-lg bg-destructive/10 px-4 py-3 text-md text-destructive">
            {error.message}
          </p>
        ) : isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading cart...</p>
        ) : items.length === 0 ? (
          <p className="mt-6 text-md text-muted-foreground">
            Your cart is empty.{" "}
            <Link href="/" className="text-primary hover:underline">
              Browse books
            </Link>
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={(checked) => toggleAll(!!checked)}
                />
                <Label htmlFor="select-all" className="text-md font-normal text-foreground">
                  Select All
                </Label>
              </div>

              <div className="mt-4 divide-y divide-border">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0">
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={(checked) => toggleItem(item.id, !!checked)}
                    />

                    <Link href={`/books/${item.bookId}`} className="flex flex-1 items-center gap-4">
                      <div className="aspect-[3/4.4] w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:w-24">
                        {item.book.coverImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.book.coverImage}
                            alt={item.book.title}
                            className="size-full object-cover"
                          />
                        )}
                      </div>

                      <div>
                        <span className="inline-block rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                          {item.book.category.name}
                        </span>
                        <p className="mt-2 font-semibold text-foreground">{item.book.title}</p>
                        <p className="text-sm text-muted-foreground">{item.book.author.name}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden w-full shrink-0 rounded-2xl bg-card p-5 shadow-md lg:block lg:w-80">
              <p className="font-semibold text-foreground">Loan Summary</p>
              <div className="mt-4 flex items-center justify-between text-md">
                <span className="text-muted-foreground">Total Book</span>
                <span className="font-semibold text-foreground">
                  {selectedIds.size} Items
                </span>
              </div>
              <Button
                size="lg"
                className="mt-4 w-full rounded-full"
                disabled={selectedIds.size === 0}
                onClick={handleCheckout}
              >
                Borrow Book
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />

      {items.length > 0 && (
        <>
          <div className="pb-24 lg:hidden" />
          <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-border bg-card px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] lg:hidden">
            <div>
              <p className="text-sm text-muted-foreground">Total Book</p>
              <p className="font-semibold text-foreground">{selectedIds.size} Items</p>
            </div>
            <Button
              size="lg"
              className="rounded-full px-8"
              disabled={selectedIds.size === 0}
              onClick={handleCheckout}
            >
              Borrow Book
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
