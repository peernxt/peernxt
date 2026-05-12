-- PeerNXT schema for Supabase (PostgreSQL)
-- Run in Supabase SQL Editor or via supabase db push

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('student', 'agent', 'ambassador')),
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  photo_url TEXT,
  profile JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_verified BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS counselor_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'counselor',
  call_type TEXT NOT NULL CHECK (call_type IN ('audio', 'video')),
  student_id UUID NOT NULL REFERENCES users(id),
  agent_id UUID NOT NULL REFERENCES users(id),
  slot_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL,
  meet_link TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  chat_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'counselor',
  meeting_id UUID NOT NULL REFERENCES counselor_meetings(id),
  participant_ids UUID[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_chat'
  ) THEN
    ALTER TABLE counselor_meetings
      ADD CONSTRAINT fk_chat
      FOREIGN KEY (chat_id) REFERENCES chats(id);
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'system')),
  meet_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ambassador_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES users(id),
  slot_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL,
  max_students INT NOT NULL DEFAULT 10,
  meet_link TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'full', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ambassador_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES ambassador_slots(id),
  student_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled', 'refunded')),
  payment_id TEXT,
  amount_paid INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  location_type TEXT NOT NULL CHECK (location_type IN ('online', 'offline')),
  location_details TEXT,
  meet_link TEXT,
  max_attendees INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  student_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('going', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, student_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_counselor_meetings_student ON counselor_meetings(student_id);
CREATE INDEX IF NOT EXISTS idx_counselor_meetings_agent ON counselor_meetings(agent_id);
CREATE INDEX IF NOT EXISTS idx_chats_meeting ON chats(meeting_id);
CREATE INDEX IF NOT EXISTS idx_chats_participants ON chats USING GIN(participant_ids);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_slots_ambassador ON ambassador_slots(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_slots_status_slot ON ambassador_slots(status, slot_at);
CREATE INDEX IF NOT EXISTS idx_ambassador_bookings_slot ON ambassador_bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_bookings_student ON ambassador_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_events_agent ON events(agent_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_at);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_student ON event_rsvps(student_id);
