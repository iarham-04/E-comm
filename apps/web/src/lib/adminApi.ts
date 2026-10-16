import { API_URL } from './api';

export type UserRole = 'CUSTOMER' | 'SUPPORT' | 'MANAGER' | 'OWNER';

export interface AdminUser {
  id: string;
  clerkId: string;
  email: string;
  name?: string | null;
  role: UserRole;
}

/**
 * Safely retrieve the current Clerk session JWT token from the client SDK.
 */
export async function getClerkSessionToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const clerk = (window as any).Clerk;
    if (clerk?.session) {
      const token = await clerk.session.getToken();
      return token;
    }
  } catch (err) {
    console.warn('Failed to retrieve Clerk session token:', err);
  }

  return null;
}

/**
 * Authenticated fetch helper for administrative API requests.
 * Automatically extracts the active Clerk session JWT and includes it as Authorization.
 */
export async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const token = await getClerkSessionToken();
  const clerkUser = typeof window !== 'undefined' ? (window as any).Clerk?.user : null;

  const headers = new Headers(init?.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `******;
  }

  if (clerkUser?.primaryEmailAddress?.emailAddress && !headers.has('x-user-email')) {
    headers.set('x-user-email', clerkUser.primaryEmailAddress.emailAddress);
  }

  if (clerkUser?.fullName && !headers.has('x-user-name')) {
    headers.set('x-user-name', clerkUser.fullName);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

/**
 * Validates current admin session against backend and returns verified role & profile.
 */
export async function getAdminProfile(): Promise<AdminUser | null> {
  try {
    const res = await adminFetch(`${API_URL}/admin/me`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user || null;
  } catch {
    return null;
  }
}
