import { config } from 'dotenv';

config();

const get = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) throw new Error(`Missing env: ${key}`);
  return value;
};

const getOptional = (key: string, defaultValue?: string): string | undefined =>
  process.env[key] ?? defaultValue;

export const env = {
  nodeEnv: getOptional('NODE_ENV', 'development'),
  port: parseInt(getOptional('PORT', '4000') ?? '4000', 10),
  apiPrefix: getOptional('API_PREFIX', '/api/v1'),
  frontendUrl: getOptional('FRONTEND_URL', 'http://localhost:3000'),
  frontendUrls: (getOptional('FRONTEND_URLS', 'http://localhost:3000,http://localhost:3002') ?? '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  rateLimitWindowMs: parseInt(getOptional('RATE_LIMIT_WINDOW_MS', '60000') ?? '60000', 10),
  rateLimitMax: parseInt(getOptional('RATE_LIMIT_MAX', '100') ?? '100', 10),

  supabase: {
    url: getOptional('SUPABASE_URL'),
    serviceRoleKey: getOptional('SUPABASE_SERVICE_ROLE_KEY'),
    jwtSecret: getOptional('SUPABASE_JWT_SECRET'),
  },

  googleCalendar: {
    credentialsPath: getOptional('GOOGLE_CALENDAR_CREDENTIALS'),
  },

  whatsapp: {
    apiUrl: getOptional('WHATSAPP_API_URL'),
    apiKey: getOptional('WHATSAPP_API_KEY'),
  },

  email: {
    provider: getOptional('EMAIL_PROVIDER', 'resend'),
    resendApiKey: getOptional('RESEND_API_KEY'),
    smtp: {
      host: getOptional('SMTP_HOST'),
      port: parseInt(getOptional('SMTP_PORT', '587') ?? '587', 10),
      user: getOptional('SMTP_USER'),
      pass: getOptional('SMTP_PASS'),
    },
    from: getOptional('FROM_EMAIL', 'PeerNXT <noreply@peernxt.com>'),
  },
} as const;

export const isProd = env.nodeEnv === 'production';
