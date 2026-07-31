import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "./config";
import { useAppSelector } from "@/lib/redux/hooks";

export type Review = {
  id: number;
  star: number;
  comment: string;
  createdAt: string;
  user: { id: number; name: string };
};

type ReviewsResult = {
  bookId: number;
  reviews: Review[];
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

async function fetchReviews(bookId: number, page: number): Promise<ReviewsResult> {
  const url = new URL(`${API_BASE_URL}/api/reviews/book/${bookId}`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", "6");

  const response = await fetch(url);
  const body: ApiEnvelope<ReviewsResult> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to load reviews.");
  }

  return body.data;
}

export function useReviewsQuery(bookId: number) {
  return useInfiniteQuery({
    queryKey: ["reviews", bookId],
    queryFn: ({ pageParam }) => fetchReviews(bookId, pageParam),
    initialPageParam: 1,
    enabled: Number.isFinite(bookId),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
  });
}

type CreateReviewPayload = {
  bookId: number;
  star: number;
  comment: string;
};

async function createReview(token: string, payload: CreateReviewPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const body: ApiEnvelope<unknown> = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message || "Failed to submit review.");
  }
}

export function useCreateReviewMutation() {
  const token = useAppSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createReview(token as string, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ["book", variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["my-reviews-all"] });
    },
  });
}

export type MyReview = {
  id: number;
  star: number;
  comment: string;
  createdAt: string;
  book: {
    id: number;
    title: string;
    coverImage: string | null;
    author: { id: number; name: string };
    category: { id: number; name: string };
  };
};

type MyReviewsResult = {
  reviews: MyReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

async function fetchMyReviews(
  token: string,
  params: { q: string; page: number }
): Promise<MyReviewsResult> {
  const url = new URL(`${API_BASE_URL}/api/me/reviews`);
  url.searchParams.set("page", String(params.page));
  url.searchParams.set("limit", "10");
  if (params.q) url.searchParams.set("q", params.q);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body: ApiEnvelope<MyReviewsResult> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to load your reviews.");
  }

  return body.data;
}

export function useMyReviewsQuery(params: { q: string }) {
  const token = useAppSelector((state) => state.auth.token);

  return useInfiniteQuery({
    queryKey: ["my-reviews", params],
    queryFn: ({ pageParam }) => fetchMyReviews(token as string, { ...params, page: pageParam }),
    initialPageParam: 1,
    enabled: !!token,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
  });
}

async function fetchAllMyReviews(token: string): Promise<MyReview[]> {
  const url = new URL(`${API_BASE_URL}/api/me/reviews`);
  url.searchParams.set("page", "1");
  url.searchParams.set("limit", "50");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body: ApiEnvelope<MyReviewsResult> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to load your reviews.");
  }

  return body.data.reviews;
}

// Used where we just need to know *which* books the current user has
// already reviewed (e.g. Borrowed List), not a paginated feed.
export function useAllMyReviewsQuery() {
  const token = useAppSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["my-reviews-all"],
    queryFn: () => fetchAllMyReviews(token as string),
    enabled: !!token,
  });
}
