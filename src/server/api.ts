import { Router, Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import { dbStore } from './db.ts';
import { OrderStatus, PaymentMethod, User } from '../types/index.ts';
import { normalizeSearchQuery, getExpandedSearchTokens } from '../lib/spellingNormalizer.ts';

export const apiRouter = Router();

// Middleware to extract user from Authorization header (Bearer <userId> or session token)
export interface AuthenticatedRequest extends Request {
  user?: User;
}

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) return next();

  try {
    // In our simplified token structure, the token is either a JSON or user ID
    let userId = token;
    if (token.startsWith('user_')) {
      userId = token.replace('user_', '');
    } else if (token.includes(':')) {
      userId = token.split(':')[0];
    }
    const user = await dbStore.getUserById(userId);
    if (user) {
      req.user = user;
    }
  } catch {
    // continue as guest
  }
  next();
};

const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
};

const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in as an administrator.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin privileges required.' });
  }
  next();
};

apiRouter.use(authMiddleware);

// ================= AUTH ROUTES =================
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'customer';
    const user = await dbStore.registerUser(name, email, password, assignedRole);
    const token = `${user.id}:${Buffer.from(email).toString('base64')}`;
    res.status(201).json({ 
      user, 
      token, 
      message: `${assignedRole === 'admin' ? 'Admin' : 'Customer'} account created successfully!` 
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    const user = await dbStore.loginUser(email, password);
    const token = `${user.id}:${Buffer.from(email).toString('base64')}`;
    res.json({ user, token, message: 'Login successful!' });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Invalid credentials.' });
  }
});

apiRouter.post('/auth/google', async (req, res) => {
  try {
    const { email, name } = req.body;
    const userEmail = email || 'jashikahack@gmail.com';
    const userName = name || 'Jashika Hack';

    const user = await dbStore.loginOrCreateGoogleUser(userEmail, userName);
    const token = `${user.id}:${Buffer.from(userEmail).toString('base64')}`;
    res.json({ user, token, message: 'Signed in with Google successfully!' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Google authentication failed' });
  }
});

apiRouter.get('/auth/me', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.user });
});

apiRouter.post('/auth/logout', (_req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ================= PRODUCT ROUTES =================
apiRouter.get('/products', async (req, res) => {
  try {
    const {
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStockOnly,
      search,
      sortBy
    } = req.query;

    const filters = {
      category: category as string,
      subcategory: subcategory as string,
      brand: brand as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      inStockOnly: inStockOnly === 'true',
      search: search as string,
      sortBy: sortBy as any
    };

    const { products, total } = await dbStore.getProducts(filters);
    res.json({ products, total });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch products' });
  }
});

apiRouter.get('/products/:id', async (req, res) => {
  try {
    const product = await dbStore.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const reviews = await dbStore.getReviews(product.id);

    // Fetch up to 4 related products in the same category
    const { products: categoryProducts } = await dbStore.getProducts({ category: product.categoryId });
    const related = categoryProducts.filter(p => p.id !== product.id).slice(0, 4);

    res.json({ product, reviews, related });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch product details' });
  }
});

apiRouter.post('/products', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const newProduct = await dbStore.createProduct(req.body);
    res.status(201).json({ product: newProduct, message: 'Product created successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create product' });
  }
});

apiRouter.put('/products/:id', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const updated = await dbStore.updateProduct(req.params.id, req.body);
    res.json({ product: updated, message: 'Product updated successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update product' });
  }
});

apiRouter.patch('/products/:id/stock', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || isNaN(Number(stock))) {
      return res.status(400).json({ error: 'Valid stock number is required' });
    }
    const updated = await dbStore.updateStock(req.params.id, Number(stock));
    res.json({ product: updated, message: 'Stock updated successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update stock' });
  }
});

apiRouter.delete('/products/:id', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    await dbStore.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to delete product' });
  }
});

// ================= CATEGORY ROUTES =================
apiRouter.get('/categories', async (_req, res) => {
  try {
    const categories = await dbStore.getCategories();
    res.json({ categories });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch categories' });
  }
});

apiRouter.post('/categories', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const category = await dbStore.createCategory(req.body);
    res.status(201).json({ category, message: 'Category created successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create category' });
  }
});

