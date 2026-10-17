import { API_URL } from './api';

export type UserRole = 'CUSTOMER' | 'SUPPORT' | 'MANAGER' | 'OWNER';

export interface AdminUser {
  id: string;
  clerkId: string;
  email: string;
  name?: string | null;
  role: UserRole;
}

/** Current Clerk session JWT, or null when signed out / on the server. */
export async function getClerkSessionToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    return (await (window as any).Clerk?.session?.getToken()) ?? null;
  } catch {
    return null;
  }
}

/**
 * fetch() that attaches the Clerk session as a Bearer token when signed in.
 * Identity is derived server-side from the token only — never send user claims as headers.
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  const token = await getClerkSessionToken();
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}

export const adminFetch = authFetch;

/** Reads the API's error text from a failed response. */
export async function errorMessage(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  return body?.message || body?.error || fallback;
}

/** Validates current admin session against backend and returns verified role & profile. */
export async function getAdminProfile(): Promise<AdminUser | null> {
  try {
    const res = await adminFetch(`${API_URL}/admin/me`);
    return res.ok ? (await res.json())?.user ?? null : null;
  } catch {
    return null;
  }
}
