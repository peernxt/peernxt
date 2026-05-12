import { UserRole } from '../types';

export const backendRoleFromAppRole = (role: UserRole): 'student' | 'agent' | 'ambassador' => {
  if (role === UserRole.COUNSELOR) return 'agent';
  if (role === UserRole.PEER_AMBASSADOR) return 'ambassador';
  return 'student';
};

export const appRoleFromBackendRole = (role: string): UserRole => {
  if (role === 'agent') return UserRole.COUNSELOR;
  if (role === 'ambassador') return UserRole.PEER_AMBASSADOR;
  return UserRole.STUDENT;
};

