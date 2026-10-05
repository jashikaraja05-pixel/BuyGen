import { storage } from '../config/storage.ts';
import { cartService } from './cartService.ts';
import { validateShippingAddress } from '../utils/validation.ts';
import type { 
  Order, 
  OrderStatus, 
  PaymentMethod, 
  ShippingInfo, 
  ShippingAddress, 
  CartItem, 
  User 
} from '../../types/index.ts';

// In-flight lock for duplicate submission prevention (TTL 10s)
const recentOrderLocks = new Map<string, number>();

export const orderService = {
  createOrder(
    user: User,
    data: {
      fullName: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      paymentMethod: PaymentMethod;
      idempotencyKey?: string;
      reservationId?: string;
    }
  ): Order {
    // 1. Validate shipping details
    const shippingValidation = validateShippingAddress(data);
    if (!shippingValidation.valid) {
      throw new Error(shippingValidation.error || 'Invalid shipping address details.');
    }

    // 2. Prevent duplicate submissions
    const lockKey = `${user.id}_${data.paymentMethod}_${data.pincode}`;
    const nowMs = Date.now();
    const lastSubmission = recentOrderLocks.get(lockKey);
    if (lastSubmission && nowMs - lastSubmission < 5000) {
      throw new Error('A checkout submission is already processing. Please wait a moment.');
    }
    recentOrderLocks.set(lockKey, nowMs);

    // Clean up old locks
    for (const [k, time] of recentOrderLocks.entries()) {
      if (nowMs - time > 30000) recentOrderLocks.delete(k);
    }

    // 3. Read user's cart
    const cart = cartService.getCart(user.id);
    if (!cart.items || cart.items.length === 0) {
      throw new Error('Your cart is empty. Please add products to your cart before checking out.');
    }

    const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const now = new Date().toISOString();

    const shippingAddress: ShippingAddress = {
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
      pincode: data.pincode.trim()
    };

    const initialShippingInfo: ShippingInfo = {
      carrier: 'BUYGEN Express Air Logistics',
      trackingNumber: 'BG-EXP-' + Math.floor(10000000 + Math.random() * 90000000),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
      }),
      currentStatus: 'Confirmed',
      currentLocation: 'Bangalore Central Fulfillment Hub',
      lastUpdated: now,
      checkpoints: [
        {
          id: 'cp-1',
          status: 'Pending',
          title: 'Order Placed & Payment Verified',
          description: 'Transaction authenticated. Order placed in dispatch queue.',
          location: 'BUYGEN Payment Gateway',
          timestamp: now,
          completed: true,
          current: false
        },
        {
          id: 'cp-2',
          status: 'Confirmed',
          title: 'Order Confirmed by Seller',
          description: 'Order confirmed and inventory reserved at central warehouse.',
          location: 'Bangalore Central Fulfillment Hub',
          timestamp: now,
          completed: true,
          current: true
        },
        {
          id: 'cp-3',
          status: 'Processing',
          title: 'Packed & Quality Verified',
          description: 'Device serial numbers scanned and sealed in tamper-evident packaging.',
          location: 'Electronic City Warehouse',
          timestamp: '',
          completed: false,
          current: false
        },
        {
          id: 'cp-4',
          status: 'Shipped',
          title: 'Dispatched via Air Courier',
          description: 'Package handed over to air express line haul partner.',
          location: 'Kempegowda Int. Cargo Terminal',
          timestamp: '',
          completed: false,
          current: false
        },
        {
          id: 'cp-5',
          status: 'Delivered',
          title: 'Out for Doorstep Delivery',
          description: 'Handed over to last-mile delivery executive with OTP delivery confirmation.',
          location: 'Destination Delivery Hub',
          timestamp: '',
          completed: false,
          current: false
        }
      ]
    };

    // 4. Validate stock and compute authoritative items
    const stockDecrements: { productId: string; decrement: number }[] = [];
    const verifiedItems: CartItem[] = [];

    for (const item of cart.items) {
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Invalid item quantity for "${item.name}".`);
      }

      const prod = storage.getProductById(item.productId);
      if (!prod) {
        throw new Error(`Product "${item.name}" is no longer available.`);
      }

      if (prod.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${prod.name}". Available: ${prod.stock} units, Requested: ${item.quantity} units.`
        );
      }

      stockDecrements.push({ productId: prod.id, decrement: item.quantity });
      verifiedItems.push({
        productId: prod.id,
        name: prod.name,
        brand: prod.brand,
        price: prod.price,
        originalPrice: prod.originalPrice || prod.price,
        image: prod.images && prod.images.length > 0 ? prod.images[0] : item.image,
        quantity: item.quantity,
        stock: Math.max(0, prod.stock - item.quantity),
        selectedColor: item.selectedColor
      });
    }

    const subtotal = verifiedItems.reduce((acc, it) => acc + (it.originalPrice || it.price) * it.quantity, 0);
    const total = verifiedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const discount = Math.max(0, subtotal - total);
    const deliveryFee = 0; // Free express electronics delivery

    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      customerName: shippingAddress.fullName,
      customerEmail: user.email,
      customerPhone: shippingAddress.phone,
      shippingAddress,
      items: verifiedItems,
      subtotal,
      discount,
      deliveryFee,
      total,
      paymentMethod: data.paymentMethod || 'UPI / Dynamic QR Code Pay',
      status: 'Confirmed',
      shippingInfo: initialShippingInfo,
      createdAt: now,
      updatedAt: now
    };

    // Execute atomic stock deduction and order persistence
    return storage.executeOrderTransaction(newOrder, stockDecrements, data.reservationId);
  },

  reserveStock(items: { productId: string; quantity: number }[]) {
    return storage.reserveStock(items);
  },

  releaseReservation(reservationId: string) {
    return storage.releaseReservation(reservationId);
  },

  getUserOrders(userId: string): Order[] {
    return storage.getUserOrders(userId);
  },

  getAllOrders(): Order[] {
    return storage.getAllOrders();
  },

  getOrderById(orderId: string, user: User): Order | null {
    const order = storage.getOrderById(orderId);
    if (!order) {
      return null;
    }

    // RBAC: Customers can only access their own orders; Admins can access any order
    if (user.role !== 'admin' && order.userId !== user.id) {
      throw new Error('UNAUTHORIZED_ORDER_ACCESS');
    }

    return order;
  },

  updateOrderStatus(orderId: string, status: OrderStatus): Order {
    const order = storage.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order "${orderId}" was not found.`);
    }

    const now = new Date().toISOString();
    const statusOrder: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    const targetIdx = statusOrder.indexOf(status);

    const updatedCheckpoints = (order.shippingInfo?.checkpoints || []).map((cp, idx) => {
      const isPastOrCurrent = idx <= targetIdx;
      const isCurrent = idx === targetIdx;
      return {
        ...cp,
        completed: isPastOrCurrent,
        current: isCurrent,
        timestamp: isPastOrCurrent ? (cp.timestamp || now) : ''
      };
    });

    const updatedShippingInfo: ShippingInfo = {
      ...(order.shippingInfo || {
        carrier: 'BUYGEN Express Air Logistics',
        trackingNumber: 'BG-EXP-' + orderId.slice(-8),
        estimatedDelivery: '3 Days',
        currentStatus: status,
        currentLocation: 'Transit Hub',
        lastUpdated: now,
        checkpoints: []
      }),
      currentStatus: status,
      lastUpdated: now,
      checkpoints: updatedCheckpoints
    };

    return storage.updateOrderStatus(orderId, status, updatedShippingInfo);
  }
};
