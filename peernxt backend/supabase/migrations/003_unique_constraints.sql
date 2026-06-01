-- Prevent duplicate email registrations
ALTER TABLE users ADD CONSTRAINT unique_user_email UNIQUE (email);

-- Prevent a student from booking the same ambassador slot more than once
ALTER TABLE ambassador_bookings
  ADD CONSTRAINT unique_booking_per_slot_student UNIQUE (slot_id, student_id);
