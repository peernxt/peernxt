import { supabase, tables, rowToCamel } from '../lib/db.js';
import type { Chat, ChatMessage } from '../types/index.js';

const SYSTEM_SENDER_ID = '00000000-0000-0000-0000-000000000001';

export async function createChat(meetingId: string, participantIds: [string, string]): Promise<Chat> {
  const now = new Date().toISOString();
  const ids = [...participantIds].sort();
  const { data, error } = await supabase
    .from(tables.chats)
    .insert({
      type: 'counselor',
      meeting_id: meetingId,
      participant_ids: ids,
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single();
  if (error) throw error;
  return rowToCamel(data) as unknown as Chat;
}

export async function getChatById(chatId: string): Promise<Chat | null> {
  const { data, error } = await supabase
    .from(tables.chats)
    .select('*')
    .eq('id', chatId)
    .single();
  if (error || !data) return null;
  return rowToCamel(data) as unknown as Chat;
}

export async function getChatByMeetingId(meetingId: string): Promise<Chat | null> {
  const { data, error } = await supabase
    .from(tables.chats)
    .select('*')
    .eq('meeting_id', meetingId)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return rowToCamel(data) as unknown as Chat;
}

export async function getChatsForUser(userId: string): Promise<Chat[]> {
  const { data, error } = await supabase
    .from(tables.chats)
    .select('*')
    .contains('participant_ids', [userId])
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => rowToCamel(r) as unknown as Chat);
}

export async function addMessage(
  chatId: string,
  senderId: string,
  content: string,
  type: 'text' | 'system' = 'text',
  meetLink?: string
): Promise<ChatMessage> {
  const now = new Date().toISOString();
  const { data: msg, error: insertErr } = await supabase
    .from(tables.chatMessages)
    .insert({
      chat_id: chatId,
      sender_id: type === 'system' ? SYSTEM_SENDER_ID : senderId,
      content,
      type,
      meet_link: meetLink ?? null,
      created_at: now,
    })
    .select('*')
    .single();
  if (insertErr) throw insertErr;
  await supabase.from(tables.chats).update({ updated_at: now }).eq('id', chatId);
  return rowToCamel(msg) as unknown as ChatMessage;
}

export async function getMessages(chatId: string, limit = 100): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from(tables.chatMessages)
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => rowToCamel(r) as unknown as ChatMessage);
}
