import { getRedis } from '../config/redis.js';

const OTP_TTL_SECONDS = 300;       // 5 minutes
const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 1800;      // 30 minutes after 3 failed attempts
const MAX_SEND_PER_WINDOW = 3;
const SEND_WINDOW_SECONDS = 600;   // max 3 sends per 10 minutes

function otpKey(phone: string) { return `otp:${phone}`; }
function attemptsKey(phone: string) { return `otp_attempts:${phone}`; }
function sendCountKey(phone: string) { return `otp_sends:${phone}`; }

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export interface SendOTPResult {
  otp: string;       // caller sends this via WhatsApp/email
  maskedPhone: string;
}

export async function sendOTP(phone: string): Promise<SendOTPResult> {
  const redis = getRedis();

  // Rate limit: max 3 sends per 10 min
  const sends = await redis.incr(sendCountKey(phone));
  if (sends === 1) await redis.expire(sendCountKey(phone), SEND_WINDOW_SECONDS);
  if (sends > MAX_SEND_PER_WINDOW) {
    const err = new Error('Too many OTP requests. Try again in 10 minutes.') as Error & { statusCode: number };
    err.statusCode = 429;
    throw err;
  }

  const otp = generateOTP();
  await redis.set(otpKey(phone), otp, { ex: OTP_TTL_SECONDS });
  await redis.del(attemptsKey(phone)); // reset failed attempts on new OTP

  const masked = phone.slice(0, 3) + '****' + phone.slice(-3);
  return { otp, maskedPhone: masked };
}

export async function verifyOTP(phone: string, inputOtp: string): Promise<boolean> {
  const redis = getRedis();

  const attempts = Number((await redis.get(attemptsKey(phone))) ?? 0);
  if (attempts >= MAX_ATTEMPTS) {
    const err = new Error('Too many failed attempts. Try again in 30 minutes.') as Error & { statusCode: number };
    err.statusCode = 429;
    throw err;
  }

  const stored = await redis.get<string>(otpKey(phone));
  if (!stored) {
    const err = new Error('OTP expired or not found. Request a new one.') as Error & { statusCode: number };
    err.statusCode = 400;
    throw err;
  }

  if (stored !== inputOtp) {
    const newAttempts = await redis.incr(attemptsKey(phone));
    if (newAttempts >= MAX_ATTEMPTS) {
      await redis.expire(attemptsKey(phone), LOCKOUT_SECONDS);
    }
    const err = new Error('Invalid OTP.') as Error & { statusCode: number };
    err.statusCode = 400;
    throw err;
  }

  // Valid — clean up
  await redis.del(otpKey(phone));
  await redis.del(attemptsKey(phone));
  return true;
}
