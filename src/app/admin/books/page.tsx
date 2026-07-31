"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderCog, MoreHorizontal, Plus, Search, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminPagination } from "@/components/admin/pagination";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { ManageCategoriesDialog } from "@/components/admin/manage-categories-dialog";
import { ManageAuthorsDialog } from "@/components/admin/manage-authors-dialog";
import { AdminTabs } from "@/components/admin/tabs-nav";
import { useToast } from "@/components/ui/toast";
import {
  useAdminBooksQuery,
  useDeleteBookMutation,
  type AdminBookRow,
  type BookStatusFilter,
} from "@/lib/api/admin-books";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const STATUS_FILTERS: { value: BookStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "borrowed", label: "Borrowed" },
  { value: "returned", label: "Returned" },
];

export default function AdminBooksPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<BookStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [bookToDelete, setBookToDelete] = useState<AdminBookRow | null>(null);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [manageAuthorsOpen, setManageAuthorsOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data, isLoading, isError, error } = useAdminBooksQuery({
    q: debouncedSearch,
    status,
    page,
    limit: PAGE_SIZE,
  });

  const deleteMutation = useDeleteBookMutation();

  const books = data?.books ?? [];
  const pagination = data?.pagination;

  function handleConfirmDelete() {
    if (!bookToDelete) return;
    deleteMutation.mutate(bookToDelete.id, {
      onSuccess: () => showToast("Delete Success", "success"),
      onError: (error) =>
        showToast(
          error instanceof Error ? error.message : "Failed to delete book.",
          "error"
        ),
      onSettled: () => setBookToDelete(null),
    });
  }

  return (
    <div>
      <AdminTabs />
      <h1 className="mt-8 text-display-xs font-bold text-foreground">Book List</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button asChild size="lg" className="h-11 rounded-full px-6">
          <Link href="/admin/books/new">
            <Plus className="size-4" data-icon="inline-start" />
            Add Book
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-11 rounded-full px-6"
          onClick={() => setManageCategoriesOpen(true)}
        >
          <FolderCog className="size-4" data-icon="inline-start" />
          Manage Categories
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-11 rounded-full px-6"
          onClick={() => setManageAuthorsOpen(true)}
        >
          <Users className="size-4" data-icon="inline-start" />
          Manage Authors
        </Button>
      </div>

      <div className="relative mt-6 max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search book"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-11 rounded-full pl-11 text-base"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => {
              setStatus(filter.value);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              status === filter.value
                ? "border-primary text-primary"
                : "border-border text-foreground hover:bg-muted"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Loading books...
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load books."}
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No books found.
          </div>
        ) : (
          books.map((book) => (
            <div
              key={book.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 sm:justify-between"
            >
              <div className="flex min-w-0 flex-1 gap-4 sm:flex-none">
                <div className="h-23 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {book.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="size-full object-cover"
                    />
                  )}
                </div>

                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="w-fit rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                    {book.category.name}
                  </span>
                  <p className="truncate font-semibold text-foreground">{book.title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {book.author.name}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-foreground">
                    <Star className="size-4 fill-warning text-warning" />
                    {book.rating.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Desktop: inline actions */}
              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                <Button asChild variant="outline" size="lg" className="rounded-full px-5">
                  <Link href={`/admin/books/${book.id}`}>Preview</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-5">
                  <Link href={`/admin/books/${book.id}/edit`}>Edit</Link>
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  className="rounded-full px-5"
                  onClick={() => setBookToDelete(book)}
                >
                  Delete
                </Button>
              </div>

              {/* Mobile: overflow menu */}
              <div className="shrink-0 sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
                    aria-label="Book actions"
                  >
                    <MoreHorizontal className="size-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/books/${book.id}`}>Preview</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/books/${book.id}/edit`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setBookToDelete(book)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination && (
        <div className="mt-4 rounded-2xl border border-border bg-card">
          <AdminPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
          />
        </div>
      )}

      <DeleteConfirmDialog
        open={!!bookToDelete}
        onOpenChange={(open) => !open && setBookToDelete(null)}
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
      />

      <ManageCategoriesDialog
        open={manageCategoriesOpen}
        onOpenChange={setManageCategoriesOpen}
      />

      <ManageAuthorsDialog open={manageAuthorsOpen} onOpenChange={setManageAuthorsOpen} />
    </div>
  );
}
