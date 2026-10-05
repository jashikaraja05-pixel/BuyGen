import { storage } from '../config/storage.ts';
import type { CartItem, Product } from '../../types/index.ts';

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}

export const cartService = {
  getCart(userId: string): CartSummary {
    const rawItems: CartItem[] = storage.getCart(userId);
    const validItems: CartItem[] = [];

    // Re-validate against authoritative product details in persistent database
    for (const item of rawItems) {
      const prod = storage.getProductById(item.productId);
      if (prod) {
        const currentPrice = prod.price;
        const currentOriginalPrice = prod.originalPrice || currentPrice;
        const currentStock = prod.stock;

        let finalQty = item.quantity;
        if (currentStock > 0 && finalQty > currentStock) {
          finalQty = currentStock;
        }

        validItems.push({
          productId: prod.id,
          name: prod.name,
          brand: prod.brand,
          price: currentPrice,
          originalPrice: currentOriginalPrice,
          image: prod.images && prod.images.length > 0 ? prod.images[0] : item.image,
          quantity: finalQty,
          stock: currentStock,
          selectedColor: item.selectedColor
        });
      }
    }

    if (JSON.stringify(rawItems) !== JSON.stringify(validItems)) {
      storage.saveCart(userId, validItems);
    }

    const subtotal = validItems.reduce((acc, it) => acc + (it.originalPrice || it.price) * it.quantity, 0);
    const total = validItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const discount = Math.max(0, subtotal - total);

    return { items: validItems, subtotal, discount, total };
  },

  addToCart(userId: string, productId: string, quantity = 1, selectedColor?: string): CartSummary {
    const qty = Math.max(1, Math.floor(quantity));
    const product = storage.getProductById(productId);

    if (!product) {
      throw new Error('Product not found or has been removed.');
    }

    if (product.stock <= 0) {
      throw new Error(`"${product.name}" is currently out of stock.`);
    }

    const items: CartItem[] = storage.getCart(userId);
    const existingIdx = items.findIndex(
      it => it.productId === productId && (!selectedColor || it.selectedColor === selectedColor)
    );

    if (existingIdx >= 0) {
      const newTotalQty = items[existingIdx].quantity + qty;
      if (newTotalQty > product.stock) {
        throw new Error(
          `Cannot add ${qty} more unit(s). You already have ${items[existingIdx].quantity} in cart, and total stock is ${product.stock}.`
        );
      }
      items[existingIdx].quantity = newTotalQty;
      items[existingIdx].stock = product.stock;
      items[existingIdx].price = product.price;
      items[existingIdx].originalPrice = product.originalPrice || product.price;
    } else {
      if (qty > product.stock) {
        throw new Error(`Requested quantity (${qty}) exceeds available stock (${product.stock}).`);
      }
      items.push({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        quantity: qty,
        stock: product.stock,
        selectedColor
      });
    }

    storage.saveCart(userId, items);
    return this.getCart(userId);
  },

  updateQuantity(userId: string, productId: string, quantity: number): CartSummary {
    let items: CartItem[] = storage.getCart(userId);

    if (quantity <= 0) {
      items = items.filter(it => it.productId !== productId);
    } else {
      const prod = storage.getProductById(productId);
      if (prod && quantity > prod.stock) {
        throw new Error(`Cannot update quantity to ${quantity}. Maximum available stock is ${prod.stock}.`);
      }

      items = items.map(it => {
        if (it.productId === productId) {
          return { ...it, quantity: Math.floor(quantity) };
        }
        return it;
      });
    }

    storage.saveCart(userId, items);
    return this.getCart(userId);
  },

  removeFromCart(userId: string, productId: string): CartSummary {
    const items = storage.getCart(userId).filter(it => it.productId !== productId);
    storage.saveCart(userId, items);
    return this.getCart(userId);
  },

  clearCart(userId: string): CartSummary {
    storage.saveCart(userId, []);
    return { items: [], subtotal: 0, discount: 0, total: 0 };
  }
};
