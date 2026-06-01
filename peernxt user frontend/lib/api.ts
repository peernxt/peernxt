import { supabase } from './supabase';
import { UserRole } from '../types';
import { appRoleFromBackendRole, backendRoleFromAppRole } from './roles';

/** Relative e.g. `/api/v1` uses Vite proxy → backend; absolute URL for production. */
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '/api/v1';

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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    signal: init.signal ?? controller.signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

const defaultProfileByRole = (role: UserRole) => {
  if (role === UserRole.COUNSELOR) {
    return {
      experienceYears: 1,
      countriesExpertise: [],
      agencyName: 'PeerNXT',
      bio: '',
      calendarAvailability: '',
    };
  }
  if (role === UserRole.PEER_AMBASSADOR) {
    return {
      universityName: '',
      country: '',
      course: '',
      bio: '',
      meetingAvailability: '',
    };
  }
  return {
    whatsappNumber: '',
    whatsappVerified: false,
    intake: '',
    preferredCountries: [],
    bio: '',
    location: '',
  };
};

export const toAppUser = (apiUser: any) => {
  const mappedRole = appRoleFromBackendRole(String(apiUser.role ?? 'student'));
  const profile = apiUser.profile ?? {};
  const hasStudentOnboarding =
    Array.isArray(profile.preferredCountries) &&
    profile.preferredCountries.length > 0 &&
    String(profile.location ?? '').trim().length > 0;

  return {
    id: String(apiUser.id),
    email: String(apiUser.email ?? ''),
    name: String(apiUser.displayName ?? apiUser.display_name ?? ''),
    role: mappedRole,
    profilePicture: apiUser.photoURL ?? apiUser.photo_url ?? undefined,
    onboardingCompleted: mappedRole === UserRole.STUDENT ? hasStudentOnboarding : true,
    googleCalendarConnected: true,
    profile,
  };
};

export async function bootstrapProfileForSession(roleHint: UserRole): Promise<any> {
  try {
    const me = await apiRequest<any>('/users/me');
    return toAppUser(me);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const lower = message.toLowerCase();
    const isMissingProfile =
      lower.includes('404') ||
      lower.includes('user profile not found') ||
      lower.includes('"error":"user profile not found"');
    if (!isMissingProfile) throw error;
  }

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) throw new Error('No Supabase user found');

  const created = await apiRequest<any>('/users/register', {
    method: 'POST',
    body: {
      role: backendRoleFromAppRole(roleHint),
      email: user.email ?? '',
      displayName: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'PeerNXT User',
      photoURL: user.user_metadata?.avatar_url,
      profile: defaultProfileByRole(roleHint),
    },
  });
  return toAppUser(created);
}

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

