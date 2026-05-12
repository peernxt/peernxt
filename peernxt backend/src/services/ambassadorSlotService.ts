import { supabase, tables, rowToCamel } from '../lib/db.js';
import type { AmbassadorSlot, AmbassadorBooking } from '../types/index.js';
import { createGoogleMeetLink } from './googleMeetService.js';
import { sendMeetingLink } from './notificationService.js';
import { getUserById } from './userService.js';

const MAX_STUDENTS_PER_SLOT = 10;

export interface CreateAmbassadorSlotInput {
  ambassadorId: string;
  slotAt: string;
  durationMinutes?: number;
}

export async function createAmbassadorSlot(
  input: CreateAmbassadorSlotInput
): Promise<AmbassadorSlot> {
  const durationMinutes = input.durationMinutes ?? 60;
  const startAt = new Date(input.slotAt);

  const { meetLink } = await createGoogleMeetLink({
    summary: 'PeerNXT Ambassador Group Session',
    startAt,
    durationMinutes,
  });

  const now = new Date().toISOString();
  const slotRow = {
    ambassador_id: input.ambassadorId,
    slot_at: input.slotAt,
    duration_minutes: durationMinutes,
    max_students: MAX_STUDENTS_PER_SLOT,
    meet_link: meetLink,
    status: 'open',
    created_at: now,
    updated_at: now,
  };
  const { data, error } = await supabase
    .from(tables.ambassadorSlots)
    .insert(slotRow)
    .select('*')
    .single();
  if (error) throw error;
  return rowToCamel(data) as unknown as AmbassadorSlot;
}

export interface BookAmbassadorSlotInput {
  slotId: string;
  studentId: string;
  paymentId?: string;
  amountPaid?: number;
}

export async function bookAmbassadorSlot(
  input: BookAmbassadorSlotInput
): Promise<AmbassadorBooking> {
  const { data: slotData, error: slotErr } = await supabase
    .from(tables.ambassadorSlots)
    .select('*')
    .eq('id', input.slotId)
    .single();
  if (slotErr || !slotData) {
    const err = new Error('Slot not found') as Error & { statusCode: number };
    err.statusCode = 404;
    throw err;
  }
  const slot = rowToCamel(slotData) as unknown as AmbassadorSlot;
  if (slot.status !== 'open') {
    const err = new Error('Slot is not open for booking') as Error & { statusCode: number };
    err.statusCode = 400;
    throw err;
  }

  const { count } = await supabase
    .from(tables.ambassadorBookings)
    .select('*', { count: 'exact', head: true })
    .eq('slot_id', input.slotId)
    .eq('status', 'confirmed');
  if ((count ?? 0) >= slot.maxStudents) {
    const err = new Error('Slot is full') as Error & { statusCode: number };
    err.statusCode = 400;
    throw err;
  }

  const now = new Date().toISOString();
  const bookingRow = {
    slot_id: input.slotId,
    student_id: input.studentId,
    status: 'confirmed',
    payment_id: input.paymentId ?? null,
    amount_paid: input.amountPaid ?? null,
    created_at: now,
    updated_at: now,
  };
  const { data: bookingData, error: bookErr } = await supabase
    .from(tables.ambassadorBookings)
    .insert(bookingRow)
    .select('*')
    .single();
  if (bookErr) throw bookErr;
  const bookingId = (bookingData as { id: string }).id;

  if ((count ?? 0) + 1 >= slot.maxStudents) {
    await supabase
      .from(tables.ambassadorSlots)
      .update({ status: 'full', updated_at: now })
      .eq('id', input.slotId);
  }

  const dateTime = new Date(slot.slotAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });

  const student = await getUserById(input.studentId);
  const ambassador = await getUserById(slot.ambassadorId);
  const studentProfile = student?.profile as { whatsappNumber?: string } | undefined;
  const ambassadorProfile = ambassador?.profile as { whatsappNumber?: string } | undefined;

  await sendMeetingLink({
    toEmail: student?.email ?? '',
    toWhatsapp: studentProfile?.whatsappNumber,
    meetLink: slot.meetLink,
    dateTime,
    title: 'Ambassador Group Session',
    recipientName: student?.displayName ?? undefined,
  });
  await sendMeetingLink({
    toEmail: ambassador?.email ?? '',
    toWhatsapp: ambassadorProfile?.whatsappNumber,
    meetLink: slot.meetLink,
    dateTime,
    title: 'Ambassador Group Session',
    recipientName: ambassador?.displayName ?? undefined,
  });

  return { id: bookingId, ...rowToCamel(bookingData) } as unknown as AmbassadorBooking;
}

export async function getAmbassadorSlotById(slotId: string): Promise<AmbassadorSlot | null> {
  const { data, error } = await supabase
    .from(tables.ambassadorSlots)
    .select('*')
    .eq('id', slotId)
    .single();
  if (error || !data) return null;
  return rowToCamel(data) as unknown as AmbassadorSlot;
}

export async function getAmbassadorSlotsByAmbassador(
  ambassadorId: string,
  upcomingOnly = true
): Promise<AmbassadorSlot[]> {
  let q = supabase
    .from(tables.ambassadorSlots)
    .select('*')
    .eq('ambassador_id', ambassadorId)
    .order('slot_at', { ascending: true });
  if (upcomingOnly) {
    q = q.gte('slot_at', new Date().toISOString());
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r) => rowToCamel(r) as unknown as AmbassadorSlot);
}

export async function getOpenAmbassadorSlots(
  ambassadorId?: string,
  from?: string,
  to?: string
): Promise<AmbassadorSlot[]> {
  let q = supabase
    .from(tables.ambassadorSlots)
    .select('*')
    .eq('status', 'open')
    .order('slot_at', { ascending: true });
  if (ambassadorId) q = q.eq('ambassador_id', ambassadorId);
  const { data, error } = await q;
  if (error) throw error;
  let slots = (data ?? []).map((r) => rowToCamel(r) as unknown as AmbassadorSlot);
  if (from) slots = slots.filter((s) => s.slotAt >= from);
  if (to) slots = slots.filter((s) => s.slotAt <= to);
  return slots;
}

export async function getBookingsForSlot(slotId: string): Promise<AmbassadorBooking[]> {
  const { data, error } = await supabase
    .from(tables.ambassadorBookings)
    .select('*')
    .eq('slot_id', slotId)
    .eq('status', 'confirmed');
  if (error) throw error;
  return (data ?? []).map((r) => rowToCamel(r) as unknown as AmbassadorBooking);
}

export async function getBookingsForStudent(studentId: string): Promise<AmbassadorBooking[]> {
  const { data, error } = await supabase
    .from(tables.ambassadorBookings)
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => rowToCamel(r) as unknown as AmbassadorBooking);
}
