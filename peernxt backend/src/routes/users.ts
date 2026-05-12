import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getUserById } from '../services/userService.js';
import { supabase, tables, rowToCamel } from '../lib/db.js';
import { createUserSchema, updateProfileSchema } from '../validators/schemas.js';
import type { User, UserRole } from '../types/index.js';
import { asyncRoute } from '../utils/asyncRoute.js';

const router = Router();

router.use(requireAuth);

function createUserRow(
  uid: string,
  payload: {
    role: UserRole;
    email: string;
    displayName: string;
    photoURL?: string | null;
    profile: User['profile'];
  },
  now: string
) {
  return {
    id: uid,
    role: payload.role,
    email: payload.email,
    display_name: payload.displayName,
    photo_url: payload.photoURL ?? null,
    profile: payload.profile,
    created_at: now,
    updated_at: now,
    is_verified: false,
  };
}

function toCreatedUser(uid: string, row: ReturnType<typeof createUserRow>): User {
  return {
    id: uid,
    role: row.role as UserRole,
    email: row.email,
    displayName: row.display_name,
    photoURL: row.photo_url ?? undefined,
    profile: row.profile as User['profile'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isVerified: row.is_verified,
  };
}

async function userExists(uid: string): Promise<boolean> {
  const { data } = await supabase.from(tables.users).select('id').eq('id', uid).single();
  return Boolean(data);
}

router.get(
  '/me',
  asyncRoute(async (req, res) => {
    const user = await getUserById(req.user!.uid);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json(user);
  })
);

router.put(
  '/me',
  asyncRoute(async (req, res) => {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const uid = req.user!.uid;
    if (!(await userExists(uid))) {
      return res.status(404).json({ error: 'User profile not found. Use POST /users/me to register.' });
    }
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      ...(parsed.data.displayName !== undefined && { display_name: parsed.data.displayName }),
      ...(parsed.data.photoURL !== undefined && { photo_url: parsed.data.photoURL }),
      ...(parsed.data.profile !== undefined && { profile: parsed.data.profile }),
    };
    await supabase.from(tables.users).update(updates).eq('id', uid);
    const updated = await getUserById(uid);
    res.json(updated);
  })
);

/** Student self-registration: create profile after Supabase Auth sign-up. */
router.post(
  '/me',
  asyncRoute(async (req, res) => {
    const uid = req.user!.uid;
    if (await userExists(uid)) {
      return res.status(409).json({ error: 'Profile already exists. Use PUT /users/me to update.' });
    }
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    if (parsed.data.role !== 'student') {
      return res.status(403).json({ error: 'Only students can self-register. Agents/ambassadors are invited.' });
    }

    const now = new Date().toISOString();
    const row = createUserRow(
      uid,
      {
        role: 'student',
        email: parsed.data.email,
        displayName: parsed.data.displayName,
        photoURL: parsed.data.photoURL,
        profile: parsed.data.profile as User['profile'],
      },
      now
    );
    const { error } = await supabase.from(tables.users).insert(row);
    if (error) throw error;
    res.status(201).json(toCreatedUser(uid, row));
  })
);

/** Self-registration for any role during direct Supabase onboarding flow. */
router.post(
  '/register',
  asyncRoute(async (req, res) => {
    const uid = req.user!.uid;
    if (await userExists(uid)) {
      return res.status(409).json({ error: 'Profile already exists. Use PUT /users/me to update.' });
    }
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    const now = new Date().toISOString();
    const row = createUserRow(
      uid,
      {
        role: parsed.data.role as UserRole,
        email: parsed.data.email,
        displayName: parsed.data.displayName,
        photoURL: parsed.data.photoURL,
        profile: parsed.data.profile as User['profile'],
      },
      now
    );
    const { error } = await supabase.from(tables.users).insert(row);
    if (error) throw error;
    res.status(201).json(toCreatedUser(uid, row));
  })
);

/** List agents or ambassadors. Query: ?role=agent | role=ambassador */
router.get(
  '/',
  asyncRoute(async (req, res) => {
    const role = req.query.role as string | undefined;
    if (!role || !['agent', 'ambassador'].includes(role)) {
      return res.status(400).json({ error: 'Query param role=agent or role=ambassador required' });
    }
    const { data, error } = await supabase
      .from(tables.users)
      .select('*')
      .eq('role', role)
      .limit(100);
    if (error) throw error;
    const users = (data ?? []).map((r) => rowToCamel(r));
    res.json(users);
  })
);

router.get(
  '/:userId',
  asyncRoute(async (req, res) => {
    const user = await getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  })
);

router.post(
  '/',
  requireRole('agent', 'ambassador'),
  asyncRoute(async (req, res) => {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const uid = req.body.uid as string | undefined;
    if (!uid) {
      return res.status(400).json({ error: 'uid required in body (Supabase Auth user id)' });
    }
    if (await userExists(uid)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const now = new Date().toISOString();
    const row = createUserRow(
      uid,
      {
        role: parsed.data.role as UserRole,
        email: parsed.data.email,
        displayName: parsed.data.displayName,
        photoURL: parsed.data.photoURL,
        profile: parsed.data.profile as User['profile'],
      },
      now
    );
    const { error } = await supabase.from(tables.users).insert(row);
    if (error) throw error;
    res.status(201).json(toCreatedUser(uid, row));
  })
);

export default router;
