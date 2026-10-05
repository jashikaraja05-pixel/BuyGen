import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'buygen-secure-production-jwt-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

export interface JwtPayload {
  uid: string;
  email: string;
  role: 'customer' | 'admin';
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (decoded && decoded.uid && decoded.email) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}
