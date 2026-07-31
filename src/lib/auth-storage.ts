import type { AuthUser } from "@/lib/redux/features/authSlice";

const TOKEN_KEY = "booky_token";
const USER_KEY = "booky_user";
const EXPIRES_AT_KEY = "booky_expires_at";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(EXPIRES_AT_KEY, String(Date.now() + SESSION_DURATION_MS));
}

export function loadSession(): { token: string; user: AuthUser } | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);
  const expiresAt = Number(localStorage.getItem(EXPIRES_AT_KEY));
  if (!token || !userRaw || !expiresAt) return null;

  if (Date.now() > expiresAt) {
    clearSession();
    return null;
  }

  try {
    return { token, user: JSON.parse(userRaw) as AuthUser };
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
}
