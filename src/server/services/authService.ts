import bcrypt from 'bcryptjs';
import { storage } from '../config/storage.ts';
import { signToken } from '../utils/jwt.ts';
import { isValidEmail, isValidPassword } from '../utils/validation.ts';
import type { User, UserLoginLog } from '../../types/index.ts';

export class AuthError extends Error {
  code: string;
  statusCode: number;
  email?: string;
  isPublic: boolean;

  constructor(message: string, code: string, statusCode = 400, email?: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.statusCode = statusCode;
    this.email = email;
    this.isPublic = true;
  }
}

export const authService = {
  async register(name: string, email: string, pass: string, confirm: string): Promise<{ user: User; token: string }> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();

    if (!cleanName || cleanName.length < 2) {
      throw new AuthError('Please enter a valid full name (at least 2 characters).', 'VALIDATION_ERROR', 400, cleanEmail);
    }

    if (!isValidEmail(cleanEmail)) {
      throw new AuthError('Please enter a valid email address.', 'VALIDATION_ERROR', 400, cleanEmail);
    }

    if (!isValidPassword(pass)) {
      throw new AuthError('Password must be at least 6 characters long.', 'VALIDATION_ERROR', 400, cleanEmail);
    }

    if (pass !== confirm) {
      throw new AuthError('Password and confirmation password do not match.', 'VALIDATION_ERROR', 400, cleanEmail);
    }

    // Check if user already exists
    const existing = storage.getUserByEmail(cleanEmail);
    if (existing) {
      throw new AuthError(
        'An account with this email address already exists. Please sign in instead.',
        'EMAIL_ALREADY_EXISTS',
        409,
        cleanEmail
      );
    }

    // Strictly enforce customer role for all registrations - never grant admin from client payload
    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const passwordHash = await bcrypt.hash(pass, 10);
    const createdAt = new Date().toISOString();

    const newUser = storage.createUser({
      id: userId,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: 'customer', // Hard enforced
      createdAt,
      lastLogin: createdAt
    });

    const safeUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: 'customer',
      createdAt: newUser.createdAt,
      lastLogin: newUser.lastLogin
    };

    const token = signToken({ uid: userId, email: cleanEmail, role: 'customer' });
    this.logLogin(userId, cleanName, cleanEmail, 'customer');

    return { user: safeUser, token };
  },

  async login(email: string, pass: string): Promise<{ user: User; token: string }> {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !pass) {
      throw new AuthError('Email and password are required.', 'VALIDATION_ERROR', 400, cleanEmail);
    }

    const user = storage.getUserByEmail(cleanEmail);
    if (!user) {
      throw new AuthError(
        'No account found with this email address. Please register for a free account.',
        'USER_NOT_FOUND',
        404,
        cleanEmail
      );
    }

    // Verify password hash
    const isValid = await bcrypt.compare(pass, user.passwordHash || '');
    if (!isValid) {
      throw new AuthError(
        'Incorrect password. Please verify your password or use reset password.',
        'INVALID_PASSWORD',
        401,
        cleanEmail
      );
    }

    const lastLogin = new Date().toISOString();
    storage.updateUser(user.id, { lastLogin });

    const role = user.role === 'admin' ? 'admin' : 'customer';

    const safeUser: User = {
      id: user.id,
      name: user.name,
      email: cleanEmail,
      role,
      createdAt: user.createdAt,
      lastLogin
    };

    const token = signToken({ uid: user.id, email: cleanEmail, role });
    this.logLogin(user.id, safeUser.name, cleanEmail, role);

    return { user: safeUser, token };
  },

  async loginWithGoogle(email?: string, name?: string): Promise<{ user: User; token: string }> {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      throw new AuthError('Valid Google email is required.', 'VALIDATION_ERROR', 400, cleanEmail);
    }

    const cleanName = (name || '').trim() || cleanEmail.split('@')[0];
    let user = storage.getUserByEmail(cleanEmail);

    let userId: string;
    let role: 'customer' | 'admin' = 'customer';
    const lastLogin = new Date().toISOString();

    if (!user) {
      userId = 'usr_g_' + Date.now();
      const randomPasswordHash = await bcrypt.hash(Math.random().toString(36), 10);
      user = storage.createUser({
        id: userId,
        name: cleanName,
        email: cleanEmail,
        passwordHash: randomPasswordHash,
        role: 'customer',
        createdAt: lastLogin,
        lastLogin
      });
    } else {
      userId = user.id;
      role = user.role === 'admin' ? 'admin' : 'customer';
      storage.updateUser(userId, { lastLogin });
    }

    const safeUser: User = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      role,
      createdAt: user.createdAt,
      lastLogin
    };

    const token = signToken({ uid: userId, email: cleanEmail, role });
    this.logLogin(userId, cleanName, cleanEmail, role);

    return { user: safeUser, token };
  },

  async resetPassword(email: string, newPass: string, confirm?: string): Promise<{ user: User; token: string }> {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      throw new AuthError('Please enter a valid email address.', 'VALIDATION_ERROR', 400, cleanEmail);
    }

    if (!isValidPassword(newPass)) {
      throw new AuthError('New password must be at least 6 characters long.', 'VALIDATION_ERROR', 400, cleanEmail);
    }

    if (confirm && newPass !== confirm) {
      throw new AuthError('Passwords do not match.', 'VALIDATION_ERROR', 400, cleanEmail);
    }

    const user = storage.getUserByEmail(cleanEmail);
    if (!user) {
      throw new AuthError(
        'No registered account found with this email.',
        'USER_NOT_FOUND',
        404,
        cleanEmail
      );
    }

    const newHash = await bcrypt.hash(newPass, 10);
    const lastLogin = new Date().toISOString();

    storage.updateUser(user.id, {
      passwordHash: newHash,
      lastLogin
    });

    const role = user.role === 'admin' ? 'admin' : 'customer';
    const safeUser: User = {
      id: user.id,
      name: user.name,
      email: cleanEmail,
      role,
      createdAt: user.createdAt,
      lastLogin
    };

    const token = signToken({ uid: user.id, email: cleanEmail, role });
    return { user: safeUser, token };
  },

  logLogin(userId: string, name: string, email: string, role: 'customer' | 'admin') {
    const logId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const logEntry: UserLoginLog = {
      id: logId,
      userId,
      name,
      email,
      loginTime: new Date().toISOString(),
      role
    };
    storage.addLoginLog(logEntry);
  }
};
