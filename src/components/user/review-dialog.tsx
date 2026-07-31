"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCreateReviewMutation } from "@/lib/api/reviews";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function ReviewDialog({
  bookId,
  bookTitle,
  open,
  onOpenChange,
}: {
  bookId: number;
  bookTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { showToast } = useToast();
  const [star, setStar] = useState(0);
  const [comment, setComment] = useState("");
  const mutation = useCreateReviewMutation();

  function handleSubmit() {
    mutation.mutate(
      { bookId, star, comment },
      {
        onSuccess: () => {
          showToast("Review submitted.");
          onOpenChange(false);
          setStar(0);
          setComment("");
        },
        onError: (err) => showToast(err.message, "error"),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Give Review</DialogTitle>
        <DialogDescription className="sr-only">{bookTitle}</DialogDescription>

        <p className="mt-2 text-center text-sm font-medium text-foreground">Give Rating</p>
        <div className="mt-2 flex items-center justify-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStar(value)}
              aria-label={`${value} star`}
            >
              <Star
                className={cn(
                  "size-8",
                  value <= star ? "fill-warning text-warning" : "fill-muted text-muted"
                )}
              />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Please share your thoughts about this book"
          rows={5}
          className="mt-4 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-md text-foreground outline-none focus-visible:border-ring"
        />

        <Button
          size="lg"
          className="mt-4 w-full rounded-full"
          disabled={star === 0 || mutation.isPending}
          onClick={handleSubmit}
        >
          {mutation.isPending ? "Sending..." : "Send"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
