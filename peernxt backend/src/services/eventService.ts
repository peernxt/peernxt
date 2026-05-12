import { supabase, tables, rowToCamel } from '../lib/db.js';
import type { Event, EventRSVP } from '../types/index.js';

export interface CreateEventInput {
  agentId: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  locationType: 'online' | 'offline';
  locationDetails?: string;
  meetLink?: string;
  maxAttendees?: number;
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const now = new Date().toISOString();
  const row = {
    agent_id: input.agentId,
    title: input.title,
    description: input.description,
    start_at: input.startAt,
    end_at: input.endAt,
    location_type: input.locationType,
    location_details: input.locationDetails ?? null,
    meet_link: input.meetLink ?? null,
    max_attendees: input.maxAttendees ?? null,
    created_at: now,
    updated_at: now,
  };
  const { data, error } = await supabase.from(tables.events).insert(row).select('*').single();
  if (error) throw error;
  return rowToCamel(data) as unknown as Event;
}

export async function getEventById(eventId: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from(tables.events)
    .select('*')
    .eq('id', eventId)
    .single();
  if (error || !data) return null;
  return rowToCamel(data) as unknown as Event;
}

export async function getEventsByAgent(agentId: string, upcomingOnly = true): Promise<Event[]> {
  let q = supabase
    .from(tables.events)
    .select('*')
    .eq('agent_id', agentId)
    .order('start_at', { ascending: true });
  if (upcomingOnly) {
    q = q.gte('start_at', new Date().toISOString());
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r) => rowToCamel(r) as unknown as Event);
}

export async function listUpcomingEvents(limit = 50): Promise<Event[]> {
  const { data, error } = await supabase
    .from(tables.events)
    .select('*')
    .gte('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => rowToCamel(r) as unknown as Event);
}

export async function rsvpToEvent(eventId: string, studentId: string): Promise<EventRSVP> {
  const event = await getEventById(eventId);
  if (!event) {
    const err = new Error('Event not found') as Error & { statusCode: number };
    err.statusCode = 404;
    throw err;
  }
  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from(tables.eventRSVPs)
    .select('*')
    .eq('event_id', eventId)
    .eq('student_id', studentId)
    .maybeSingle();
  if (existing) {
    await supabase
      .from(tables.eventRSVPs)
      .update({ status: 'going', updated_at: now })
      .eq('id', (existing as { id: string }).id);
    return { id: (existing as { id: string }).id, ...rowToCamel(existing), status: 'going', updatedAt: now } as unknown as EventRSVP;
  }
  const rsvpRow = {
    event_id: eventId,
    student_id: studentId,
    status: 'going',
    created_at: now,
    updated_at: now,
  };
  const { data: rsvpData, error } = await supabase
    .from(tables.eventRSVPs)
    .insert(rsvpRow)
    .select('*')
    .single();
  if (error) throw error;
  return rowToCamel(rsvpData) as unknown as EventRSVP;
}

export async function cancelRsvp(eventId: string, studentId: string): Promise<void> {
  const { data } = await supabase
    .from(tables.eventRSVPs)
    .select('id')
    .eq('event_id', eventId)
    .eq('student_id', studentId)
    .maybeSingle();
  if (data) {
    await supabase
      .from(tables.eventRSVPs)
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', (data as { id: string }).id);
  }
}

export async function getRsvpsForEvent(eventId: string): Promise<EventRSVP[]> {
  const { data, error } = await supabase
    .from(tables.eventRSVPs)
    .select('*')
    .eq('event_id', eventId)
    .eq('status', 'going');
  if (error) throw error;
  return (data ?? []).map((r) => rowToCamel(r) as unknown as EventRSVP);
}

export async function getRsvpsForStudent(studentId: string): Promise<EventRSVP[]> {
  const { data, error } = await supabase
    .from(tables.eventRSVPs)
    .select('*')
    .eq('student_id', studentId)
    .eq('status', 'going')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => rowToCamel(r) as unknown as EventRSVP);
}
