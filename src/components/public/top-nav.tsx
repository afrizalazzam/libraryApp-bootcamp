"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { BookyLogo } from "@/components/booky-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function TopNav() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    router.push(trimmed ? `/books?q=${encodeURIComponent(trimmed)}` : "/books");
    setIsMobileSearchOpen(false);
  }

  return (
    <header className="border-b border-border bg-card px-4 py-3 sm:px-8 sm:py-4">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6">
        <BookyLogo hideLabelOnMobile />

        <div className="flex items-center">
          <form
            onSubmit={handleSearchSubmit}
            className="relative mx-auto hidden w-full max-w-md sm:block"
          >
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search book"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-11 rounded-full pl-11 text-base"
            />
          </form>

          {isMobileSearchOpen && (
            <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2 sm:hidden">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search book"
                  autoFocus
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="h-11 rounded-full pl-11 text-base"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-foreground"
                aria-label="Close search"
              >
                <X className="size-5" />
              </button>
            </form>
          )}
        </div>

        <div
          className={cn(
            "items-center gap-2 sm:flex sm:gap-4",
            isMobileSearchOpen ? "hidden" : "flex"
          )}
        >
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(true)}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground sm:hidden"
            aria-label="Search"
          >
            <Search className="size-5" />
          </button>

          <button
            type="button"
            className="relative flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-muted"
            aria-label="Cart"
          >
            <Image src="/icons/cart.png" alt="" width={64} height={64} className="size-6" />
          </button>

          <div className="hidden items-center gap-3 sm:flex">
            <Button asChild variant="outline" size="lg" className="h-10 rounded-full px-5">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="lg" className="h-10 rounded-full px-5">
              <Link href="/register">Register</Link>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((value) => !value)}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-foreground sm:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Menu"}
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="mt-4 flex items-center gap-3 sm:hidden">
          <Button asChild variant="outline" size="lg" className="h-11 flex-1 rounded-full">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild size="lg" className="h-11 flex-1 rounded-full">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      )}
    </header>
  );
}
