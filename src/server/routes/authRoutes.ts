import { Router } from 'express';
import { authService } from '../services/authService.ts';
import { authMiddleware, requireAuth } from '../middleware/authMiddleware.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;
    const result = await authService.register(name, email, password, confirmPassword, role);
    res.status(201).json({
      ...result,
      message: 'Account created successfully! Welcome to BUYGEN.'
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({
      ...result,
      message: 'Signed in successfully. Welcome back to BUYGEN!'
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/google', async (req, res, next) => {
  try {
    const { email, name } = req.body;
    const result = await authService.loginWithGoogle(email, name);
    res.json({
      ...result,
      message: 'Signed in with Google successfully.'
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/reset-password', async (req, res, next) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    const result = await authService.resetPassword(email, newPassword, confirmPassword);
    res.json({
      ...result,
      message: 'Password reset successfully! You are now logged in.'
    });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', authMiddleware, requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

authRouter.post('/logout', (_req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});
