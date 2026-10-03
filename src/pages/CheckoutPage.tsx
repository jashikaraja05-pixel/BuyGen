import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Lock, 
  AlertCircle, 
  ChevronRight,
  CheckCircle2,
  Package
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import type { PaymentMethod } from '../types/index.ts';

interface CheckoutPageProps {
  navigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { items, itemCount, subtotal, discount, total, refreshCart } = useCart();

  // Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('Flat 402, HighTech Tower, Cyber City');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560100');

  // Simulated Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI Simulation');
  const [upiId, setUpiId] = useState('buygen.user@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (processing) return; // Anti-duplicate submission guard

    // Validation
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      setError('Please complete all shipping address fields.');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Call real backend endpoint to validate stock and record order
      const res = await api.createOrder({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        paymentMethod
      });

      // Refresh cart state to reflect newly placed order
      await refreshCart();

      // Navigate to order confirmation
      navigate(`/order-success/${res.order.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place simulated order. Please verify stock availability.');
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
          <span>Safe & Secure Flow</span>
          <span>•</span>
          <span>Simulation Mode</span>
        </div>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-900">
          Simulated Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          No real transactions occur. Orders are stored persistently in our database.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Side: Shipping Address & Payment Selection */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                1
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-slate-900">
                  Shipping Destination
                </h2>
                <p className="text-xs text-slate-500">Where should we dispatch your electronics?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Street Address / Flat / Floor *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Postal Pincode *
                </label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Simulation */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                2
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-slate-900">
                  Payment Simulation
                </h2>
                <p className="text-xs text-slate-500">Select payment simulation mode (No real financial charge)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI Simulation')}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'UPI Simulation'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Smartphone className={`w-5 h-5 ${paymentMethod === 'UPI Simulation' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {paymentMethod === 'UPI Simulation' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">UPI Simulator</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">GPay / PhonePe / QR</p>
                </div>
              </button>

              {/* Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Card Simulation')}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'Card Simulation'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className={`w-5 h-5 ${paymentMethod === 'Card Simulation' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {paymentMethod === 'Card Simulation' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">Card Simulator</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Credit or Debit Card</p>
                </div>
              </button>

              {/* COD */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash on Delivery Simulation')}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'Cash on Delivery Simulation'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Banknote className={`w-5 h-5 ${paymentMethod === 'Cash on Delivery Simulation' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {paymentMethod === 'Cash on Delivery Simulation' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">COD Simulator</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pay on Delivery</p>
                </div>
              </button>

            </div>

            {/* Simulation details panel */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-3">
              {paymentMethod === 'UPI Simulation' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Simulated UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Instant simulated approval on submission.</p>
                </div>
              )}

              {paymentMethod === 'Card Simulation' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Simulated Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'Cash on Delivery Simulation' && (
                <p className="text-slate-600">
                  Simulated Cash on Delivery selected. Pay upon physical delivery of package.
                </p>
              )}
            </div>

          </div>

        </div>

        {/* Right Side: Order Summary & Place Order Button */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6 sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" />
              <span>Order Summary</span>
            </h2>
            <span className="text-xs text-slate-500 font-semibold">{itemCount} items</span>
          </div>

          {/* Line items preview */}
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 text-xs">
                <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
                <div className="flex-1 truncate">
                  <p className="font-bold text-slate-900 truncate">{item.name}</p>
                  <p className="text-[11px] text-slate-400">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                </div>
                <span className="font-bold text-slate-900">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">₹{(subtotal + discount).toLocaleString('en-IN')}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discounts</span>
                <span className="font-semibold">-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span className="font-semibold text-emerald-600 uppercase">FREE</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="font-heading font-bold text-base text-slate-900">Total Payable</span>
              <span className="font-heading font-black text-2xl text-indigo-600">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-heading font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Lock className="w-4 h-4" />
            <span>{processing ? 'Processing Simulated Order...' : `Confirm & Place Order (₹${total.toLocaleString('en-IN')})`}</span>
          </button>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            By confirming, your order will be permanently created in the database and stock will be atomically updated.
          </p>
        </div>

      </form>

    </div>
  );
};