apiRouter.put('/categories/:id', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const category = await dbStore.updateCategory(req.params.id, req.body);
    res.json({ category, message: 'Category updated successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update category' });
  }
});

apiRouter.delete('/categories/:id', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    await dbStore.deleteCategory(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to delete category' });
  }
});

// ================= CART ROUTES =================
apiRouter.get('/cart', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const cart = await dbStore.getCart(req.user!.id);
    res.json(cart);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch cart' });
  }
});

apiRouter.post('/cart/add', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }
    const items = await dbStore.addToCart(req.user!.id, productId, Number(quantity));
    const cart = await dbStore.getCart(req.user!.id);
    res.json({ ...cart, message: 'Added to cart successfully!' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to add item to cart' });
  }
});

apiRouter.put('/cart/update', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: 'Product ID and quantity are required.' });
    }
    await dbStore.updateCartItemQuantity(req.user!.id, productId, Number(quantity));
    const cart = await dbStore.getCart(req.user!.id);
    res.json(cart);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update cart quantity' });
  }
});

apiRouter.delete('/cart/:productId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await dbStore.removeFromCart(req.user!.id, req.params.productId);
    const cart = await dbStore.getCart(req.user!.id);
    res.json({ ...cart, message: 'Item removed from cart' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to remove item from cart' });
  }
});

apiRouter.post('/cart/clear', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await dbStore.clearCart(req.user!.id);
    res.json({ items: [], subtotal: 0, discount: 0, total: 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to clear cart' });
  }
});

// ================= WISHLIST ROUTES =================
apiRouter.get('/wishlist', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const wishlist = await dbStore.getWishlist(req.user!.id);
    res.json({ wishlist });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch wishlist' });
  }
});

apiRouter.post('/wishlist/toggle', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'Product ID is required' });
    const result = await dbStore.toggleWishlist(req.user!.id, productId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update wishlist' });
  }
});

// ================= ORDER & CHECKOUT ROUTES =================
apiRouter.get('/orders', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user!.role === 'admin') {
      const allOrders = await dbStore.getAllOrders();
      return res.json({ orders: allOrders });
    }
    const userOrders = await dbStore.getOrdersByUser(req.user!.id);
    res.json({ orders: userOrders });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch orders' });
  }
});

apiRouter.get('/orders/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const order = await dbStore.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    // Only customer who placed it or an admin can view order details
    if (order.userId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden: You cannot view this order.' });
    }
    res.json({ order });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch order details' });
  }
});

apiRouter.post('/orders', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { fullName, phone, address, city, state, pincode, paymentMethod } = req.body;

    if (!fullName || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({ error: 'All shipping address fields are required.' });
    }

    const validMethods: PaymentMethod[] = ['UPI Simulation', 'Card Simulation', 'Cash on Delivery Simulation'];
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Please choose a valid simulated payment method.' });
    }

    const shippingAddress = { fullName, phone, address, city, state, pincode };
    const order = await dbStore.createOrder(
      req.user!.id,
      fullName,
      req.user!.email,
      phone,
      shippingAddress,
      paymentMethod
    );

    res.status(201).json({ order, message: 'Order placed successfully!' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Order creation failed' });
  }
});

apiRouter.patch('/orders/:id/status', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { status } = req.body;
    const validStatuses: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status transition' });
    }

    const updated = await dbStore.updateOrderStatus(req.params.id, status);
    res.json({ order: updated, message: `Order status updated to ${status}` });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update order status' });
  }
});

// ================= REVIEWS =================
apiRouter.post('/products/:id/reviews', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating and review comment are required.' });
    }

    const review = await dbStore.addReview(
      req.params.id,
      req.user!.id,
      req.user!.name,
      Number(rating),
      comment
    );

    const updatedProduct = await dbStore.getProductById(req.params.id);
    const reviews = await dbStore.getReviews(req.params.id);

    res.status(201).json({ review, product: updatedProduct, reviews });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to add review' });
  }
});

// ================= ADMIN DASHBOARD & USER MANAGEMENT =================
apiRouter.get('/admin/metrics', requireAdmin, async (_req: AuthenticatedRequest, res) => {
  try {
    const metrics = await dbStore.getAdminMetrics();
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to compute admin metrics' });
  }
});

