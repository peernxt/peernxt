import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { supabase, tables, rowToCamel } from '../lib/db.js';
import { createEventSchema, userRoleSchema } from '../validators/schemas.js';

const router = Router();
const HIDDEN_PREFIX = '[HIDDEN_BY_ADMIN] ';
const reportKeywords = ['dm me', 'guaranteed', 'shortcut', 'pay', 'visa', 'spam', 'urgent payment'];

type JsonObject = Record<string, unknown>;

const adminEventCreateSchema = createEventSchema.extend({
  agentId: z.string().uuid(),
});

const adminEventUpdateSchema = createEventSchema
  .partial()
  .extend({
    agentId: z.string().uuid().optional(),
  })
  .refine(
    (value) => !(value.startAt && value.endAt) || new Date(value.startAt).getTime() <= new Date(value.endAt).getTime(),
    { message: 'startAt must be before endAt', path: ['startAt'] }
  );

const warnUserSchema = z.object({
  reason: z.string().trim().min(2).max(240).optional(),
});

const banUserSchema = z.object({
  banned: z.boolean().default(true),
  reason: z.string().trim().min(2).max(240).optional(),
});

const setPostVisibilitySchema = z.object({
  hidden: z.boolean(),
});

const getCommunityLimit = (value: unknown, fallback: number, max: number): number => {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
};

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const extractModeration = (profile: unknown): JsonObject => {
  if (!isJsonObject(profile)) return {};
  const moderation = profile.moderation;
  return isJsonObject(moderation) ? moderation : {};
};

const withUpdatedModeration = (profile: unknown, moderationPatch: JsonObject): JsonObject => {
  const baseProfile: JsonObject = isJsonObject(profile) ? profile : {};
  const currentModeration = extractModeration(baseProfile);
  return {
    ...baseProfile,
    moderation: {
      ...currentModeration,
      ...moderationPatch,
      updatedAt: new Date().toISOString(),
    },
  };
};

const computePostReportScore = (content: string, hidden: boolean): number => {
  if (hidden) return 1;
  const lower = content.toLowerCase();
  return reportKeywords.reduce((score, keyword) => (lower.includes(keyword) ? score + 1 : score), 0);
};

router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/stats', async (_req, res, next) => {
  try {
    const [{ count: userCount }, { count: meetingCount }, { count: openSlotCount }, { count: eventCount }] =
      await Promise.all([
        supabase.from(tables.users).select('*', { head: true, count: 'exact' }),
        supabase.from(tables.counselorMeetings).select('*', { head: true, count: 'exact' }).eq('status', 'scheduled'),
        supabase.from(tables.ambassadorSlots).select('*', { head: true, count: 'exact' }).eq('status', 'open'),
        supabase.from(tables.events).select('*', { head: true, count: 'exact' }),
      ]);

    res.json({
      users: userCount ?? 0,
      upcomingMeetings: meetingCount ?? 0,
      openSlots: openSlotCount ?? 0,
      events: eventCount ?? 0,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const role = req.query.role as string | undefined;
    let q = supabase.from(tables.users).select('*').order('created_at', { ascending: false }).limit(500);
    if (role) q = q.eq('role', role);
    const { data, error } = await q;
    if (error) throw error;
    res.json((data ?? []).map((r) => rowToCamel(r)));
  } catch (e) {
    next(e);
  }
});

router.patch('/users/:userId/role', async (req, res, next) => {
  try {
    const parsed = z.object({ role: userRoleSchema }).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const { data, error } = await supabase
      .from(tables.users)
      .update({ role: parsed.data.role, updated_at: new Date().toISOString() })
      .eq('id', req.params.userId)
      .select('*')
      .single();
    if (error) throw error;
    res.json(rowToCamel(data));
  } catch (e) {
    next(e);
  }
});

router.get('/counselor-meetings', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from(tables.counselorMeetings)
      .select('*')
      .order('slot_at', { ascending: false })
      .limit(500);
    if (error) throw error;
    res.json((data ?? []).map((r) => rowToCamel(r)));
  } catch (e) {
    next(e);
  }
});

