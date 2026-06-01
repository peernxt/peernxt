import { supabase, tables, rowToCamel, IST } from '../lib/db.js';
import type { CounselorMeeting } from '../types/index.js';
import { createGoogleMeetLink } from './googleMeetService.js';
import { createChat, addMessage } from './chatService.js';

export interface BookCounselorMeetingInput {
  studentId: string;
  agentId: string;
  slotAt: string;
  durationMinutes?: number;
  callType?: 'audio' | 'video';
}

export async function bookCounselorMeeting(
  input: BookCounselorMeetingInput
): Promise<CounselorMeeting> {
  const durationMinutes = input.durationMinutes ?? 30;
  const callType = input.callType ?? 'video';
  const startAt = new Date(input.slotAt);

  const { meetLink } = await createGoogleMeetLink({
    summary: 'PeerNXT Counselor Session',
    startAt,
    durationMinutes,
    callType,
  });

  const now = new Date().toISOString();
  const meetingRow = {
    type: 'counselor',
    call_type: callType,
    student_id: input.studentId,
    agent_id: input.agentId,
    slot_at: input.slotAt,
    duration_minutes: durationMinutes,
    meet_link: meetLink,
    status: 'scheduled',
    chat_id: null as string | null,
    created_at: now,
    updated_at: now,
  };
  const { data: meetingData, error: meetingErr } = await supabase
    .from(tables.counselorMeetings)
    .insert(meetingRow)
    .select('*')
    .single();
  if (meetingErr) throw meetingErr;
  const meetingId = (meetingData as { id: string }).id;

  const chat = await createChat(meetingId, [input.studentId, input.agentId]);
  await supabase
    .from(tables.counselorMeetings)
    .update({ chat_id: chat.id, updated_at: new Date().toISOString() })
    .eq('id', meetingId);

  const callLabel = callType === 'audio' ? 'Audio call' : 'Video call';
  await addMessage(
    chat.id,
    'system',
    `${callLabel} link for ${new Date(input.slotAt).toLocaleString('en-IN', { timeZone: IST })}: ${meetLink}`,
    'system',
    meetLink
  );

  return {
    id: meetingId,
    ...rowToCamel(meetingData) as object,
    chatId: chat.id,
  } as CounselorMeeting;
}

export async function getCounselorMeetingById(meetingId: string): Promise<CounselorMeeting | null> {
  const { data, error } = await supabase
    .from(tables.counselorMeetings)
    .select('*')
    .eq('id', meetingId)
    .single();
  if (error || !data) return null;
  return rowToCamel(data) as unknown as CounselorMeeting;
}

export async function getCounselorMeetingsForUser(userId: string): Promise<CounselorMeeting[]> {
  const { data: asStudent } = await supabase
    .from(tables.counselorMeetings)
    .select('*')
    .eq('student_id', userId);
  const { data: asAgent } = await supabase
    .from(tables.counselorMeetings)
    .select('*')
    .eq('agent_id', userId);
  const byId = new Map<string, CounselorMeeting>();
  [...(asStudent ?? []), ...(asAgent ?? [])].forEach((r) => {
    const row = rowToCamel(r) as unknown as CounselorMeeting;
    byId.set(row.id, row);
  });
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.slotAt).getTime() - new Date(a.slotAt).getTime()
  );
}
