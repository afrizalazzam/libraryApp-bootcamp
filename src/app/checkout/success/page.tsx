"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopNav } from "@/components/user/top-nav";
import { useAppSelector } from "@/lib/redux/hooks";

function formatDate(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { user, isHydrated } = useAppSelector((state) => state.auth);
  const [returnDate, setReturnDate] = useState<string | null>(null);

  useEffect(() => {
    setReturnDate(new URLSearchParams(window.location.search).get("returnDate"));
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) router.replace("/login");
  }, [isHydrated, user, router]);

  if (!isHydrated || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-8">
        <div className="relative flex size-24 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-border" />
          <span className="absolute inset-2 rounded-full border border-border" />
          <span className="relative flex size-16 items-center justify-center rounded-full bg-primary">
            <Check className="size-8 text-primary-foreground" strokeWidth={3} />
          </span>
        </div>

        <h1 className="mt-6 text-display-xs font-bold text-foreground">
          Borrowing Successful!
        </h1>
        <p className="mt-2 max-w-md text-md text-muted-foreground">
          Your book has been successfully borrowed.
          {returnDate && (
            <>
              {" "}
              Please return it by{" "}
              <span className="font-semibold text-destructive">{formatDate(returnDate)}</span>
            </>
          )}
        </p>

        <Button asChild size="lg" className="mt-6 rounded-full px-8">
          <Link href="/borrowed-list">See Borrowed List</Link>
        </Button>
      </div>
    </div>
  );
}
