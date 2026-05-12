import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getSupabase } from '../config/supabase.js';
import { getUserRole } from '../services/userService.js';
import type { UserRole } from '../types/index.js';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Verify Supabase JWT from Authorization: Bearer <access_token>.
 * Uses SUPABASE_JWT_SECRET (Supabase Dashboard → Settings → API → JWT Secret).
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token =
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ??
    (req.headers['x-supabase-auth-token'] as string);

  if (!token) {
    res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid token' });
    return;
  }

  try {
    // First try local JWT verification (fast path).
    const secret = env.supabase.jwtSecret;
    let uid = '';
    let email: string | null = null;
    let displayName: string | null = null;
    let photoURL: string | null = null;

    if (secret) {
      try {
        const decoded = jwt.verify(token, secret) as {
          sub: string;
          email?: string;
          user_metadata?: { full_name?: string; picture?: string };
        };
        uid = decoded.sub;
        email = decoded.email ?? null;
        displayName = decoded.user_metadata?.full_name ?? null;
        photoURL = decoded.user_metadata?.picture ?? null;
      } catch {
        // Fallback below when token algorithm/key differs from local secret.
      }
    }

    // Fallback: ask Supabase Auth to validate token and return user.
    if (!uid) {
      const { data, error } = await getSupabase().auth.getUser(token);
      if (error || !data.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
        return;
      }
      uid = data.user.id;
      email = data.user.email ?? null;
      displayName = (data.user.user_metadata?.full_name as string | undefined) ?? null;
      photoURL = (data.user.user_metadata?.picture as string | undefined) ?? null;
    }

    const roleFromDb = await getUserRole(uid);
    const role = roleFromDb ?? 'student';
    req.user = {
      uid,
      email,
      displayName,
      photoURL,
      role,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient role' });
      return;
    }
    next();
  };
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token =
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ??
    (req.headers['x-supabase-auth-token'] as string);
  if (!token) {
    next();
    return;
  }
  const secret = env.supabase.jwtSecret;
  if (!secret) {
    next();
    return;
  }
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      next();
      return;
    }
    const d = decoded as { sub: string; email?: string; user_metadata?: { full_name?: string; picture?: string } };
    req.user = {
      uid: d.sub,
      email: d.email ?? null,
      displayName: d.user_metadata?.full_name ?? null,
      photoURL: d.user_metadata?.picture ?? null,
      role: 'student',
    };
    getUserRole(d.sub).then((role) => {
      if (role) req.user!.role = role;
      next();
    }).catch(() => next());
  });
}
