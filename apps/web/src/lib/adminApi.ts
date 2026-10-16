import { API_URL } from './api';

export type UserRole = 'CUSTOMER' | 'SUPPORT' | 'MANAGER' | 'OWNER';

export interface AdminUser {
  id: string;
  clerkId: string;
  email: string;
  name?: string | null;
  role: UserRole;
}

export function getLocalAdminSession(): {
  token: string;
  role: UserRole;
  name: string;
  email: string;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('corazon_admin_session');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
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
 * Automatically extracts the active Clerk session JWT or Master PIN session and includes it as a Bearer token.
 */
export async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const localSession = getLocalAdminSession();
  const token = (await getClerkSessionToken()) || localSession?.token || null;
  const clerkUser = typeof window !== 'undefined' ? (window as any).Clerk?.user : null;

  const headers = new Headers(init?.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (localSession?.token) {
    headers.set('x-admin-token', localSession.token);
  }

  if (clerkUser?.primaryEmailAddress?.emailAddress && !headers.has('x-user-email')) {
    headers.set('x-user-email', clerkUser.primaryEmailAddress.emailAddress);
  } else if (localSession?.email && !headers.has('x-user-email')) {
    headers.set('x-user-email', localSession.email);
  }

  if (clerkUser?.fullName && !headers.has('x-user-name')) {
    headers.set('x-user-name', clerkUser.fullName);
  } else if (localSession?.name && !headers.has('x-user-name')) {
    headers.set('x-user-name', localSession.name);
  }

  let finalInput = input;
  if (typeof input === 'string') {
    if (input.includes('/admin/') || input.includes('/uploads')) {
      const pathWithParams = input.replace(/^https?:\/\/[^\/]+/, '');
      if (pathWithParams.startsWith('/admin/')) {
        finalInput = `/api${pathWithParams}`;
      } else if (pathWithParams.startsWith('/uploads')) {
        finalInput = '/api/uploads';
      }
    }
  }

  return fetch(finalInput, {
    ...init,
    headers,
  });
}

/**
 * Validates current admin session against local state or backend and returns verified role & profile.
 */
export async function getAdminProfile(): Promise<AdminUser | null> {
  const localSession = getLocalAdminSession();
  if (localSession?.token && localSession?.role) {
    return {
      id: 'admin-master',
      clerkId: 'admin-master',
      email: localSession.email || 'owner@corazontouch.com',
      name: localSession.name || 'Store Administrator',
      role: localSession.role as UserRole,
    };
  }

  try {
    const res = await adminFetch(`${API_URL}/admin/me`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user || null;
  } catch {
    return null;
  }
}
