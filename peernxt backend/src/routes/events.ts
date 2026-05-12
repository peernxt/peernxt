import { Router, type Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createEvent,
  getEventById,
  getEventsByAgent,
  listUpcomingEvents,
  rsvpToEvent,
  cancelRsvp,
  getRsvpsForEvent,
  getRsvpsForStudent,
} from '../services/eventService.js';
import { createEventSchema } from '../validators/schemas.js';
import { asyncRoute } from '../utils/asyncRoute.js';

const router = Router();
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return uuidRegex.test(value);
}

function ensureValidEventId(eventId: string, res: Response): boolean {
  if (!isValidUuid(eventId)) {
    res.status(400).json({ error: 'Invalid eventId' });
    return false;
  }
  return true;
}

router.get(
  '/',
  asyncRoute(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 100);
    const events = await listUpcomingEvents(limit);
    res.json(events);
  })
);

router.post(
  '/',
  requireAuth,
  requireRole('agent'),
  asyncRoute(async (req, res) => {
    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const event = await createEvent({
      agentId: req.user!.uid,
      ...parsed.data,
    });
    res.status(201).json(event);
  })
);

router.get(
  '/agent/:agentId',
  asyncRoute(async (req, res) => {
    if (!isValidUuid(req.params.agentId)) {
      return res.status(400).json({ error: 'Invalid agentId' });
    }
    const upcomingOnly = req.query.upcoming !== 'false';
    const events = await getEventsByAgent(req.params.agentId, upcomingOnly);
    res.json(events);
  })
);

router.get(
  '/rsvps/me',
  requireAuth,
  requireRole('student'),
  asyncRoute(async (req, res) => {
    const rsvps = await getRsvpsForStudent(req.user!.uid);
    res.json(rsvps);
  })
);

router.get(
  '/:eventId',
  asyncRoute(async (req, res) => {
    if (!ensureValidEventId(req.params.eventId, res)) return;
    const event = await getEventById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  })
);

router.post(
  '/:eventId/rsvp',
  requireAuth,
  requireRole('student'),
  asyncRoute(async (req, res) => {
    if (!ensureValidEventId(req.params.eventId, res)) return;
    const rsvp = await rsvpToEvent(req.params.eventId, req.user!.uid);
    res.status(201).json(rsvp);
  })
);

router.delete(
  '/:eventId/rsvp',
  requireAuth,
  requireRole('student'),
  asyncRoute(async (req, res) => {
    if (!ensureValidEventId(req.params.eventId, res)) return;
    await cancelRsvp(req.params.eventId, req.user!.uid);
    res.status(204).send();
  })
);

router.get(
  '/:eventId/rsvps',
  requireAuth,
  requireRole('agent'),
  asyncRoute(async (req, res) => {
    if (!ensureValidEventId(req.params.eventId, res)) return;
    const event = await getEventById(req.params.eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.agentId !== req.user!.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const rsvps = await getRsvpsForEvent(req.params.eventId);
    res.json(rsvps);
  })
);

export default router;
