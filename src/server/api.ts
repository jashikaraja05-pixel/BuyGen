import { Router } from 'express';
import { authRouter } from './routes/authRoutes.ts';
import { productRouter } from './routes/productRoutes.ts';
import { categoryRouter } from './routes/categoryRoutes.ts';
import { brandRouter } from './routes/brandRoutes.ts';
import { cartRouter } from './routes/cartRoutes.ts';
import { wishlistRouter } from './routes/wishlistRoutes.ts';
import { orderRouter } from './routes/orderRoutes.ts';
import { adminRouter } from './routes/adminRoutes.ts';
import { aiRouter } from './routes/aiRoutes.ts';
import { miscRouter } from './routes/miscRoutes.ts';
import { errorMiddleware } from './middleware/errorMiddleware.ts';
import { storage } from './config/storage.ts';

export const apiRouter = Router();

// Boot check: initialize persistent storage and sync with Cloud Firestore
storage.initAndSync().catch(err => {
  console.warn('[BUYGEN API] Storage sync note:', err);
});

// Mount modular sub-routers
apiRouter.use('/auth', authRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/brands', brandRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/wishlist', wishlistRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/', miscRouter);

// Global centralized error handler
apiRouter.use(errorMiddleware);
