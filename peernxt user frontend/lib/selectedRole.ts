import { UserRole } from '../types';

/** Route / RootRoute use lowercase segments; never persist enum names like `STUDENT`. */
export type RoleRouteSegment = 'student' | 'counselor' | 'ambassador';

export function roleToRouteSegment(role: UserRole): RoleRouteSegment {
  if (role === UserRole.COUNSELOR) return 'counselor';
  if (role === UserRole.PEER_AMBASSADOR) return 'ambassador';
  return 'student';
}

/** Normalize legacy storage (`STUDENT`, `student`, etc.) to `UserRole`. */
export function parseStoredRole(raw: string | null): UserRole {
  if (!raw) return UserRole.STUDENT;
  const u = raw.trim();
  const lower = u.toLowerCase();
  if (lower === 'counselor' || u === UserRole.COUNSELOR) return UserRole.COUNSELOR;
  if (lower === 'ambassador' || lower === 'peer_ambassador' || u === UserRole.PEER_AMBASSADOR) {
    return UserRole.PEER_AMBASSADOR;
  }
  return UserRole.STUDENT;
}

export function persistSelectedRole(role: UserRole): void {
  localStorage.setItem('selectedRole', roleToRouteSegment(role));
}
