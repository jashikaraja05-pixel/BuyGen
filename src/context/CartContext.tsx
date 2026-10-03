import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number, selectedColor?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  toastMessage: string | null;
  clearToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setSubtotal(0);
      setDiscount(0);
      setTotal(0);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getCart();
      setItems(data.items || []);
      setSubtotal(data.subtotal || 0);
      setDiscount(data.discount || 0);
      setTotal(data.total || 0);
    } catch {
      // ignore guest or network error
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity: number = 1, selectedColor?: string) => {
    if (!user) {
      showToast('Please log in to add items to your cart.');
      throw new Error('Please log in first');
    }
    try {
      setLoading(true);
      const res = await api.addToCart(productId, quantity, selectedColor);
      setItems(res.items);
      setSubtotal(res.subtotal);
      setDiscount(res.discount);
      setTotal(res.total);
      showToast('Item successfully added to cart!');
    } catch (err: any) {
      showToast(err.message || 'Could not add to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;
    try {
      const res = await api.updateCartQuantity(productId, quantity);
      setItems(res.items);
      setSubtotal(res.subtotal);
      setDiscount(res.discount);
      setTotal(res.total);
    } catch (err: any) {
      showToast(err.message || 'Could not update quantity');
      throw err;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;
    try {
      const res = await api.removeFromCart(productId);
      setItems(res.items);
      setSubtotal(res.subtotal);
      setDiscount(res.discount);
      setTotal(res.total);
      showToast('Item removed from cart');
    } catch (err: any) {
      showToast(err.message || 'Could not remove item');
      throw err;
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      const res = await api.clearCart();
      setItems(res.items || []);
      setSubtotal(0);
      setDiscount(0);
      setTotal(0);
    } catch (err: any) {
      console.error(err);
    }
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount,
        total,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        toastMessage,
        clearToast: () => setToastMessage(null)
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