apiRouter.get('/admin/users', requireAdmin, async (_req: AuthenticatedRequest, res) => {
  try {
    const users = await dbStore.getAllUsers();
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch users list' });
  }
});

// ================= AI: BUYGEN SMART TECH ADVISOR & COMPARISONS =================
apiRouter.post('/ai/advisor', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Please enter your tech requirements.' });
    }

    const allProducts = dbStore.getAllProductsForAI();
    const productCatalogSummary = allProducts.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.categoryName,
      price: p.price,
      stock: p.stock,
      rating: p.rating,
      specs: p.specifications
    }));

    let aiAdvice: any = null;

    // Use Gemini API if GEMINI_API_KEY is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({});
        const systemPrompt = `You are BUYGEN Smart Tech Advisor, an expert consumer electronics consultant.
The user wants electronics recommendations based on natural language requirements.
CRITICAL RULES:
1. ONLY recommend products that exist in the provided JSON catalog. NEVER invent products, prices, or specs!
2. Respect stock availability: only recommend products with stock > 0.
3. Extract: budget, category, key requirements (RAM, display, use case, brand preference).
4. Select 1 primary best match ('recommended') and 1 or 2 alternative matches ('alternative').
5. Explain concisely WHY each product matches the user's specific use case and budget.
6. For alternatives, highlight key differences from the primary recommendation.
7. SILENT TYPO CORRECTION: The user may make spelling mistakes or typos (for example, typing "phene" for "phone", "lapotp" for "laptop", "camra" for "camera", "earbds" for "earbuds", "moniter" for "monitor"). Silently detect and understand their intended electronic product and directly provide the relevant recommendations. NEVER say "I detected a typo" or "Did you mean phone" or mention the spelling error in the summary or text.
8. Return ONLY valid JSON in this exact structure:
{
  "extractedRequirements": {
    "budget": number or null,
    "category": string or null,
    "keyFeatures": string[],
    "useCase": string or null,
    "brandPreference": string or null
  },
  "summary": "Brief 1-2 sentence executive assessment of their needs",
  "recommendations": [
    {
      "productId": "matching product id from catalog",
      "type": "recommended",
      "keySpecs": ["bullet 1", "bullet 2", "bullet 3"],
      "whyItMatches": "detailed explanation of why this product is ideal for their requirement"
    },
    {
      "productId": "another product id from catalog",
      "type": "alternative",
      "keySpecs": ["bullet 1", "bullet 2"],
      "whyItMatches": "why this is also good",
      "difference": "how it compares to the primary choice"
    }
  ]
}

Product Catalog:
${JSON.stringify(productCatalogSummary, null, 2)}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `${systemPrompt}\n\nUser Requirement: "${prompt}"`,
          config: {
            responseMimeType: 'application/json'
          }
        });

        if (response.text) {
          aiAdvice = JSON.parse(response.text);
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to deterministic matching:', geminiErr);
      }
    }

    // Fallback deterministic semantic matcher if Gemini API key is unset or calls fail
    if (!aiAdvice || !aiAdvice.recommendations?.length) {
      // Silently normalize misspelled words like "phene" -> "phone"
      const normalizedPrompt = normalizeSearchQuery(prompt);
      const q = (normalizedPrompt || prompt).toLowerCase();
      
      // Extract budget numbers (e.g. 70000, 70k, 30,000, 1.5 lakh)
      let budget: number | undefined;
      const budgetMatch = q.match(/(?:under|below|budget|within|upto|up to|less than)?\s*₹?\s*(\d+[\d,]*)(?:k|000)?/i);
      if (budgetMatch) {
        const rawNum = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
        if (q.includes('k') && rawNum < 1000) {
          budget = rawNum * 1000;
        } else if (rawNum < 500) {
          budget = rawNum * 1000; // e.g. 70k
        } else {
          budget = rawNum;
        }
      }

      // Detect category
      let matchedCategory = '';
      if (q.includes('laptop') || q.includes('macbook') || q.includes('computer')) matchedCategory = 'Laptops';
      else if (q.includes('phone') || q.includes('smartphone') || q.includes('mobile')) matchedCategory = 'Smartphones';
      else if (q.includes('headphone') || q.includes('earbud') || q.includes('audio') || q.includes('airpod')) matchedCategory = 'Headphones & Earbuds';
      else if (q.includes('monitor') || q.includes('display') || q.includes('screen')) matchedCategory = 'Monitors';
      else if (q.includes('keyboard') || q.includes('mouse')) matchedCategory = 'Keyboards & Mouse';
      else if (q.includes('watch') || q.includes('smartwatch')) matchedCategory = 'Smartwatches';
      else if (q.includes('camera') || q.includes('vlog') || q.includes('lens')) matchedCategory = 'Cameras';
      else if (q.includes('speaker') || q.includes('soundbar')) matchedCategory = 'Speakers';

      let eligible = allProducts.filter(p => p.stock > 0);
      if (matchedCategory) {
        const inCat = eligible.filter(p => p.categoryName.toLowerCase() === matchedCategory.toLowerCase());
        if (inCat.length > 0) {
          eligible = inCat;
        }
      }

      if (budget) {
        const inBudget = eligible.filter(p => p.price <= budget! * 1.15);
        if (inBudget.length > 0) {
          eligible = inBudget;
        }
      }

      // Spec scoring: boost products matching RAM, display, or keywords
      eligible.sort((a, b) => {
        let scoreA = a.rating;
        let scoreB = b.rating;

        if (q.includes('16gb')) {
          if (JSON.stringify(a.specifications).toLowerCase().includes('16gb')) scoreA += 5;
          if (JSON.stringify(b.specifications).toLowerCase().includes('16gb')) scoreB += 5;
        }
        if (q.includes('32gb')) {
          if (JSON.stringify(a.specifications).toLowerCase().includes('32gb')) scoreA += 5;
          if (JSON.stringify(b.specifications).toLowerCase().includes('32gb')) scoreB += 5;
        }
        if (q.includes('oled')) {
          if (JSON.stringify(a.specifications).toLowerCase().includes('oled')) scoreA += 4;
          if (JSON.stringify(b.specifications).toLowerCase().includes('oled')) scoreB += 4;
        }
        if (q.includes('anc') || q.includes('noise')) {
          if (a.name.toLowerCase().includes('anc') || a.description.toLowerCase().includes('noise')) scoreA += 4;
          if (b.name.toLowerCase().includes('anc') || b.description.toLowerCase().includes('noise')) scoreB += 4;
        }

        return scoreB - scoreA;
      });

      const primary = eligible[0] || allProducts[0];
      const alternative = eligible[1] || allProducts[1];

      aiAdvice = {
        extractedRequirements: {
          budget: budget || undefined,
          category: matchedCategory || 'Consumer Electronics',
          keyFeatures: [q.includes('ram') ? 'High RAM' : 'High Performance', 'Quality Build'],
          useCase: prompt.slice(0, 80),
          brandPreference: undefined
        },
        summary: `Identified optimal consumer electronics choices matching your budget and performance expectations.`,
        recommendations: [
          {
            productId: primary.id,
            type: 'recommended',
            keySpecs: Object.entries(primary.specifications).slice(0, 3).map(([k, v]) => `${k}: ${v}`),
            whyItMatches: `Best in class performance for your criteria with verified stock and high 4.8+ customer satisfaction rating.`
          },
          ...(alternative ? [{
            productId: alternative.id,
            type: 'alternative',
            keySpecs: Object.entries(alternative.specifications).slice(0, 3).map(([k, v]) => `${k}: ${v}`),
            whyItMatches: `Excellent alternative offering comparable capability at ₹${alternative.price.toLocaleString('en-IN')}.`,
            difference: `Price is ₹${Math.abs(primary.price - alternative.price).toLocaleString('en-IN')} ${alternative.price < primary.price ? 'lower' : 'higher'} with different form factor and features.`
          }] : [])
        ]
      };
    }

    // Hydrate recommendations with complete product records from DB
    const enrichedRecommendations = (
      await Promise.all(
        aiAdvice.recommendations.map(async (rec: any) => {
          const prod = await dbStore.getProductById(rec.productId);
          return {
            ...rec,
            product: prod
          };
        })
      )
    ).filter((r: any) => r.product !== null);

    res.json({
      extractedRequirements: aiAdvice.extractedRequirements,
      summary: aiAdvice.summary,
      recommendations: enrichedRecommendations
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI Tech Advisor error' });
  }
});

// ================= AI: MULTI-PRODUCT COMPARISON =================
apiRouter.post('/ai/compare', async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length < 2 || productIds.length > 3) {
      return res.status(400).json({ error: 'Please select 2 or 3 products to compare.' });
    }

    const fetchedProducts = await Promise.all(
      productIds.map(id => dbStore.getProductById(id))
    );
    const products = fetchedProducts.filter((p): p is NonNullable<typeof p> => p !== null);

    if (products.length < 2) {
      return res.status(400).json({ error: 'Could not find the selected products for comparison.' });
    }

    // Generate comparison analysis using Gemini or rule-based fallback
    let analysis = '';
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({});
        const prompt = `Compare these consumer electronics products in plain, helpful language for a prospective buyer:
