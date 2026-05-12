import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  bookCounselorMeeting,
  getCounselorMeetingById,
  getCounselorMeetingsForUser,
} from '../services/counselorMeetingService.js';
import { bookCounselorMeetingSchema } from '../validators/schemas.js';
import { asyncRoute } from '../utils/asyncRoute.js';

const router = Router();

router.use(requireAuth);

router.post(
  '/book',
  requireRole('student'),
  asyncRoute(async (req, res) => {
    const parsed = bookCounselorMeetingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const meeting = await bookCounselorMeeting({
      studentId: req.user!.uid,
      agentId: parsed.data.agentId,
      slotAt: parsed.data.slotAt,
      durationMinutes: parsed.data.durationMinutes,
      callType: parsed.data.callType,
    });
    res.status(201).json(meeting);
  })
);

router.get(
  '/me',
  asyncRoute(async (req, res) => {
    const meetings = await getCounselorMeetingsForUser(req.user!.uid);
    res.json(meetings);
  })
);

router.get(
  '/:meetingId',
  asyncRoute(async (req, res) => {
    const meeting = await getCounselorMeetingById(req.params.meetingId);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    const uid = req.user!.uid;
    if (meeting.studentId !== uid && meeting.agentId !== uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(meeting);
  })
);

export default router;
