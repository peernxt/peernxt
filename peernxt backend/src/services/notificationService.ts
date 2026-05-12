import { env } from '../config/env.js';

export interface SendMeetingLinkOptions {
  toEmail: string;
  toWhatsapp?: string;
  meetLink: string;
  dateTime: string; // human-readable e.g. "28 Feb 2026, 3:00 PM IST"
  title?: string;
  recipientName?: string;
}

/**
 * Send meeting link via email and optionally WhatsApp.
 * Email: uses Resend or SMTP. WhatsApp: stub until you integrate Twilio/WhatsApp Business API.
 */
export async function sendMeetingLink(options: SendMeetingLinkOptions): Promise<void> {
  const { toEmail, toWhatsapp, meetLink, dateTime, title, recipientName } = options;
  const subject = title ? `PeerNXT: ${title} - ${dateTime}` : `Your meeting link - ${dateTime}`;
  const body = `
Hi${recipientName ? ` ${recipientName}` : ''},

Your session is scheduled for ${dateTime}.

Join here: ${meetLink}

— PeerNXT
  `.trim();

  await sendEmail({ to: toEmail, subject, body });

  if (toWhatsapp && env.whatsapp.apiUrl && env.whatsapp.apiKey) {
    await sendWhatsApp(toWhatsapp, `PeerNXT: Your session is on ${dateTime}. Join: ${meetLink}`);
  }
}

async function sendEmail(params: { to: string; subject: string; body: string }): Promise<void> {
  const { resendApiKey, smtp, from, provider } = env.email;
  if (provider === 'resend' && resendApiKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: params.subject,
        text: params.body,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error('Resend error:', t);
    }
    return;
  }
  if (smtp.host && smtp.user && smtp.pass) {
    // Optional: use nodemailer for SMTP
    console.log('[Email stub] Would send to', params.to, params.subject);
    return;
  }
  console.log('[Email stub] No provider configured. Would send:', params.to, params.subject);
}

async function sendWhatsApp(phone: string, message: string): Promise<void> {
  if (!env.whatsapp.apiUrl) {
    console.log('[WhatsApp stub] Would send to', phone, message);
    return;
  }
  try {
    const res = await fetch(env.whatsapp.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.whatsapp.apiKey}`,
      },
      body: JSON.stringify({ to: phone.replace(/\D/g, ''), message }),
    });
    if (!res.ok) console.error('WhatsApp API error:', await res.text());
  } catch (e) {
    console.error('WhatsApp send error:', e);
  }
}
