import { Router } from 'express';
import { offerService } from '../services/offerService.ts';
import { adminService } from '../services/adminService.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const miscRouter = Router();

// Public: Get active promotional offers & banners
miscRouter.get('/offers', async (_req, res, next) => {
  try {
    const offers = await offerService.getOffers();
    res.json({ offers });
  } catch (err) {
    next(err);
  }
});

// Public: Get active payment methods for customer checkout
miscRouter.get('/payment-methods', async (_req, res, next) => {
  try {
    const paymentMethods = await adminService.getPaymentMethods();
    res.json({ paymentMethods });
  } catch (err) {
    next(err);
  }
});

// Customer: Log search query for analytics
miscRouter.post('/search-log', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { query, resultsCount } = req.body;
    if (query && typeof query === 'string') {
      await adminService.logSearch(
        query,
        resultsCount || 0,
        req.user?.name || 'Guest User',
        req.user?.email || 'guest@buygen.com'
      );
    }
    res.json({ success: true });
  } catch {
    res.json({ success: false });
  }
});
