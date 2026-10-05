import type { Request, Response, NextFunction } from 'express';

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('[BUYGEN API Error]:', err?.message || err);

  const statusCode = err.status || err.statusCode || 500;
  const safeMessage = err.isPublic ? err.message : (err.message || 'Internal server error occurred. Please try again.');

  res.status(statusCode).json({
    error: safeMessage,
    code: err.code || 'SERVER_ERROR',
    ...(err.email ? { email: err.email } : {})
  });
}
