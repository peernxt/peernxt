export enum UserRole {
  STUDENT = 'student',
  COUNSELOR = 'agent',
  PEER_AMBASSADOR = 'ambassador',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  onboardingCompleted?: boolean;
  profilePicture?: string;
}

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';

export interface CounselorMeeting {
  id: string;
  studentName: string;
  counselorName: string;
  startsAtLabel: string;
  status: MeetingStatus;
  meetLink?: string;
}

export interface AmbassadorSlot {
  id: string;
  ambassadorName: string;
  startsAtLabel: string;
  status: MeetingStatus;
  maxStudents: number;
  bookedCount: number;
}

export interface Event {
  id: string;
  title: string;
  hostName: string;
  startsAtLabel: string;
  endsAtLabel: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  rsvpCount: number;
}

