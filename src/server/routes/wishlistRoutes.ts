import { Router } from 'express';
import { wishlistService } from '../services/wishlistService.ts';
import { authMiddleware, requireAuth } from '../middleware/authMiddleware.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const wishlistRouter = Router();

wishlistRouter.use(authMiddleware, requireAuth);

wishlistRouter.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.user!.id);
    res.json({ wishlist });
  } catch (err) {
    next(err);
  }
});

wishlistRouter.post('/toggle', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    const result = await wishlistService.toggleWishlist(req.user!.id, productId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
