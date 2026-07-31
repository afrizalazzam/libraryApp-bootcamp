"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Search, X } from "lucide-react";
import { BookyLogo } from "@/components/booky-logo";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/features/authSlice";
import { clearSession } from "@/lib/auth-storage";
import { cn } from "@/lib/utils";
import { useCartQuery } from "@/lib/api/cart";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TopNav() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: cart } = useCartQuery();

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    router.push(trimmed ? `/books?q=${encodeURIComponent(trimmed)}` : "/books");
    setIsMobileSearchOpen(false);
  }

  function handleLogout() {
    clearSession();
    dispatch(logout());
    router.push("/login");
  }

  if (!user) return null;

  return (
    <header className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border bg-card px-4 py-3 sm:gap-6 sm:px-8 sm:py-4">
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

        <Link
          href="/cart"
          className="relative flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-muted"
          aria-label="Cart"
        >
          <Image src="/icons/cart.png" alt="" width={64} height={64} className="size-6" />
          {!!cart?.itemCount && (
            <span className="absolute top-0 right-0 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
              {cart.itemCount}
            </span>
          )}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
            <Avatar className="size-9 shrink-0">
              <AvatarImage src={user.profilePhoto ?? "/foto-profil.png"} alt={user.name} />
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="hidden text-md font-medium text-foreground sm:inline">
              {user.name}
            </span>
            <ChevronDown className="hidden size-4 text-muted-foreground sm:inline" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/borrowed-list">Borrowed List</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/reviews">Reviews</Link>
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
