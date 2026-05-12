import { google } from 'googleapis';
import { env } from '../config/env.js';

export interface CreateMeetingOptions {
  summary: string;
  startAt: Date;
  durationMinutes: number;
  attendeeEmails?: string[];
  /** 'video' = Google Meet (video); 'audio' = audio-only link (e.g. same Meet for voice, or dial-in). */
  callType?: 'audio' | 'video';
}

export interface CreateMeetingResult {
  meetLink: string;
  calendarEventId: string;
}

/**
 * Create a Google Calendar event with Google Meet conference data (video).
 * For callType 'audio', returns an audio-only meeting link (same Meet link; clients can join with mic only,
 * or use a dedicated audio link if we add e.g. dial-in / audio-only provider later).
 */
export async function createGoogleMeetLink(
  options: CreateMeetingOptions
): Promise<CreateMeetingResult> {
  const credPath = env.googleCalendar.credentialsPath;
  const callType = options.callType ?? 'video';
  const isAudio = callType === 'audio';

  if (!credPath) {
    const stubSuffix = isAudio ? 'audio' : 'video';
    const stubLink = `https://meet.google.com/peernxt-${stubSuffix}-${Date.now()}`;
    return {
      meetLink: stubLink,
      calendarEventId: `stub-${Date.now()}`,
    };
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: credPath,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    const calendar = google.calendar({ version: 'v3', auth });
    const endAt = new Date(options.startAt.getTime() + options.durationMinutes * 60 * 1000);

    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: options.summary + (isAudio ? ' (Audio call)' : ''),
        description: isAudio ? 'PeerNXT audio call – join with microphone only.' : 'PeerNXT meeting',
        start: {
          dateTime: options.startAt.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: endAt.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        conferenceData: {
          createRequest: {
            requestId: `peernxt-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        attendees: options.attendeeEmails?.map((e) => ({ email: e })) ?? [],
      },
      conferenceDataVersion: 1,
    });

    const meetLink =
      event.data.conferenceData?.entryPoints?.find((p) => p.entryPointType === 'video')
        ?.uri ??
      event.data.conferenceData?.entryPoints?.find((p) => p.entryPointType === 'phone')
        ?.uri ??
      event.data.htmlLink ??
      '';
    const calendarEventId = event.data.id ?? '';

    return { meetLink, calendarEventId };
  } catch (e) {
    console.error('Google Calendar/Meet error:', e);
    const fallback = `https://meet.google.com/peernxt-fallback-${Date.now()}`;
    return { meetLink: fallback, calendarEventId: `fallback-${Date.now()}` };
  }
}