router.patch('/counselor-meetings/:meetingId/status', async (req, res, next) => {
  try {
    const parsed = z.object({ status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']) }).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const { data, error } = await supabase
      .from(tables.counselorMeetings)
      .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
      .eq('id', req.params.meetingId)
      .select('*')
      .single();
    if (error) throw error;
    res.json(rowToCamel(data));
  } catch (e) {
    next(e);
  }
});

router.get('/ambassador-slots', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from(tables.ambassadorSlots)
      .select('*')
      .order('slot_at', { ascending: false })
      .limit(500);
    if (error) throw error;
    const slots = (data ?? []).map((r) => rowToCamel(r));

    const slotsWithCounts = await Promise.all(
      slots.map(async (slot) => {
        const slotId = String(slot.id);
        const { count } = await supabase
          .from(tables.ambassadorBookings)
          .select('*', { head: true, count: 'exact' })
          .eq('slot_id', slotId)
          .eq('status', 'confirmed');
        return { ...slot, bookedCount: count ?? 0 };
      })
    );
    res.json(slotsWithCounts);
  } catch (e) {
    next(e);
  }
});

router.patch('/ambassador-slots/:slotId/status', async (req, res, next) => {
  try {
    const parsed = z.object({ status: z.enum(['open', 'full', 'completed', 'cancelled']) }).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const { data, error } = await supabase
      .from(tables.ambassadorSlots)
      .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
      .eq('id', req.params.slotId)
      .select('*')
      .single();
    if (error) throw error;
    res.json(rowToCamel(data));
  } catch (e) {
    next(e);
  }
});

router.get('/events', async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from(tables.events).select('*').order('start_at', { ascending: false }).limit(500);
    if (error) throw error;
    const events = await Promise.all(
      (data ?? []).map(async (eventRow) => {
        const event = rowToCamel(eventRow);
        const eventId = String(event.id);
        const { count } = await supabase
          .from(tables.eventRSVPs)
          .select('*', { head: true, count: 'exact' })
          .eq('event_id', eventId)
          .eq('status', 'going');
        return { ...event, rsvpCount: count ?? 0 };
      })
    );
    res.json(events);
  } catch (e) {
    next(e);
  }
});

