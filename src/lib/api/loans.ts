import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "./config";
import { useAppSelector } from "@/lib/redux/hooks";
import type { BookDetail } from "./books";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data?: T;
};

async function borrowBook(token: string, bookId: number, days: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/loans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookId, days }),
  });

  const body: ApiEnvelope<unknown> = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message || "Failed to borrow book.");
  }
}

export function useBorrowBookMutation() {
  const token = useAppSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, days = 7 }: { bookId: number; days?: number }) =>
      borrowBook(token as string, bookId, days),
    onMutate: async ({ bookId }) => {
      await queryClient.cancelQueries({ queryKey: ["book", bookId] });

      const previousBook = queryClient.getQueryData<BookDetail>(["book", bookId]);
      if (previousBook) {
        queryClient.setQueryData<BookDetail>(["book", bookId], {
          ...previousBook,
          availableCopies: Math.max(0, previousBook.availableCopies - 1),
          borrowCount: previousBook.borrowCount + 1,
        });
      }

      return { previousBook };
    },
    onError: (_err, { bookId }, context) => {
      if (context?.previousBook) {
        queryClient.setQueryData(["book", bookId], context.previousBook);
      }
    },
    onSettled: (_data, _err, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: ["book", bookId] });
    },
  });
}

export type LoanStatusFilter = "all" | "active" | "returned" | "overdue";

export type Loan = {
  id: number;
  status: string;
  displayStatus: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  durationDays: number;
  book: {
    id: number;
    title: string;
    coverImage: string | null;
    author: { id: number; name: string };
    category: { id: number; name: string };
  };
};

type MyLoansResult = {
  loans: Loan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

async function fetchMyLoans(
  token: string,
  params: { status: LoanStatusFilter; q: string; page: number }
): Promise<MyLoansResult> {
  const url = new URL(`${API_BASE_URL}/api/loans/my`);
  url.searchParams.set("status", params.status);
  url.searchParams.set("page", String(params.page));
  url.searchParams.set("limit", "10");
  if (params.q) url.searchParams.set("q", params.q);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body: ApiEnvelope<MyLoansResult> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to load borrowed list.");
  }

  return body.data;
}

export function useMyLoansQuery(params: { status: LoanStatusFilter; q: string }) {
  const token = useAppSelector((state) => state.auth.token);

  return useInfiniteQuery({
    queryKey: ["my-loans", params],
    queryFn: ({ pageParam }) => fetchMyLoans(token as string, { ...params, page: pageParam }),
    initialPageParam: 1,
    enabled: !!token,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
  });
}
