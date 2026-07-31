"use client";

import { useState, type FormEvent } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
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
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  type Category,
} from "@/lib/api/categories";
import { cn } from "@/lib/utils";

type ManageCategoriesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ManageCategoriesDialog({
  open,
  onOpenChange,
}: ManageCategoriesDialogProps) {
  const { showToast } = useToast();
  const { data, isLoading, isError, error } = useCategoriesQuery();
  const categories = data?.categories ?? [];

  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();

  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setCreateError(null);
    createMutation.mutate(name, {
      onSuccess: () => {
        setNewName("");
        showToast("Category added", "success");
      },
      onError: (err) =>
        setCreateError(err instanceof Error ? err.message : "Failed to add category."),
    });
  }

  function startEditing(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditError(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
    setEditError(null);
  }

  function handleUpdate(category: Category) {
    const name = editingName.trim();
    if (!name) return;

    setEditError(null);
    updateMutation.mutate(
      { id: category.id, name },
      {
        onSuccess: () => {
          cancelEditing();
          showToast("Category updated", "success");
        },
        onError: (err) =>
          setEditError(err instanceof Error ? err.message : "Failed to update category."),
      }
    );
  }

  function handleConfirmDelete() {
    if (!categoryToDelete) return;
    deleteMutation.mutate(categoryToDelete.id, {
      onSuccess: () => showToast("Category deleted", "success"),
      onError: (err) =>
        showToast(
          err instanceof Error ? err.message : "Failed to delete category.",
          "error"
        ),
      onSettled: () => setCategoryToDelete(null),
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>Add, rename, or remove book categories.</DialogDescription>

          <form onSubmit={handleCreate} className="mt-4 flex items-center gap-2">
            <Input
              value={newName}
              onChange={(event) => {
                setNewName(event.target.value);
                setCreateError(null);
              }}
              placeholder="New category name"
              className="h-10 rounded-xl px-4 text-base"
            />
            <Button
              type="submit"
              size="icon-lg"
              className="shrink-0 rounded-xl"
              disabled={createMutation.isPending || !newName.trim()}
              aria-label="Add category"
            >
              <Plus className="size-4" />
            </Button>
          </form>
          {createError && <p className="mt-2 text-sm text-destructive">{createError}</p>}

          <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-border">
            {isLoading ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Loading categories...
              </p>
            ) : isError ? (
              <p className="p-4 text-center text-sm text-destructive">
                {error instanceof Error ? error.message : "Failed to load categories."}
              </p>
            ) : categories.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No categories yet.
              </p>
            ) : (
              categories.map((category, index) => (
                <div
                  key={category.id}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5",
                    index > 0 && "border-t border-border"
                  )}
                >
                  {editingId === category.id ? (
                    <>
                      <Input
                        autoFocus
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        className="h-9 flex-1 rounded-lg px-3 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdate(category)}
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
                    </>
                  ) : (
                    <>
                      <span className="flex-1 truncate text-sm font-medium text-foreground">
                        {category.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEditing(category)}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={`Edit ${category.name}`}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoryToDelete(category)}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
                        aria-label={`Delete ${category.name}`}
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
        open={!!categoryToDelete}
        onOpenChange={(nextOpen) => !nextOpen && setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
        title="Delete Category"
      />
    </>
  );
}
