import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "./config";
import { useAppSelector } from "@/lib/redux/hooks";

export type CartItem = {
  id: number;
  bookId: number;
  addedAt: string;
  book: {
    id: number;
    title: string;
    coverImage: string | null;
    author: { id: number; name: string };
    category: { id: number; name: string };
  };
};

type CartResult = {
  cartId: number;
  items: CartItem[];
  itemCount: number;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data?: T;
};

async function fetchCart(token: string): Promise<CartResult> {
  const response = await fetch(`${API_BASE_URL}/api/cart`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body: ApiEnvelope<CartResult> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to load cart.");
  }

  return body.data;
}

export function useCartQuery() {
  const token = useAppSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["cart"],
    queryFn: () => fetchCart(token as string),
    enabled: !!token,
  });
}

async function addToCart(token: string, bookId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookId }),
  });

  const body: ApiEnvelope<unknown> = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message || "Failed to add to cart.");
  }
}

export function useAddToCartMutation() {
  const token = useAppSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: number) => addToCart(token as string, bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export type BorrowFromCartPayload = {
  itemIds: number[];
  days?: 3 | 5 | 10;
  borrowDate?: string;
};

async function borrowFromCart(
  token: string,
  payload: BorrowFromCartPayload
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/loans/from-cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const body: ApiEnvelope<unknown> = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message || "Failed to borrow books.");
  }
}

export function useBorrowFromCartMutation() {
  const token = useAppSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BorrowFromCartPayload) => borrowFromCart(token as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export type CheckoutItem = {
  id: number;
  bookId: number;
  book: {
    id: number;
    title: string;
    coverImage: string | null;
    author: { id: number; name: string };
    category: { id: number; name: string };
  };
};

type CheckoutResult = {
  user: {
    name: string;
    email: string;
    nomorHandphone: string;
  };
  items: CheckoutItem[];
  itemCount: number;
};

async function fetchCheckout(token: string): Promise<CheckoutResult> {
  const response = await fetch(`${API_BASE_URL}/api/cart/checkout`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body: ApiEnvelope<CheckoutResult> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Failed to load checkout.");
  }

  return body.data;
}

export function useCheckoutQuery() {
  const token = useAppSelector((state) => state.auth.token);

  return useQuery({
    queryKey: ["cart-checkout"],
    queryFn: () => fetchCheckout(token as string),
    enabled: !!token,
  });
}
