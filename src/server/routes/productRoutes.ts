import { Router } from 'express';
import { productService } from '../services/productService.ts';
import { reviewService } from '../services/reviewService.ts';
import { authMiddleware, requireAuth, requireAdmin } from '../middleware/authMiddleware.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const productRouter = Router();

// Public: Browse products with filters & search
productRouter.get('/', async (req, res, next) => {
  try {
    const { 
      category, 
      subcategory, 
      brand, 
      minPrice, 
      maxPrice, 
      minRating, 
      inStockOnly, 
      stockStatus, 
      search, 
      sortBy 
    } = req.query;

    const filters = {
      category: typeof category === 'string' ? category : undefined,
      subcategory: typeof subcategory === 'string' ? subcategory : undefined,
      brand: typeof brand === 'string' ? brand : undefined,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
      inStockOnly: inStockOnly === 'true',
      stockStatus: typeof stockStatus === 'string' ? stockStatus as any : undefined,
      search: typeof search === 'string' ? search : undefined,
      sortBy: typeof sortBy === 'string' ? sortBy as any : undefined
    };

    const result = await productService.getAllProducts(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Public: Get single product details, reviews & related items
productRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await productService.getProductById(id);

    if (!result.product) {
      return res.status(404).json({ error: `Product "${id}" not found.` });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Admin Only: Create single product
productRouter.post('/', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const product = await productService.createProduct(req.body, req.user?.email);
    res.status(201).json({
      product,
      message: 'Product created and persisted directly to Firestore successfully.'
    });
  } catch (err) {
    next(err);
  }
});

// Admin Only: Batch create products
productRouter.post('/batch', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of products to batch import.' });
    }

    const created = await productService.createProductsBatch(products, req.user?.email);
    res.status(201).json({
      products: created,
      message: `Successfully imported ${created.length} products to Firestore.`
    });
  } catch (err) {
    next(err);
  }
});

// Admin Only: Update product
productRouter.put('/:id', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const updated = await productService.updateProduct(id, req.body);
    res.json({
      product: updated,
      message: 'Product updated and persisted to Firestore successfully.'
    });
  } catch (err) {
    next(err);
  }
});

// Admin Only: Quick stock update
productRouter.patch('/:id/stock', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ error: 'Valid non-negative stock number is required.' });
    }

    const updated = await productService.updateStock(id, Number(stock));
    res.json({
      product: updated,
      message: `Stock updated to ${updated.stock} units in Firestore.`
    });
  } catch (err) {
    next(err);
  }
});

// Admin Only: Delete product
productRouter.delete('/:id', authMiddleware, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    res.json({
      success: true,
      message: `Product "${id}" deleted from Firestore.`
    });
  } catch (err) {
    next(err);
  }
});

// Customer: Check verified purchase eligibility for product reviews
productRouter.get('/:productId/verified-purchase', authMiddleware, requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { productId } = req.params;
    const result = await reviewService.getVerifiedPurchaseOrders(req.user!.id, productId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Customer: Submit verified product review
productRouter.post('/:productId/reviews', authMiddleware, requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment, orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Verified orderId is required to submit a product review.' });
    }

    const result = await reviewService.addReview(
      req.user!.id,
      req.user!.name,
      productId,
      rating,
      comment,
      orderId
    );

    res.status(201).json({
      ...result,
      message: 'Thank you! Your verified review has been published.'
    });
  } catch (err) {
    next(err);
  }
});
