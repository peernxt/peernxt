import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err && typeof err === 'object' && 'statusCode' in err) {
    const status = (err as { statusCode: number }).statusCode;
    const message = (err as { message?: string }).message ?? 'Error';
    res.status(status).json({ error: message });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? undefined : String(err),
  });
}
