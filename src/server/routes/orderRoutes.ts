import { Router } from 'express';
import { orderService } from '../services/orderService.ts';
import { authMiddleware, requireAuth, requireAdmin } from '../middleware/authMiddleware.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const orderRouter = Router();

// Customer: Reserve stock during checkout initiation (Buy Now / Cart checkout)
orderRouter.post('/reserve', authMiddleware, requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Please specify items to reserve.' });
    }
    const result = orderService.reserveStock(items);
    res.json(result);
  } catch (err: any) {
    if (err.message && err.message.includes('Insufficient stock')) {
      return res.status(409).json({ error: err.message, code: 'STOCK_ERROR' });
    }
    next(err);
  }
});

// Customer: Release stock reservation if checkout is cancelled
orderRouter.post('/release-reservation', authMiddleware, requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { reservationId } = req.body;
    if (!reservationId) {
      return res.status(400).json({ error: 'reservationId is required.' });
    }
    orderService.releaseReservation(reservationId);
    res.json({ success: true, message: 'Stock reservation released successfully.' });
  } catch (err) {
    next(err);
  }
});

// Customer: Place order (atomic stock decrement in Firestore)
orderRouter.post('/', authMiddleware, requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const order = await orderService.createOrder(req.user!, req.body);
    res.status(201).json({
      order,
      message: `Order #${order.id} placed and confirmed successfully! Stock updated in Firestore.`
    });
  } catch (err: any) {
    if (err.message && err.message.includes('Insufficient stock')) {
      return res.status(409).json({ error: err.message, code: 'STOCK_ERROR' });
    }
    next(err);
  }
});

// Authenticated: Get orders list (Customers see their own orders; Admins see all store orders)
orderRouter.get('/', authMiddleware, requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    let orders;
    if (req.user!.role === 'admin') {
      orders = await orderService.getAllOrders();
    } else {
      orders = await orderService.getUserOrders(req.user!.id);
    }
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// Authenticated: Get single order details with ownership verification
orderRouter.get('/:id', authMiddleware, requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id, req.user!);

    if (!order) {
      return res.status(404).json({ error: `Order "${id}" was not found.` });
    }

    res.json({ order });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ORDER_ACCESS') {
      return res.status(403).json({ 
        error: 'Access denied: You do not have permission to view this customer order.',
        code: 'FORBIDDEN'
      });
    }
    next(err);
  }
});

// Admin Only: Update order status (Pending -> Confirmed -> Processing -> Shipped -> Delivered)
orderRouter.patch('/:id/status', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'New order status is required.' });
    }

    const order = await orderService.updateOrderStatus(id, status);
    res.json({
      order,
      message: `Order #${id} status updated to ${status} in Firestore.`
    });
  } catch (err) {
    next(err);
  }
});
