import { supabase, tables, rowToCamel } from '../lib/db.js';
import type { User, UserRole } from '../types/index.js';

export async function getUserById(uid: string): Promise<User | null> {
  const { data, error } = await supabase
    .from(tables.users)
    .select('*')
    .eq('id', uid)
    .single();
  if (error || !data) return null;
  return rowToCamel(data) as unknown as User;
}

export async function getUserRole(uid: string): Promise<UserRole | null> {
  const user = await getUserById(uid);
  return user?.role ?? null;
}

export async function setUserRole(uid: string, role: UserRole): Promise<void> {
  await supabase
    .from(tables.users)
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', uid);
}
