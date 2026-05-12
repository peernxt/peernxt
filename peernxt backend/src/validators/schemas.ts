import { z } from 'zod';

export const userRoleSchema = z.enum(['student', 'agent', 'ambassador', 'admin']);

export const studentProfileSchema = z.object({
  whatsappNumber: z.string().min(10),
  whatsappVerified: z.boolean().optional().default(false),
  intake: z.string().min(1),
  preferredCountries: z.array(z.string()),
  bio: z.string(),
});

export const agentProfileSchema = z.object({
  experienceYears: z.number().min(0),
  countriesExpertise: z.array(z.string()),
  agencyName: z.string(),
  bio: z.string(),
  calendarAvailability: z.string(),
});

export const ambassadorProfileSchema = z.object({
  universityName: z.string(),
  country: z.string(),
  course: z.string(),
  bio: z.string(),
  meetingAvailability: z.string(),
});

export const createUserSchema = z.object({
  role: userRoleSchema,
  email: z.string().email(),
  displayName: z.string().min(1),
  photoURL: z.string().url().optional(),
  profile: z.union([
    studentProfileSchema,
    agentProfileSchema,
    ambassadorProfileSchema,
  ]),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).optional(),
  photoURL: z.string().url().optional(),
  profile: z
    .union([
      studentProfileSchema.partial(),
      agentProfileSchema.partial(),
      ambassadorProfileSchema.partial(),
    ])
    .optional(),
});

export const bookCounselorMeetingSchema = z.object({
  agentId: z.string().min(1),
  slotAt: z.string().min(1), // ISO datetime
  durationMinutes: z.number().min(15).max(120).optional(),
  callType: z.enum(['audio', 'video']).optional().default('video'),
});

export const createAmbassadorSlotSchema = z.object({
  slotAt: z.string().min(1), // ISO datetime
  durationMinutes: z.number().min(30).max(120).optional(),
});

export const bookAmbassadorSlotSchema = z.object({
  slotId: z.string().min(1),
  paymentId: z.string().optional(),
  amountPaid: z.number().optional(),
});

export const sendChatMessageSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  locationType: z.enum(['online', 'offline']),
  locationDetails: z.string().optional(),
  meetLink: z.string().url().optional(),
  maxAttendees: z.number().min(1).optional(),
});
