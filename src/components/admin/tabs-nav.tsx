"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/borrowed-list", label: "Borrowed List" },
  { href: "/admin/users", label: "User" },
  { href: "/admin/books", label: "Book List" },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex w-full items-center gap-1 rounded-xl bg-muted p-1 sm:w-fit">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium text-muted-foreground transition-colors sm:flex-none sm:px-5",
              active
                ? "bg-card text-foreground shadow-sm"
                : "hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
