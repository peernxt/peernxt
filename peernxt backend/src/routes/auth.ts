import { Router } from 'express';
import { z } from 'zod';
import { asyncRoute } from '../utils/asyncRoute.js';
import { sendOTP, verifyOTP } from '../services/otpService.js';
import { sendMeetingLink } from '../services/notificationService.js';

const router = Router();

const sendOtpSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Must be a valid Indian mobile number with country code e.g. +919876543210'),
  email: z.string().email().optional(), // fallback delivery channel
});

const verifyOtpSchema = z.object({
  phone: z.string().min(1),
  otp: z.string().length(6),
});

router.post(
  '/send-otp',
  asyncRoute(async (req, res) => {
    const parsed = sendOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const { phone, email } = parsed.data;
    const { otp, maskedPhone } = await sendOTP(phone);

    // Deliver OTP — email fallback until WhatsApp Business API is approved
    if (email) {
      await sendMeetingLink({
        toEmail: email,
        meetLink: '',
        dateTime: '',
        title: `Your PeerNXT OTP: ${otp}`,
        recipientName: undefined,
      }).catch(() => {}); // non-fatal
    }

    // TODO: replace with WhatsApp Business API when approved
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[OTP] ${phone} → ${otp}`);
    }

    res.json({ maskedPhone, expiresIn: 300 });
  })
);

router.post(
  '/verify-otp',
  asyncRoute(async (req, res) => {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const { phone, otp } = parsed.data;
    await verifyOTP(phone, otp);
    res.json({ verified: true, phone });
  })
);

export default router;
