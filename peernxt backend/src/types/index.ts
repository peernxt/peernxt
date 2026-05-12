/**
 * PeerNXT domain types and Firestore document shapes.
 */

export type UserRole = 'student' | 'agent' | 'ambassador' | 'admin';

export interface BaseUser {
  id: string;
  role: UserRole;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string; // ISO
  updatedAt: string;
  isVerified?: boolean;
}

export interface StudentProfile {
  whatsappNumber: string;
  whatsappVerified: boolean;
  intake: string; // e.g. "Fall 2026", "Spring 2027"
  preferredCountries: string[];
  bio: string;
}

export interface AgentProfile {
  experienceYears: number;
  countriesExpertise: string[];
  agencyName: string;
  bio: string;
  calendarAvailability: string; // e.g. JSON or description
}

export interface AmbassadorProfile {
  universityName: string;
  country: string;
  course: string;
  bio: string;
  meetingAvailability: string;
}

export type UserProfile = StudentProfile | AgentProfile | AmbassadorProfile;

export interface User extends BaseUser {
  profile: UserProfile;
}

// --- Meetings (counselor = agent, 1:1) ---
export type MeetingType = 'counselor' | 'ambassador';
export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

/** Counselor calls can be audio or video; ambassador calls are video only. */
export type CallType = 'audio' | 'video';

export interface CounselorMeeting {
  id: string;
  type: 'counselor';
  callType: CallType; // audio | video — link generated accordingly
  studentId: string;
  agentId: string;
  slotAt: string; // ISO
  durationMinutes: number;
  meetLink: string;
  status: MeetingStatus;
  chatId: string; // in-app chat where link was sent
  createdAt: string;
  updatedAt: string;
}

// --- Ambassador group slot (1 ambassador, up to 10 students) ---
export interface AmbassadorSlot {
  id: string;
  ambassadorId: string;
  slotAt: string; // ISO
  durationMinutes: number;
  maxStudents: number; // 10
  meetLink: string;
  status: 'open' | 'full' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface AmbassadorBooking {
  id: string;
  slotId: string;
  studentId: string;
  status: 'confirmed' | 'cancelled' | 'refunded';
  paymentId?: string; // Razorpay/Stripe
  amountPaid?: number; // in paise/cents
  createdAt: string;
  updatedAt: string;
}

// --- Chats (for counselor meetings only) ---
export interface Chat {
  id: string;
  type: 'counselor';
  meetingId: string;
  participantIds: string[]; // [studentId, agentId]
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'system'; // system e.g. "Meeting link: ..."
  meetLink?: string;
  createdAt: string;
}

// --- Events (agents post, students RSVP) ---
export type EventLocationType = 'online' | 'offline';

export interface Event {
  id: string;
  agentId: string;
  title: string;
  description: string;
  startAt: string; // ISO
  endAt: string;
  locationType: EventLocationType;
  locationDetails?: string; // address or "Online - link will be shared"
  meetLink?: string;
  maxAttendees?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventRSVP {
  id: string;
  eventId: string;
  studentId: string;
  status: 'going' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
