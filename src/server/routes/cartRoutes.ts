import { Router } from 'express';
import { cartService } from '../services/cartService.ts';
import { authMiddleware, requireAuth } from '../middleware/authMiddleware.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const cartRouter = Router();

// All cart endpoints require user authentication
cartRouter.use(authMiddleware, requireAuth);

cartRouter.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const summary = await cartService.getCart(req.user!.id);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

cartRouter.post('/add', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { productId, quantity, selectedColor } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    const summary = await cartService.addToCart(req.user!.id, productId, quantity || 1, selectedColor);
    res.status(201).json({
      ...summary,
      message: 'Product added to your cart successfully.'
    });
  } catch (err) {
    next(err);
  }
});

cartRouter.put('/update', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: 'Product ID and quantity are required.' });
    }

    const summary = await cartService.updateQuantity(req.user!.id, productId, Number(quantity));
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

cartRouter.delete('/:productId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { productId } = req.params;
    const summary = await cartService.removeFromCart(req.user!.id, productId);
    res.json({
      ...summary,
      message: 'Item removed from cart.'
    });
  } catch (err) {
    next(err);
  }
});

cartRouter.post('/clear', async (req: AuthenticatedRequest, res, next) => {
  try {
    const summary = await cartService.clearCart(req.user!.id);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});
