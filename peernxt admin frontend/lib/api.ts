import { supabase } from './supabase';
import { UserRole } from '../types';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || 'http://localhost:4000/api/v1';

type ApiInit = Omit<RequestInit, 'headers' | 'body'> & {
  body?: unknown;
  headers?: Record<string, string>;
};

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token) throw new Error('No active Supabase session');
  return token;
}

export async function apiRequest<T>(path: string, init: ApiInit = {}): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const toAdminUser = (apiUser: any) => ({
  id: String(apiUser.id),
  name: String(apiUser.displayName ?? apiUser.display_name ?? apiUser.email ?? 'Admin'),
  email: String(apiUser.email ?? ''),
  role: UserRole.ADMIN,
});

export const parseApiError = (error: unknown): string => {
  if (!(error instanceof Error)) return 'Unknown error';
  try {
    const parsed = JSON.parse(error.message);
    if (parsed?.error) return String(parsed.error);
  } catch {
    return error.message;
  }
  return error.message;
};

