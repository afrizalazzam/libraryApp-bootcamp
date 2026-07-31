import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { API_BASE_URL } from "./config";
import { useAppSelector } from "@/lib/redux/hooks";
import type { AuthUser } from "@/lib/redux/features/authSlice";

export type AdminUserRow = AuthUser & {
  createdAt: string;
};

type UsersResult = {
  users: AdminUserRow[];
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

async function fetchAdminUsers(
  token: string,
  params: { q: string; page: number; limit: number }
): Promise<UsersResult> {
  const url = new URL(`${API_BASE_URL}/api/admin/users`);
  url.searchParams.set("page", String(params.page));
  url.searchParams.set("limit", String(params.limit));
  if (params.q) url.searchParams.set("q", params.q);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const body: ApiEnvelope<UsersResult> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to load users.");
  }

  return body.data;
}

export function useAdminUsersQuery(params: { q: string; page: number; limit: number }) {
  const token = useAppSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => fetchAdminUsers(token as string, params),
    enabled: !!token,
    placeholderData: keepPreviousData,
  });
}
