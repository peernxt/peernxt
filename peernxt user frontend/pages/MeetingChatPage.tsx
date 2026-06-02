import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, ExternalLink, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../App';
import { apiRequest, parseApiError } from '../lib/api';
import { UserRole } from '../types';

type MeetingRecord = {
  id: string;
  studentId: string;
  agentId: string;
  slotAt: string;
  durationMinutes: number;
  meetLink?: string;
  status: string;
  chatId?: string;
  callType?: string;
};

type ChatMessageRecord = {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'system';
  meetLink?: string;
  createdAt: string;
};

type DirectoryUser = {
  id: string;
  displayName?: string;
  display_name?: string;
  email?: string;
};

const POLL_MS = 5000;

const MeetingChatPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [meeting, setMeeting] = useState<MeetingRecord | null>(null);
  const [otherParticipant, setOtherParticipant] = useState<DirectoryUser | null>(null);
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const backPath = user?.role === UserRole.COUNSELOR ? '/counselor/meetings' : '/student/dashboard';

  const otherParticipantId = useMemo(() => {
    if (!meeting || !user?.id) return '';
    return meeting.studentId === user.id ? meeting.agentId : meeting.studentId;
  }, [meeting, user?.id]);

  const otherParticipantName = useMemo(() => {
    if (!otherParticipant) return user?.role === UserRole.COUNSELOR ? 'Student' : 'Counselor';
    return String(otherParticipant.displayName ?? otherParticipant.display_name ?? otherParticipant.email ?? 'Participant');
  }, [otherParticipant, user?.role]);

  const loadChat = useCallback(async () => {
    if (!meetingId) {
      setPageError('Missing meeting ID.');
      setIsLoading(false);
      return;
    }

    try {
      const meetingData = await apiRequest<MeetingRecord>(`/counselor-meetings/${meetingId}`);
      setMeeting(meetingData);

      if (!meetingData.chatId) {
        setMessages([]);
        setPageError('This meeting does not have an in-app chat yet.');
        return;
      }

      const requests: Promise<unknown>[] = [
        apiRequest<ChatMessageRecord[]>(`/chats/${meetingData.chatId}/messages`),
      ];

      const counterpartId = meetingData.studentId === user?.id ? meetingData.agentId : meetingData.studentId;
      if (counterpartId) {
        requests.push(apiRequest<DirectoryUser>(`/users/${counterpartId}`));
      }

      const [messageData, userData] = await Promise.all(requests);
      setMessages((messageData as ChatMessageRecord[]) ?? []);
      setOtherParticipant((userData as DirectoryUser | undefined) ?? null);
      setPageError(null);
    } catch (error) {
      setPageError(parseApiError(error));
    } finally {
      setIsLoading(false);
    }
  }, [meetingId, user?.id]);

  useEffect(() => {
    void loadChat();
    const intervalId = window.setInterval(() => {
      void loadChat();
    }, POLL_MS);

    return () => window.clearInterval(intervalId);
  }, [loadChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !meeting?.chatId) return;

    setIsSending(true);
    try {
      await apiRequest(`/chats/${meeting.chatId}/messages`, {
        method: 'POST',
        body: { content },
      });
      setDraft('');
      await loadChat();
    } catch (error) {
      setPageError(parseApiError(error));
    } finally {
      setIsSending(false);
    }
  };

  const title = user?.role === UserRole.COUNSELOR ? 'Student Chat' : 'Counselor Chat';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 md:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          {meeting?.meetLink ? (
            <a
              href={meeting.meetLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Join Meet
              <ExternalLink size={14} />
            </a>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{title}</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900">{otherParticipantName}</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Messages are tied to this booked counselor session.
                </p>
              </div>
              {meeting ? (
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    <Calendar size={14} />
                    {new Date(meeting.slotAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    <Clock size={14} />
                    {new Date(meeting.slotAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                    {meeting.callType ?? 'video'}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {pageError ? (
            <div className="mx-6 mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {pageError}
            </div>
          ) : null}

          <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
            {isLoading ? (
              <div className="flex h-full min-h-[320px] items-center justify-center text-sm font-medium text-slate-500">
                Loading chat...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
                <div className="rounded-full bg-white p-4 text-slate-400 shadow-sm">
                  <MessageSquare size={24} />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-700">No messages yet</p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Ask your {user?.role === UserRole.COUNSELOR ? 'student' : 'counselor'} a quick question or use the pinned Meet link.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isSystem = message.type === 'system';
                  const isOwn = !isSystem && message.senderId === user?.id;

                  if (isSystem) {
                    return (
                      <div key={message.id} className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
                        <p className="font-semibold">System</p>
                        <p className="mt-1">{message.content}</p>
                        {message.meetLink ? (
                          <a
                            href={message.meetLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-indigo-700 underline"
                          >
                            Open Meet link
                            <ExternalLink size={14} />
                          </a>
                        ) : null}
                      </div>
                    );
                  }

                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-3xl px-4 py-3 shadow-sm ${
                          isOwn
                            ? 'bg-indigo-600 text-white'
                            : 'border border-slate-200 bg-white text-slate-800'
                        }`}
                      >
                        <p className="text-sm leading-6">{message.content}</p>
                        <p className={`mt-2 text-[11px] ${isOwn ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="border-t border-slate-100 px-4 py-4 md:px-6">
            <div className="flex items-end gap-3">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={2}
                maxLength={2000}
                placeholder={`Message ${otherParticipantId ? otherParticipantName : 'your session chat'}...`}
                className="min-h-[56px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-colors focus:border-indigo-400 focus:bg-white"
              />
              <button
                type="submit"
                disabled={isSending || !draft.trim() || !meeting?.chatId}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                <Send size={16} />
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MeetingChatPage;
