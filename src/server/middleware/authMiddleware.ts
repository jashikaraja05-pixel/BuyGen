import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.ts';
import { storage } from '../config/storage.ts';
import type { User } from '../../types/index.ts';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authMiddleware = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) return next();

  try {
    const payload = verifyToken(token);
    if (!payload || !payload.uid) {
      // Forged, unsigned, or expired token
      return next();
    }

    // Always fetch authoritative user profile and role from persistent database
    const user = storage.getUserById(payload.uid);

    if (user) {
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role === 'admin' ? 'admin' : 'customer', // Strictly enforced from DB
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      };
    }
  } catch (err) {
    console.error('Auth verification error:', err);
  }

  next();
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required. Please sign in to proceed.',
      code: 'UNAUTHORIZED'
    });
  }
  next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required. Please sign in as an administrator.',
      code: 'UNAUTHORIZED'
    });
  }

  // Strict check on authoritative role from database
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied: Administrator privileges required.',
      code: 'FORBIDDEN'
    });
  }

  next();
};
