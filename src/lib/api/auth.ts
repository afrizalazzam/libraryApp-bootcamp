import { useMutation } from "@tanstack/react-query";
import { API_BASE_URL } from "./config";
import type { AuthUser } from "@/lib/redux/features/authSlice";

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResult = {
  token: string;
  user: AuthUser;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data?: T;
};

async function login(payload: LoginPayload): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body: ApiEnvelope<LoginResult> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Invalid email or password.");
  }

  return body.data;
}

export function useLoginMutation() {
  return useMutation({ mutationFn: login });
}

type RegisterPayload = {
  name: string;
  email: string;
  phone?: string;
  password: string;
};

type RegisterResult = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  profilePhoto: string | null;
  role: "ADMIN" | "USER";
};

async function register(payload: RegisterPayload): Promise<RegisterResult> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body: ApiEnvelope<RegisterResult> = await response.json();

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Registration failed.");
  }

  return body.data;
}

export function useRegisterMutation() {
  return useMutation({ mutationFn: register });
}
