import { Router } from 'express';
import { categoryService } from '../services/categoryService.ts';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const categoryRouter = Router();

// Public: Get all categories
categoryRouter.get('/', async (_req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

// Admin Only: Create category
categoryRouter.post('/', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({
      category,
      message: 'Category created and persisted to Firestore successfully.'
    });
  } catch (err) {
    next(err);
  }
});

// Admin Only: Update category
categoryRouter.put('/:id', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoryService.updateCategory(id, req.body);
    res.json({
      category,
      message: 'Category updated in Firestore successfully.'
    });
  } catch (err) {
    next(err);
  }
});

// Admin Only: Delete category
categoryRouter.delete('/:id', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id);
    res.json({
      success: true,
      message: `Category "${id}" deleted from Firestore.`
    });
  } catch (err) {
    next(err);
  }
});

// Admin Only: Clear all categories
categoryRouter.delete('/all/clear', authMiddleware, requireAdmin, async (_req: AuthenticatedRequest, res, next) => {
  try {
    await categoryService.clearAllCategories();
    res.json({
      success: true,
      message: 'All categories cleared from Firestore.'
    });
  } catch (err) {
    next(err);
  }
});
