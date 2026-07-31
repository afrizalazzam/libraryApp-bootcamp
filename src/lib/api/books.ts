import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "./config";

export type RecommendedBook = {
  id: number;
  title: string;
  rating: number;
  author: { id: number; name: string };
};

export type BookDetail = {
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

type RecommendResult = {
  books: RecommendedBook[];
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

async function fetchRecommendedBooks(page: number): Promise<RecommendResult> {
  const url = new URL(`${API_BASE_URL}/api/books/recommend`);
  url.searchParams.set("by", "rating");
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", "10");

  const response = await fetch(url);
  const body: ApiEnvelope<RecommendResult> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to load recommendations.");
  }

  return body.data;
}

export function useRecommendedBooksQuery() {
  return useInfiniteQuery({
    queryKey: ["recommended-books"],
    queryFn: ({ pageParam }) => fetchRecommendedBooks(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
  });
}

async function fetchBookById(id: number): Promise<BookDetail> {
  const response = await fetch(`${API_BASE_URL}/api/books/${id}`);
  const body: ApiEnvelope<BookDetail> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to load book.");
  }

  return body.data;
}

export function useBookQuery(id: number) {
  return useQuery({
    queryKey: ["book", id],
    queryFn: () => fetchBookById(id),
    enabled: Number.isFinite(id),
  });
}

export type BookListFilters = {
  categoryId?: number;
  minRating?: number;
  q?: string;
};

async function fetchBooks(
  filters: BookListFilters,
  page: number
): Promise<RecommendResult> {
  const url = new URL(`${API_BASE_URL}/api/books`);
  url.searchParams.set("page", String(page));
  if (filters.q) url.searchParams.set("q", filters.q);
  if (filters.categoryId) url.searchParams.set("categoryId", String(filters.categoryId));
  if (filters.minRating) {
    url.searchParams.set("minRating", String(filters.minRating));
    // The bucket filter below needs the full "rating >= minRating" set to
    // find matches, not just whatever lands on a 12-item page in the API's
    // default (non-rating) order — so fetch the max page size instead.
    url.searchParams.set("limit", "50");
  } else {
    url.searchParams.set("limit", "12");
  }

  const response = await fetch(url);
  const body: ApiEnvelope<RecommendResult> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to load books.");
  }

  // The API only supports "rating >= minRating". The rating star filter
  // is meant as an exact bucket (e.g. 4 stars = 4.0-4.99), so narrow the
  // upper bound client-side on top of the server-side minimum.
  if (filters.minRating) {
    const upperBound = filters.minRating + 1;
    return {
      ...body.data,
      books: body.data.books.filter((book) => book.rating < upperBound),
    };
  }

  return body.data;
}

export function useBooksQuery(filters: BookListFilters) {
  return useInfiniteQuery({
    queryKey: ["books", filters],
    queryFn: ({ pageParam }) => fetchBooks(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
  });
}

export function useRelatedBooksQuery(categoryId: number, excludeBookId: number) {
  return useQuery({
    queryKey: ["related-books", categoryId, excludeBookId],
    queryFn: () => fetchBooks({ categoryId }, 1),
    enabled: Number.isFinite(categoryId),
    select: (result) =>
      result.books.filter((book) => book.id !== excludeBookId).slice(0, 5),
  });
}
