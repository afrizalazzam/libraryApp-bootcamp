import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { API_BASE_URL } from "./config";
import { useAppSelector } from "@/lib/redux/hooks";

export type BookStatusFilter = "all" | "available" | "borrowed" | "returned";

export type AdminBookRow = {
  id: number;
  title: string;
  description: string | null;
  isbn: string;
  publishedYear: number;
  coverImage: string | null;
  rating: number;
  reviewCount: number;
  totalCopies: number;
  availableCopies: number;
  borrowCount: number;
  author: { id: number; name: string };
  category: { id: number; name: string };
};

type BooksResult = {
  books: AdminBookRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data?: T;
};

async function fetchAdminBooks(
  token: string,
  params: { q: string; status: BookStatusFilter; page: number; limit: number }
): Promise<BooksResult> {
  const url = new URL(`${API_BASE_URL}/api/admin/books`);
  url.searchParams.set("page", String(params.page));
  url.searchParams.set("limit", String(params.limit));
  url.searchParams.set("status", params.status);
  if (params.q) url.searchParams.set("q", params.q);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const body: ApiEnvelope<BooksResult> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to load books.");
  }

  return body.data;
}

export function useAdminBooksQuery(params: {
  q: string;
  status: BookStatusFilter;
  page: number;
  limit: number;
}) {
  const token = useAppSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["admin-books", params],
    queryFn: () => fetchAdminBooks(token as string, params),
    enabled: !!token,
    placeholderData: keepPreviousData,
  });
}

async function fetchBookById(id: number): Promise<AdminBookRow> {
  const response = await fetch(`${API_BASE_URL}/api/books/${id}`);
  const body: ApiEnvelope<AdminBookRow> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to load book.");
  }

  return body.data;
}

export function useAdminBookQuery(id: number) {
  return useQuery({
    queryKey: ["admin-book", id],
    queryFn: () => fetchBookById(id),
    enabled: Number.isFinite(id),
  });
}

export type CreateBookPayload = {
  title: string;
  isbn: string;
  categoryId: number;
  authorName: string;
  description?: string;
  publishedYear?: number;
  coverImage?: Blob | null;
};

// POST /api/books expects multipart/form-data (a real file for coverImage).
async function createBook(
  token: string,
  payload: CreateBookPayload
): Promise<AdminBookRow> {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("isbn", payload.isbn);
  formData.append("categoryId", String(payload.categoryId));
  formData.append("authorName", payload.authorName);
  if (payload.description) formData.append("description", payload.description);
  if (payload.publishedYear != null) {
    formData.append("publishedYear", String(payload.publishedYear));
  }
  if (payload.coverImage) {
    formData.append("coverImage", payload.coverImage, "cover.jpg");
  }

  const response = await fetch(`${API_BASE_URL}/api/books`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const body: ApiEnvelope<AdminBookRow> = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message || "Failed to create book.");
  }

  return body.data as AdminBookRow;
}

export function useCreateBookMutation() {
  const token = useAppSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookPayload) => createBook(token as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
    },
  });
}

export type UpdateBookPayload = {
  title: string;
  isbn: string;
  categoryId: number;
  authorName: string;
  description?: string;
  publishedYear?: number;
  // A base64 data: URL to replace the cover, null to clear it, or omit
  // (undefined) to leave the existing cover untouched — this endpoint
  // takes JSON, not a file upload.
  coverImage?: string | null;
};

// Unlike POST, PUT /api/books/{id} expects a plain application/json body,
// with coverImage (when present) as a base64 string rather than a file.
async function updateBook(
  token: string,
  id: number,
  payload: UpdateBookPayload
): Promise<AdminBookRow> {
  const response = await fetch(`${API_BASE_URL}/api/books/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const body: ApiEnvelope<AdminBookRow> = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message || "Failed to update book.");
  }

  return body.data as AdminBookRow;
}

export function useUpdateBookMutation() {
  const token = useAppSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateBookPayload }) =>
      updateBook(token as string, id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      queryClient.invalidateQueries({ queryKey: ["admin-book", variables.id] });
    },
  });
}

async function deleteBook(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/books/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const body: ApiEnvelope<unknown> = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message || "Failed to delete book.");
  }
}

export function useDeleteBookMutation() {
  const token = useAppSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteBook(token as string, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
    },
  });
}
