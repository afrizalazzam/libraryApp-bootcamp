import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { API_BASE_URL } from "./config";
import { useAppSelector } from "@/lib/redux/hooks";

export type LoanStatusFilter = "all" | "active" | "returned" | "overdue";

export type AdminLoanRow = {
  id: number;
  status: "BORROWED" | "RETURNED";
  displayStatus: "Active" | "Returned" | "Overdue";
  borrowedAt: string;
  dueAt: string;
  durationDays: number;
  returnedAt: string | null;
  book: {
    id: number;
    title: string;
    coverImage: string | null;
    category: { id: number; name: string };
    author: { id: number; name: string };
  };
  borrower: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
};

type LoansResult = {
  loans: AdminLoanRow[];
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

async function fetchAdminLoans(
  token: string,
  params: { q: string; status: LoanStatusFilter; page: number; limit: number }
): Promise<LoansResult> {
  const url = new URL(`${API_BASE_URL}/api/admin/loans`);
  url.searchParams.set("page", String(params.page));
  url.searchParams.set("limit", String(params.limit));
  url.searchParams.set("status", params.status);
  if (params.q) url.searchParams.set("q", params.q);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const body: ApiEnvelope<LoansResult> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to load borrowed list.");
  }

  return body.data;
}

export function useAdminLoansQuery(params: {
  q: string;
  status: LoanStatusFilter;
  page: number;
  limit: number;
}) {
  const token = useAppSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["admin-loans", params],
    queryFn: () => fetchAdminLoans(token as string, params),
    enabled: !!token,
    placeholderData: keepPreviousData,
  });
}
