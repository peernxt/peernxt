import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from '../config/supabase.js';

let _supabase: SupabaseClient | null = null;
export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) _supabase = getSupabase();
  return _supabase;
}
/** Lazy proxy: first use triggers getSupabase(); then forwards to real client */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const tables = {
  users: 'users',
  counselorMeetings: 'counselor_meetings',
  ambassadorSlots: 'ambassador_slots',
  ambassadorBookings: 'ambassador_bookings',
  chats: 'chats',
  chatMessages: 'chat_messages',
  events: 'events',
  eventRSVPs: 'event_rsvps',
} as const;

/** Map snake_case row from Supabase to camelCase for our types */
export function rowToCamel<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v;
  }
  return out;
}
