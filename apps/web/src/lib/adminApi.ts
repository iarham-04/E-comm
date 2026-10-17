import { API_URL } from './api';

export type UserRole = 'CUSTOMER' | 'SUPPORT' | 'MANAGER' | 'OWNER';

export interface AdminUser {
  id: string;
  clerkId: string;
  email: string;
  name?: string | null;
  role: UserRole;
}

export const ADMIN_SESSION_KEY = 'corazon_admin_session';

/**
 * Master-PIN session saved by /admin/login. The token is server-signed; the other fields are display-only
 * and never trusted — every request is re-verified server-side.
 */
export function getLocalAdminSession(): { token: string; name: string; expiresAt: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const session = JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY) || 'null');
    if (session?.token && session.expiresAt > Date.now()) return session;
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // corrupted or blocked storage
  }
  return null;
}

export function clearLocalAdminSession() {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {}
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

/** Admin endpoints served by this Next.js app's /api routes (direct DB); everything else goes to the NestJS API. */
const LOCAL_ADMIN_ROUTES = [
  /^\/admin\/(me|dashboard)$/,
  /^\/admin\/products(\/(?!bulk-stock$|reindex$)[^/]+)?$/,
  /^\/admin\/categories(\/[^/]+)?$/,
  /^\/uploads$/,
];

/**
 * Authenticated admin fetch: master-PIN token (in X-Admin-Token, so Clerk never parses it) if present,
 * else the Clerk session as a Bearer token.
 */
export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  const pinToken = getLocalAdminSession()?.token;
  const clerkToken = pinToken ? null : await getClerkSessionToken();
  if (pinToken) headers.set('X-Admin-Token', pinToken);
  else if (clerkToken && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${clerkToken}`);

  let target = input;
  if (typeof input === 'string' && input.startsWith(API_URL)) {
    const path = input.slice(API_URL.length);
    if (LOCAL_ADMIN_ROUTES.some((re) => re.test(path.split('?')[0]))) target = `/api${path}`;
  }
  return fetch(target, { ...init, headers });
}

/** Reads the API's error text from a failed response. */
export async function errorMessage(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  return body?.message || body?.error || fallback;
}

/** Validates the current admin session server-side and returns the verified role & profile. */
export async function getAdminProfile(): Promise<AdminUser | null> {
  try {
    const res = await adminFetch(`${API_URL}/admin/me`);
    if (res.status === 401) clearLocalAdminSession();
    return res.ok ? (await res.json())?.user ?? null : null;
  } catch {
    return null;
  }
}
