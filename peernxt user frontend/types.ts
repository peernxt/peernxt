
export enum UserRole {
  STUDENT = 'STUDENT',
  COUNSELOR = 'COUNSELOR',
  PEER_AMBASSADOR = 'PEER_AMBASSADOR'
}

export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum LeadRating {
  HOT = 'HOT',
  WARM = 'WARM',
  JUNK = 'JUNK'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profilePicture?: string;
  onboardingCompleted: boolean;
  googleCalendarConnected: boolean;
  [key: string]: any;
}

export interface Counselor {
  id: string;
  name: string;
  bio: string;
  profilePicture?: string;
  countrySpecializations: string[];
  location: string;
}

export interface PeerAmbassador {
  id: string;
  name: string;
  bio: string;
  profilePicture?: string;
  country: string;
  university: string;
  sessionPrice: number;
}

export interface Meeting {
  id: string;
  date: string;
  time: string;
  status: MeetingStatus;
  counselorId?: string;
  studentId: string;
  counselorName?: string;
  studentName?: string;
  googleMeetLink?: string;
  rating?: LeadRating;
  notes?: string;
}

export interface Community {
  id: string;
  name: string;
  countryCode: string;
  description: string;
}

export interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    profilePicture?: string;
  };
  likeCount: number;
  commentCount: number;
  createdAt: string;
  images?: string[];
}
