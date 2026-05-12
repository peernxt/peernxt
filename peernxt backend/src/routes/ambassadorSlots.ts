import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createAmbassadorSlot,
  bookAmbassadorSlot,
  getAmbassadorSlotById,
  getAmbassadorSlotsByAmbassador,
  getOpenAmbassadorSlots,
  getBookingsForSlot,
  getBookingsForStudent,
} from '../services/ambassadorSlotService.js';
import {
  createAmbassadorSlotSchema,
  bookAmbassadorSlotSchema,
} from '../validators/schemas.js';
import { supabase, tables } from '../lib/db.js';
import { asyncRoute } from '../utils/asyncRoute.js';

const router = Router();

router.use(requireAuth);

router.post(
  '/slots',
  requireRole('ambassador'),
  asyncRoute(async (req, res) => {
    const parsed = createAmbassadorSlotSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const slot = await createAmbassadorSlot({
      ambassadorId: req.user!.uid,
      slotAt: parsed.data.slotAt,
      durationMinutes: parsed.data.durationMinutes,
    });
    res.status(201).json(slot);
  })
);

router.get(
  '/slots/open',
  asyncRoute(async (req, res) => {
    const ambassadorId = req.query.ambassadorId as string | undefined;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const slots = await getOpenAmbassadorSlots(ambassadorId, from, to);
    res.json(slots);
  })
);

router.get(
  '/slots/me',
  requireRole('ambassador'),
  asyncRoute(async (req, res) => {
    const upcomingOnly = req.query.upcoming !== 'false';
    const slots = await getAmbassadorSlotsByAmbassador(req.user!.uid, upcomingOnly);
    res.json(slots);
  })
);

router.get(
  '/slots/:slotId',
  asyncRoute(async (req, res) => {
    const slot = await getAmbassadorSlotById(req.params.slotId);
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    res.json(slot);
  })
);

router.delete(
  '/slots/:slotId',
  requireRole('ambassador'),
  asyncRoute(async (req, res) => {
    const slot = await getAmbassadorSlotById(req.params.slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.ambassadorId !== req.user!.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { error } = await supabase
      .from(tables.ambassadorSlots)
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', req.params.slotId);
    if (error) throw error;
    res.status(204).send();
  })
);

router.get(
  '/slots/:slotId/bookings',
  requireRole('ambassador'),
  asyncRoute(async (req, res) => {
    const slot = await getAmbassadorSlotById(req.params.slotId);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.ambassadorId !== req.user!.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const bookings = await getBookingsForSlot(req.params.slotId);
    res.json(bookings);
  })
);

router.post(
  '/book',
  requireRole('student'),
  asyncRoute(async (req, res) => {
    const parsed = bookAmbassadorSlotSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const booking = await bookAmbassadorSlot({
      slotId: parsed.data.slotId,
      studentId: req.user!.uid,
      paymentId: parsed.data.paymentId,
      amountPaid: parsed.data.amountPaid,
    });
    res.status(201).json(booking);
  })
);

router.get(
  '/bookings/me',
  requireRole('student'),
  asyncRoute(async (req, res) => {
    const bookings = await getBookingsForStudent(req.user!.uid);
    res.json(bookings);
  })
);

export default router;
