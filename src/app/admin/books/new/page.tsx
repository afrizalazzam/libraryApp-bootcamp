"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useCategoriesQuery } from "@/lib/api/categories";
import { useCreateBookMutation } from "@/lib/api/admin-books";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  compressCoverImage,
  mapServerError,
  type BookFormErrors,
} from "@/lib/admin/book-form";
import { cn } from "@/lib/utils";

export default function AdminAddBookPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categoriesData } = useCategoriesQuery();
  const categories = categoriesData?.categories ?? [];

  const createBookMutation = useCreateBookMutation();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pages, setPages] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<Blob | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<BookFormErrors>({});
  const [isDragging, setIsDragging] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Revoke the previous object URL whenever the preview changes or the
  // page unmounts, so we don't leak blob: URLs.
  useEffect(() => {
    return () => {
      if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
    };
  }, [coverImagePreview]);

  async function handleFile(file: File) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        coverImage: "Only PNG or JPG files are allowed.",
      }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        coverImage: "File size must be under 5mb.",
      }));
      return;
    }
    setErrors((prev) => ({ ...prev, coverImage: undefined }));
    try {
      const blob = await compressCoverImage(file);
      setCoverImage(blob);
      setCoverImagePreview(URL.createObjectURL(blob));
    } catch {
      setErrors((prev) => ({
        ...prev,
        coverImage: "Failed to process image. Try a different file.",
      }));
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  }

  function validate(): BookFormErrors {
    const nextErrors: BookFormErrors = {};
    if (!title.trim()) nextErrors.title = "Title is required.";
    if (!author.trim()) nextErrors.author = "Author is required.";
    if (!categoryId) nextErrors.categoryId = "Category is required.";
    if (!description.trim()) nextErrors.description = "Description is required.";
    if (!coverImage) nextErrors.coverImage = "Cover image is required.";
    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await createBookMutation.mutateAsync({
        title: title.trim(),
        // The API requires an ISBN but the design doesn't collect one, so
        // generate a placeholder the same way other admin-created books in
        // the live data already do (e.g. "AUTO-1783250293537").
        isbn: `AUTO-${Date.now()}`,
        categoryId: Number(categoryId),
        authorName: author.trim(),
        description: description.trim(),
        publishedYear: new Date().getFullYear(),
        coverImage,
      });

      showToast("Add Success", "success");
      router.push("/admin/books");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create book.";
      const { fieldErrors, generic } = mapServerError(message);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
      setSubmitError(generic.length > 0 ? generic.join(", ") : null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <Link
        href="/admin/books"
        className="inline-flex items-center gap-2 text-lg font-semibold text-foreground"
      >
        <ArrowLeft className="size-5" />
        Add Book
      </Link>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 flex max-w-md flex-col gap-6"
      >
        {submitError && (
          <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {submitError}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="title" className="text-sm font-semibold text-foreground">
            Title
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            aria-invalid={!!errors.title}
            className="h-11 rounded-xl px-4 text-base"
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="author" className="text-sm font-semibold text-foreground">
            Author
          </Label>
          <Input
            id="author"
            value={author}
            onChange={(event) => {
              setAuthor(event.target.value);
              setErrors((prev) => ({ ...prev, author: undefined }));
            }}
            aria-invalid={!!errors.author}
            className="h-11 rounded-xl px-4 text-base"
          />
          {errors.author && (
            <p className="text-sm text-destructive">{errors.author}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="category" className="text-sm font-semibold text-foreground">
            Category
          </Label>
          <div className="relative">
            <select
              id="category"
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value);
                setErrors((prev) => ({ ...prev, categoryId: undefined }));
              }}
              aria-invalid={!!errors.categoryId}
              className="h-11 w-full appearance-none rounded-xl border border-input bg-transparent px-4 pr-10 text-base font-medium text-black outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          {errors.categoryId && (
            <p className="text-sm text-destructive">{errors.categoryId}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="pages" className="text-sm font-semibold text-foreground">
            Number of Pages
          </Label>
          <Input
            id="pages"
            type="number"
            min={0}
            value={pages}
            onChange={(event) => setPages(event.target.value)}
            className="h-11 rounded-xl px-4 text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description" className="text-sm font-semibold text-foreground">
            Description
          </Label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            aria-invalid={!!errors.description}
            rows={4}
            className="w-full resize-none rounded-xl border border-input bg-transparent px-4 py-3 text-base font-medium text-black outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-semibold text-foreground">Cover Image</Label>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-6 text-center transition-colors",
              isDragging
                ? "border-primary bg-accent"
                : errors.coverImage
                  ? "border-destructive"
                  : "border-border"
            )}
          >
            {coverImagePreview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  className="h-32 w-auto rounded-lg object-contain"
                />
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-3.5" data-icon="inline-start" />
                    Change Image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setCoverImage(null);
                      setCoverImagePreview(null);
                    }}
                  >
                    <Trash2 className="size-3.5" data-icon="inline-start" />
                    Delete Image
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span className="flex size-9 items-center justify-center rounded-lg border border-border">
                  <Upload className="size-4 text-muted-foreground" />
                </span>
                <p className="text-sm text-foreground">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-medium text-primary hover:underline"
                  >
                    Click to upload
                  </button>{" "}
                  or drag and drop
                </p>
              </>
            )}
            <p className="text-sm text-muted-foreground">PNG or JPG (max. 5mb)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {errors.coverImage && (
            <p className="text-sm text-destructive">{errors.coverImage}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-13 rounded-full text-base"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </form>
    </div>
  );
}
