import { Router } from 'express';
import { brandService } from '../services/brandService.ts';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const brandRouter = Router();

// Public: Get all brands (with optional category filter)
brandRouter.get('/', async (req, res, next) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const brands = await brandService.getAllBrands(category);
    res.json({ brands });
  } catch (err) {
    next(err);
  }
});

// Public: Get single brand
brandRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const brand = await brandService.getBrandById(id);
    if (!brand) {
      return res.status(404).json({ error: `Brand "${id}" was not found.` });
    }
    res.json({ brand });
  } catch (err) {
    next(err);
  }
});

// Admin Only: Create brand
brandRouter.post('/', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const brand = await brandService.createBrand(req.body);
    res.status(201).json({
      brand,
      message: `Brand "${brand.name}" created in Firestore successfully.`
    });
  } catch (err) {
    next(err);
  }
});

// Admin Only: Update brand
brandRouter.put('/:id', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const brand = await brandService.updateBrand(id, req.body);
    res.json({
      brand,
      message: `Brand "${brand.name}" updated in Firestore successfully.`
    });
  } catch (err) {
    next(err);
  }
});

// Admin Only: Delete brand
brandRouter.delete('/:id', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    await brandService.deleteBrand(id);
    res.json({
      success: true,
      message: `Brand "${id}" deleted from Firestore.`
    });
  } catch (err) {
    next(err);
  }
});
