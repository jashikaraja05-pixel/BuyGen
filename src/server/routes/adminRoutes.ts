import { Router } from 'express';
import { adminService } from '../services/adminService.ts';
import { productService } from '../services/productService.ts';
import { offerService } from '../services/offerService.ts';
import { storage } from '../config/storage.ts';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const adminRouter = Router();

// Strictly guard all admin endpoints with backend RBAC middleware
adminRouter.use(authMiddleware, requireAdmin);

// Dashboard Metrics
adminRouter.get('/metrics', async (req: AuthenticatedRequest, res, next) => {
  try {
    const adminEmail = typeof req.query.adminEmail === 'string' ? req.query.adminEmail : req.user?.email;
    const metrics = await adminService.getAdminMetrics(adminEmail);
    res.json(metrics);
  } catch (err) {
    next(err);
  }
});

// User Management
adminRouter.get('/users', async (_req: AuthenticatedRequest, res, next) => {
  try {
    const users = await adminService.getAdminUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/users/:id/role', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (role !== 'customer' && role !== 'admin') {
      return res.status(400).json({ error: 'Role must be either "customer" or "admin".' });
    }
    const user = adminService.updateUserRole(id, role, req.user?.id);
    res.json({ user, message: `User role updated to ${role} in Firestore.` });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update user role' });
  }
});

// Product Sales & Order Activity
adminRouter.get('/products/:id/activity', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const activity = await productService.getProductActivity(id);
    res.json(activity);
  } catch (err) {
    next(err);
  }
});

// Search Queries Analytics
adminRouter.get('/searches', async (_req: AuthenticatedRequest, res, next) => {
  try {
    const searches = await adminService.getAdminSearches();
    res.json({ searches });
  } catch (err) {
    next(err);
  }
});

// User Login Logs
adminRouter.get('/logins', async (_req: AuthenticatedRequest, res, next) => {
  try {
    const logins = await adminService.getAdminLogins();
    res.json({ logins });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/logins', async (_req: AuthenticatedRequest, res, next) => {
  try {
    await adminService.clearAdminLogins();
    res.json({ success: true, message: 'Login audit logs cleared.' });
  } catch (err) {
    next(err);
  }
});

// Promotional Offers & Banners
adminRouter.get('/offers', async (_req: AuthenticatedRequest, res, next) => {
  try {
    const offers = await offerService.getAdminOffers();
    res.json({ offers });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/offers', async (req: AuthenticatedRequest, res, next) => {
  try {
    const offer = await offerService.createOffer(req.body);
    res.status(201).json({
      offer,
      message: 'Promotional offer created in Firestore successfully.'
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/offers/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const offer = await offerService.updateOffer(id, req.body);
    res.json({
      offer,
      message: 'Promotional offer updated in Firestore.'
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/offers/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    await offerService.deleteOffer(id);
    res.json({ success: true, message: 'Promotional offer deleted from Firestore.' });
  } catch (err) {
    next(err);
  }
});

// Payment Gateways & Methods
adminRouter.get('/payment-methods', async (_req: AuthenticatedRequest, res, next) => {
  try {
    const paymentMethods = await adminService.getAdminPaymentMethods();
    res.json({ paymentMethods });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/payment-methods', async (req: AuthenticatedRequest, res, next) => {
  try {
    const paymentMethod = await adminService.createPaymentMethod(req.body);
    res.status(201).json({
      paymentMethod,
      message: 'Payment configuration saved to Firestore.'
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/payment-methods/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const paymentMethod = await adminService.updatePaymentMethod(id, req.body);
    res.json({
      paymentMethod,
      message: 'Payment configuration updated in Firestore.'
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/payment-methods/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    await adminService.deletePaymentMethod(id);
    res.json({ success: true, message: 'Payment method removed from Firestore.' });
  } catch (err) {
    next(err);
  }
});

// Complete Catalog Cleaner (Admin utility)
adminRouter.post('/clean-catalog', async (_req: AuthenticatedRequest, res, next) => {
  try {
    const result = await productService.cleanCatalog();
    res.json({
      success: true,
      message: 'Catalog cleaned completely from Firestore.',
      ...result
    });
  } catch (err) {
    next(err);
  }
});

// Seed Starter Catalog (Admin explicit trigger)
adminRouter.post('/seed-starter', async (_req: AuthenticatedRequest, res, next) => {
  try {
    const result = storage.seedStarterCatalog();
    res.json({
      success: true,
      message: 'Starter demo electronics catalog imported successfully.',
      ...result
    });
  } catch (err) {
    next(err);
  }
});
