"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TopNav } from "@/components/user/top-nav";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/ui/toast";
import { useAppSelector } from "@/lib/redux/hooks";
import { useCheckoutQuery, useBorrowFromCartMutation } from "@/lib/api/cart";

const DURATIONS = [3, 5, 10] as const;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, isHydrated } = useAppSelector((state) => state.auth);

  const [itemIds, setItemIds] = useState<number[]>([]);
  const [borrowDate, setBorrowDate] = useState(todayIso());
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>(3);
  const [agreeReturn, setAgreeReturn] = useState(false);
  const [acceptPolicy, setAcceptPolicy] = useState(false);

  const { data: checkout, isLoading, isError, error } = useCheckoutQuery();
  const borrowMutation = useBorrowFromCartMutation();

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("items");
    setItemIds(raw ? raw.split(",").map(Number).filter(Number.isFinite) : []);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) router.replace("/login");
  }, [isHydrated, user, router]);

  const items = useMemo(
    () => checkout?.items.filter((item) => itemIds.includes(item.id)) ?? [],
    [checkout, itemIds]
  );

  const returnDate = useMemo(() => {
    const date = new Date(`${borrowDate}T00:00:00`);
    date.setDate(date.getDate() + duration);
    return date.toISOString().slice(0, 10);
  }, [borrowDate, duration]);

  if (!isHydrated || !user) return null;

  const canSubmit = agreeReturn && acceptPolicy && items.length > 0 && !borrowMutation.isPending;

  function handleSubmit() {
    borrowMutation.mutate(
      { itemIds, days: duration, borrowDate },
      {
        onSuccess: () => {
          router.push(`/checkout/success?returnDate=${returnDate}`);
        },
        onError: (err) => showToast(err.message, "error"),
      }
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <h1 className="text-display-xs font-bold text-foreground">Checkout</h1>

        {isError ? (
          <p className="mt-6 rounded-lg bg-destructive/10 px-4 py-3 text-md text-destructive">
            {error.message}
          </p>
        ) : isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading checkout...</p>
        ) : (
          <div className="mt-6 flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">User Information</h2>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-md">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-semibold text-foreground">{checkout?.user.name}</span>
                </div>
                <div className="flex items-center justify-between text-md">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-semibold text-foreground">{checkout?.user.email}</span>
                </div>
                <div className="flex items-center justify-between text-md">
                  <span className="text-muted-foreground">Nomor Handphone</span>
                  <span className="font-semibold text-foreground">
                    {checkout?.user.nomorHandphone || "-"}
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-border" />

              <h2 className="mt-6 font-semibold text-foreground">Book List</h2>
              <div className="mt-4 flex flex-col gap-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
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
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full shrink-0 rounded-2xl bg-card p-5 shadow-md lg:w-96">
              <h2 className="font-semibold text-foreground">Complete Your Borrow Request</h2>

              <div className="mt-5">
                <Label htmlFor="borrow-date" className="text-sm font-semibold text-foreground">
                  Borrow Date
                </Label>
                <div className="relative mt-2">
                  <input
                    id="borrow-date"
                    type="date"
                    value={borrowDate}
                    min={todayIso()}
                    onChange={(event) => setBorrowDate(event.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-4 pr-10 text-md text-foreground outline-none focus-visible:border-ring"
                  />
                  <CalendarIcon className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-foreground">Borrow Duration</p>
                <RadioGroup
                  className="mt-2"
                  value={String(duration)}
                  onValueChange={(value) => setDuration(Number(value) as (typeof DURATIONS)[number])}
                >
                  {DURATIONS.map((value) => (
                    <div key={value} className="flex items-center gap-2">
                      <RadioGroupItem value={String(value)} id={`duration-${value}`} />
                      <Label
                        htmlFor={`duration-${value}`}
                        className="text-md font-normal text-foreground"
                      >
                        {value} Days
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="mt-5 rounded-xl bg-primary-50 p-4">
                <p className="text-sm font-semibold text-foreground">Return Date</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Please return the book no later than{" "}
                  <span className="font-semibold text-destructive">
                    {formatDate(returnDate)}
                  </span>
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="agree-return"
                    checked={agreeReturn}
                    onCheckedChange={(checked) => setAgreeReturn(!!checked)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="agree-return"
                    className="text-sm leading-snug font-normal text-foreground"
                  >
                    I agree to return the book(s) before the due date.
                  </Label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="accept-policy"
                    checked={acceptPolicy}
                    onCheckedChange={(checked) => setAcceptPolicy(!!checked)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="accept-policy"
                    className="text-sm leading-snug font-normal text-foreground"
                  >
                    I accept the library borrowing policy.
                  </Label>
                </div>
              </div>

              <Button
                size="lg"
                className="mt-5 w-full rounded-full"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {borrowMutation.isPending ? "Processing..." : "Confirm & Borrow"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
