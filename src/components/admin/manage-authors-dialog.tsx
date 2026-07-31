"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { useToast } from "@/components/ui/toast";
import {
  useAuthorsQuery,
  useCreateAuthorMutation,
  useUpdateAuthorMutation,
  useDeleteAuthorMutation,
  type AuthorInfo,
} from "@/lib/api/authors";
import { cn } from "@/lib/utils";

type ManageAuthorsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ManageAuthorsDialog({ open, onOpenChange }: ManageAuthorsDialogProps) {
  const { showToast } = useToast();
  const { data, isLoading, isError, error } = useAuthorsQuery();

  const createMutation = useCreateAuthorMutation();
  const updateMutation = useUpdateAuthorMutation();
  const deleteMutation = useDeleteAuthorMutation();

  const [search, setSearch] = useState("");
  const filteredAuthors = useMemo(() => {
    const authors = data?.authors ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return authors;
    return authors.filter((author) => author.name.toLowerCase().includes(query));
  }, [data, search]);

  const [newName, setNewName] = useState("");
  const [newBio, setNewBio] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingBio, setEditingBio] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const [authorToDelete, setAuthorToDelete] = useState<AuthorInfo | null>(null);

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setCreateError(null);
    createMutation.mutate(
      { name, bio: newBio.trim() },
      {
        onSuccess: () => {
          setNewName("");
          setNewBio("");
          showToast("Author added", "success");
        },
        onError: (err) =>
          setCreateError(err instanceof Error ? err.message : "Failed to add author."),
      }
    );
  }

  function startEditing(author: AuthorInfo) {
    setEditingId(author.id);
    setEditingName(author.name);
    setEditingBio(author.bio ?? "");
    setEditError(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
    setEditingBio("");
    setEditError(null);
  }

  function handleUpdate(author: AuthorInfo) {
    const name = editingName.trim();
    if (!name) return;

    setEditError(null);
    updateMutation.mutate(
      { id: author.id, payload: { name, bio: editingBio.trim() } },
      {
        onSuccess: () => {
          cancelEditing();
          showToast("Author updated", "success");
        },
        onError: (err) =>
          setEditError(err instanceof Error ? err.message : "Failed to update author."),
      }
    );
  }

  function handleConfirmDelete() {
    if (!authorToDelete) return;
    deleteMutation.mutate(authorToDelete.id, {
      onSuccess: () => showToast("Author deleted", "success"),
      onError: (err) =>
        showToast(
          err instanceof Error ? err.message : "Failed to delete author.",
          "error"
        ),
      onSettled: () => setAuthorToDelete(null),
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Manage Authors</DialogTitle>
          <DialogDescription>Add, edit, or remove book authors.</DialogDescription>

          <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-2">
            <Input
              value={newName}
              onChange={(event) => {
                setNewName(event.target.value);
                setCreateError(null);
              }}
              placeholder="Author name"
              className="h-10 rounded-xl px-4 text-base"
            />
            <div className="flex items-center gap-2">
              <Input
                value={newBio}
                onChange={(event) => setNewBio(event.target.value)}
                placeholder="Bio (optional)"
                className="h-10 rounded-xl px-4 text-base"
              />
              <Button
                type="submit"
                size="icon-lg"
                className="shrink-0 rounded-xl"
                disabled={createMutation.isPending || !newName.trim()}
                aria-label="Add author"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </form>
          {createError && <p className="mt-2 text-sm text-destructive">{createError}</p>}

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search author"
              className="h-10 rounded-xl pl-9 text-base"
            />
          </div>

          <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-border">
            {isLoading ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Loading authors...
              </p>
            ) : isError ? (
              <p className="p-4 text-center text-sm text-destructive">
                {error instanceof Error ? error.message : "Failed to load authors."}
              </p>
            ) : filteredAuthors.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No authors found.
              </p>
            ) : (
              filteredAuthors.map((author, index) => (
                <div
                  key={author.id}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5",
                    index > 0 && "border-t border-border"
                  )}
                >
                  {editingId === author.id ? (
                    <div className="flex flex-1 flex-col gap-2">
                      <Input
                        autoFocus
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        className="h-9 rounded-lg px-3 text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingBio}
                          onChange={(event) => setEditingBio(event.target.value)}
                          placeholder="Bio (optional)"
                          className="h-9 flex-1 rounded-lg px-3 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdate(author)}
                          disabled={updateMutation.isPending}
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-success hover:bg-success/10"
                          aria-label="Save"
                        >
                          <Check className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                          aria-label="Cancel"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {author.name}
                        </p>
                        {author.bio && (
                          <p className="truncate text-xs text-muted-foreground">
                            {author.bio}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => startEditing(author)}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={`Edit ${author.name}`}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthorToDelete(author)}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
                        aria-label={`Delete ${author.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
          {editError && <p className="mt-2 text-sm text-destructive">{editError}</p>}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!authorToDelete}
        onOpenChange={(nextOpen) => !nextOpen && setAuthorToDelete(null)}
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
        title="Delete Author"
      />
    </>
  );
}