router.post('/events', async (req, res, next) => {
  try {
    const parsed = adminEventCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const { data: agent, error: agentError } = await supabase
      .from(tables.users)
      .select('id')
      .eq('id', parsed.data.agentId)
      .eq('role', 'agent')
      .single();
    if (agentError || !agent) {
      return res.status(400).json({ error: 'Invalid agentId. Event host must be an existing counselor.' });
    }

    const now = new Date().toISOString();
    const insertRow = {
      agent_id: parsed.data.agentId,
      title: parsed.data.title,
      description: parsed.data.description,
      start_at: parsed.data.startAt,
      end_at: parsed.data.endAt,
      location_type: parsed.data.locationType,
      location_details: parsed.data.locationDetails ?? null,
      meet_link: parsed.data.meetLink ?? null,
      max_attendees: parsed.data.maxAttendees ?? null,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await supabase.from(tables.events).insert(insertRow).select('*').single();
    if (error) throw error;
    res.status(201).json(rowToCamel(data));
  } catch (e) {
    next(e);
  }
});

router.patch('/events/:eventId', async (req, res, next) => {
  try {
    const parsed = adminEventUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    if (Object.keys(parsed.data).length === 0) {
      return res.status(400).json({ error: 'No update fields provided' });
    }

    if (parsed.data.agentId) {
      const { data: agent, error: agentError } = await supabase
        .from(tables.users)
        .select('id')
        .eq('id', parsed.data.agentId)
        .eq('role', 'agent')
        .single();
      if (agentError || !agent) {
        return res.status(400).json({ error: 'Invalid agentId. Event host must be an existing counselor.' });
      }
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      ...(parsed.data.agentId !== undefined && { agent_id: parsed.data.agentId }),
      ...(parsed.data.title !== undefined && { title: parsed.data.title }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      ...(parsed.data.startAt !== undefined && { start_at: parsed.data.startAt }),
      ...(parsed.data.endAt !== undefined && { end_at: parsed.data.endAt }),
      ...(parsed.data.locationType !== undefined && { location_type: parsed.data.locationType }),
      ...(parsed.data.locationDetails !== undefined && { location_details: parsed.data.locationDetails }),
      ...(parsed.data.meetLink !== undefined && { meet_link: parsed.data.meetLink }),
      ...(parsed.data.maxAttendees !== undefined && { max_attendees: parsed.data.maxAttendees }),
    };
    const { data, error } = await supabase.from(tables.events).update(updates).eq('id', req.params.eventId).select('*').single();
    if (error) throw error;
    res.json(rowToCamel(data));
  } catch (e) {
    next(e);
  }
});

router.delete('/events/:eventId', async (req, res, next) => {
  try {
    await supabase.from(tables.eventRSVPs).delete().eq('event_id', req.params.eventId);
    const { error } = await supabase.from(tables.events).delete().eq('id', req.params.eventId);
    if (error) throw error;
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

router.get('/community/groups', async (req, res, next) => {
  try {
    const limit = getCommunityLimit(req.query.limit, 100, 500);
    const [{ data: chats, error: chatsError }, { data: messages, error: messagesError }] = await Promise.all([
      supabase.from(tables.chats).select('id, participant_ids').order('created_at', { ascending: false }).limit(limit),
      supabase.from(tables.chatMessages).select('id, chat_id, content, type').order('created_at', { ascending: false }).limit(2000),
    ]);
    if (chatsError) throw chatsError;
    if (messagesError) throw messagesError;

    const messageRows = messages ?? [];
    const byChat = new Map<string, { posts: number; flagged: number }>();
    for (const row of messageRows) {
      const chatId = String(row.chat_id);
      const content = String(row.content ?? '');
      const hidden = String(row.type ?? '') === 'system' && content.startsWith(HIDDEN_PREFIX);
      const reportScore = computePostReportScore(content, hidden);
      const current = byChat.get(chatId) ?? { posts: 0, flagged: 0 };
      current.posts += 1;
      if (reportScore > 0) current.flagged += 1;
      byChat.set(chatId, current);
    }

    const groups = (chats ?? []).map((chat) => {
      const chatId = String(chat.id);
      const stats = byChat.get(chatId) ?? { posts: 0, flagged: 0 };
      const participantIds = Array.isArray(chat.participant_ids) ? chat.participant_ids : [];
      return {
        id: chatId,
        name: `Conversation ${chatId.slice(0, 8)}`,
        members: participantIds.length,
        posts: stats.posts,
        status: stats.flagged > 0 ? 'review' : 'active',
      };
    });
    res.json(groups);
  } catch (e) {
    next(e);
  }
});

router.get('/community/posts', async (req, res, next) => {
  try {
    const limit = getCommunityLimit(req.query.limit, 200, 500);
    const { data, error } = await supabase
      .from(tables.chatMessages)
      .select('id, chat_id, sender_id, content, type, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;

    const postRows = data ?? [];
    const senderIds = Array.from(new Set(postRows.map((row) => String(row.sender_id))));
    const { data: users, error: usersError } = await supabase
      .from(tables.users)
      .select('id, display_name, profile')
      .in('id', senderIds.length ? senderIds : ['00000000-0000-0000-0000-000000000000']);
    if (usersError) throw usersError;
    const userMap = new Map<string, { displayName: string; profile: unknown }>(
      (users ?? []).map((user) => [String(user.id), { displayName: String(user.display_name ?? 'User'), profile: user.profile }])
    );

    const posts = postRows.map((row) => {
      const id = String(row.id);
      const groupId = String(row.chat_id);
      const authorId = String(row.sender_id);
      const rawContent = String(row.content ?? '');
      const hidden = String(row.type ?? '') === 'system' && rawContent.startsWith(HIDDEN_PREFIX);
      const content = hidden ? rawContent.replace(HIDDEN_PREFIX, '') : rawContent;
      const reportScore = computePostReportScore(content, hidden);
      const user = userMap.get(authorId);
      const moderation = extractModeration(user?.profile);
      return {
        id,
        groupId,
        groupName: `Conversation ${groupId.slice(0, 8)}`,
        authorId,
        author: user?.displayName ?? 'Unknown User',
        content,
        reports: reportScore,
        createdAtLabel: new Date(String(row.created_at)).toLocaleString(),
        hidden,
        authorBanned: Boolean(moderation.banned),
      };
    });
    res.json(posts);
  } catch (e) {
    next(e);
  }
});

router.get('/community/reports', async (req, res, next) => {
  try {
    const limit = getCommunityLimit(req.query.limit, 100, 200);
    const { data, error } = await supabase
      .from(tables.chatMessages)
      .select('id, sender_id, content, type, created_at')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) throw error;

    const reports = (data ?? [])
      .map((row) => {
        const content = String(row.content ?? '');
        const hidden = String(row.type ?? '') === 'system' && content.startsWith(HIDDEN_PREFIX);
        const score = computePostReportScore(content, hidden);
        if (score === 0) return null;
        return {
          id: `report-${row.id}`,
          postId: String(row.id),
          reason: hidden ? 'Hidden by moderation' : 'Potential spam / misleading content',
          reporter: 'auto-moderation',
          createdAtLabel: new Date(String(row.created_at)).toLocaleString(),
          status: 'open',
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, limit);
    res.json(reports);
  } catch (e) {
    next(e);
  }
});

router.patch('/community/posts/:postId', async (req, res, next) => {
  try {
    const parsed = setPostVisibilitySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const { data: existing, error: existingError } = await supabase
      .from(tables.chatMessages)
      .select('id, content, type')
      .eq('id', req.params.postId)
      .single();
    if (existingError || !existing) return res.status(404).json({ error: 'Post not found' });

    const currentContent = String(existing.content ?? '');
    const currentlyHidden = String(existing.type ?? '') === 'system' && currentContent.startsWith(HIDDEN_PREFIX);
    const targetHidden = parsed.data.hidden;
    if (currentlyHidden === targetHidden) return res.json({ id: String(existing.id), hidden: targetHidden });

    const nextContent = targetHidden ? `${HIDDEN_PREFIX}${currentContent}` : currentContent.replace(HIDDEN_PREFIX, '');
    const nextType = targetHidden ? 'system' : 'text';
    const { data, error } = await supabase
      .from(tables.chatMessages)
      .update({ content: nextContent, type: nextType })
      .eq('id', req.params.postId)
      .select('id, type, content')
      .single();
    if (error) throw error;
    res.json({
      id: String(data.id),
      hidden: String(data.type) === 'system' && String(data.content).startsWith(HIDDEN_PREFIX),
    });
  } catch (e) {
    next(e);
  }
});

router.delete('/community/posts/:postId', async (req, res, next) => {
  try {
    const { error } = await supabase.from(tables.chatMessages).delete().eq('id', req.params.postId);
    if (error) throw error;
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

router.post('/community/users/:userId/warn', async (req, res, next) => {
  try {
    const parsed = warnUserSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const { data: userRow, error: userError } = await supabase
      .from(tables.users)
      .select('id, profile')
      .eq('id', req.params.userId)
      .single();
    if (userError || !userRow) return res.status(404).json({ error: 'User not found' });

    const moderation = extractModeration(userRow.profile);
    const warningsCount = Number(moderation.warningsCount ?? 0);
    const updatedProfile = withUpdatedModeration(userRow.profile, {
      warningsCount: Number.isFinite(warningsCount) ? warningsCount + 1 : 1,
      lastWarningReason: parsed.data.reason ?? null,
      lastWarningAt: new Date().toISOString(),
    });
    const { error: updateError } = await supabase
      .from(tables.users)
      .update({ profile: updatedProfile, updated_at: new Date().toISOString() })
      .eq('id', req.params.userId);
    if (updateError) throw updateError;
    res.status(201).json({ id: req.params.userId, warningsCount: (updatedProfile.moderation as JsonObject).warningsCount ?? 1 });
  } catch (e) {
    next(e);
  }
});

router.patch('/community/users/:userId/ban', async (req, res, next) => {
  try {
    const parsed = banUserSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const { data: userRow, error: userError } = await supabase
      .from(tables.users)
      .select('id, profile')
      .eq('id', req.params.userId)
      .single();
    if (userError || !userRow) return res.status(404).json({ error: 'User not found' });

    const updatedProfile = withUpdatedModeration(userRow.profile, {
      banned: parsed.data.banned,
      banReason: parsed.data.reason ?? null,
      bannedAt: parsed.data.banned ? new Date().toISOString() : null,
    });
    const { error: updateError } = await supabase
      .from(tables.users)
      .update({ profile: updatedProfile, updated_at: new Date().toISOString() })
      .eq('id', req.params.userId);
    if (updateError) throw updateError;
    res.json({ id: req.params.userId, banned: parsed.data.banned });
  } catch (e) {
    next(e);
  }
});

export default router;

