import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "./config";
import { useAppSelector } from "@/lib/redux/hooks";
import type { RecommendedBook } from "./books";

export type PopularAuthor = {
  id: number;
  name: string;
  bio: string | null;
  bookCount: number;
  accumulatedScore: number;
};

type PopularAuthorsResult = {
  authors: PopularAuthor[];
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data?: T;
};

async function fetchPopularAuthors(limit: number): Promise<PopularAuthorsResult> {
  const url = new URL(`${API_BASE_URL}/api/authors/popular`);
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url);
  const body: ApiEnvelope<PopularAuthorsResult> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to load popular authors.");
  }

  return body.data;
}

export function usePopularAuthorsQuery(limit = 4) {
  return useQuery({
    queryKey: ["popular-authors", limit],
    queryFn: () => fetchPopularAuthors(limit),
  });
}

export type AuthorInfo = {
  id: number;
  name: string;
  bio: string | null;
};

type AuthorsResult = {
  authors: AuthorInfo[];
};

async function fetchAuthors(): Promise<AuthorsResult> {
  const response = await fetch(`${API_BASE_URL}/api/authors`);
  const body: ApiEnvelope<AuthorsResult> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to load authors.");
  }

  return body.data;
}

export function useAuthorsQuery() {
  return useQuery({
    queryKey: ["authors"],
    queryFn: fetchAuthors,
  });
}

type AuthorPayload = {
  name: string;
  bio: string;
};

async function createAuthor(token: string, payload: AuthorPayload): Promise<AuthorInfo> {
  const response = await fetch(`${API_BASE_URL}/api/authors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const body: ApiEnvelope<AuthorInfo> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to create author.");
  }

  return body.data;
}

export function useCreateAuthorMutation() {
  const token = useAppSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AuthorPayload) => createAuthor(token as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
  });
}

async function updateAuthor(
  token: string,
  id: number,
  payload: AuthorPayload
): Promise<AuthorInfo> {
  const response = await fetch(`${API_BASE_URL}/api/authors/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const body: ApiEnvelope<AuthorInfo> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to update author.");
  }

  return body.data;
}

export function useUpdateAuthorMutation() {
  const token = useAppSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AuthorPayload }) =>
      updateAuthor(token as string, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
  });
}

async function deleteAuthor(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/authors/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const body: ApiEnvelope<unknown> = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message || "Failed to delete author.");
  }
}

export function useDeleteAuthorMutation() {
  const token = useAppSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAuthor(token as string, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
  });
}

type AuthorBooksResult = {
  author: AuthorInfo;
  bookCount: number;
  books: RecommendedBook[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

async function fetchAuthorBooks(authorId: number, page: number): Promise<AuthorBooksResult> {
  const url = new URL(`${API_BASE_URL}/api/authors/${authorId}/books`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", "10");

  const response = await fetch(url);
  const body: ApiEnvelope<AuthorBooksResult> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to load author.");
  }

  return body.data;
}

export function useAuthorBooksQuery(authorId: number) {
  return useInfiniteQuery({
    queryKey: ["author-books", authorId],
    queryFn: ({ pageParam }) => fetchAuthorBooks(authorId, pageParam),
    initialPageParam: 1,
    enabled: Number.isFinite(authorId),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
  });
}