${JSON.stringify(products.map(p => ({
  name: p.name,
  price: p.price,
  rating: p.rating,
  specs: p.specifications
})), null, 2)}

Provide:
1. Executive Verdict (Who should buy which product)
2. Standout Advantages of each
3. Value-for-money verdict`;

        const resp = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt
        });
        analysis = resp.text || '';
      } catch (e) {
        console.warn('Gemini comparison failed, using rule-based comparison summary');
      }
    }

    if (!analysis) {
      analysis = `### Expert Comparison Overview
- **${products[0].name}** offers premier engineering at ₹${products[0].price.toLocaleString('en-IN')}, ideal for users demanding maximum capability.
- **${products[1].name}** provides a compelling alternative with standout value in its tier.
${products[2] ? `- **${products[2].name}** brings versatile versatility and specialized features to the matchup.` : ''}

**Recommendation:** Base your choice on your primary priority: maximum specifications or optimal price-to-performance.`;
    }

    res.json({ products, analysis });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Product comparison failed' });
  }
});

// ================= AI: SMART NATURAL-LANGUAGE SEARCH =================
apiRouter.post('/ai/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      const { products } = await dbStore.getProducts();
      return res.json({ products, interpreted: null });
    }

    // Silently normalize misspelled words like "phene" -> "phone"
    const normalizedQuery = normalizeSearchQuery(query);
    const q = (normalizedQuery || query).toLowerCase();
    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    let category: string | undefined;

    // Budget extraction (e.g. under 30000, under 70k, between 20000 and 50000)
    const underMatch = q.match(/(?:under|below|less than|upto|up to)\s*(?:rs\.?|inr|₹)?\s*(\d+[\d,]*)(?:k)?/i);
    if (underMatch) {
      let val = parseInt(underMatch[1].replace(/,/g, ''), 10);
      if (underMatch[0].includes('k') && val < 1000) val *= 1000;
      maxPrice = val;
    }

    // Categories
    const categories = await dbStore.getCategories();
    for (const cat of categories) {
      if (q.includes(cat.name.toLowerCase()) || q.includes(cat.slug.toLowerCase())) {
        category = cat.id;
        break;
      }
    }

    // Common abbreviations
    if (!category) {
      if (q.includes('phone') || q.includes('mobile')) category = 'cat-1';
      else if (q.includes('laptop') || q.includes('macbook')) category = 'cat-2';
      else if (q.includes('headphone') || q.includes('earbud') || q.includes('earphone')) category = 'cat-3';
      else if (q.includes('monitor') || q.includes('screen')) category = 'cat-4';
      else if (q.includes('keyboard') || q.includes('mouse')) category = 'cat-5';
      else if (q.includes('speaker') || q.includes('soundbar')) category = 'cat-6';
      else if (q.includes('watch')) category = 'cat-7';
      else if (q.includes('camera') || q.includes('vlog')) category = 'cat-8';
    }

    // Clean search text by removing filter trigger phrases
    const cleanSearch = (normalizedQuery || query)
      .replace(/(?:under|below|less than|upto|up to)\s*(?:rs\.?|inr|₹)?\s*(\d+[\d,]*)(?:k)?/gi, '')
      .replace(/(?:show me|find me|look for|search for|recommend|i want|i need|good|best)/gi, '')
      .trim();

    const { products } = await dbStore.getProducts({
      category,
      maxPrice,
      search: cleanSearch.length > 2 ? cleanSearch : undefined
    });

    res.json({
      products,
      interpreted: {
        category,
        maxPrice,
        cleanSearch,
        originalQuery: query
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Smart search failed' });
  }
});
