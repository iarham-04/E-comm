export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
    ? 'https://corazonetouch-api.onrender.com'
    : 'https://corazonetouch-api.onrender.com');

export async function apiFetch<T = any>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_URL}${cleanPath}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}
