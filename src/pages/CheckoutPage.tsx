import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  Banknote, 
  QrCode,
  Building2,
  Lock, 
  AlertCircle, 
  ChevronRight,
  CheckCircle2,
  Package,
  Copy,
  Check,
  Truck,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import type { PaymentMethodConfig } from '../types/index.ts';

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

  // Dynamic Payment Methods from Admin
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('pm-upi');
  const [loadingMethods, setLoadingMethods] = useState<boolean>(true);

  // User input fields for payment verification
  const [upiRefId, setUpiRefId] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        setLoadingMethods(true);
        const res = await api.getPaymentMethods();
        const active = res.paymentMethods || [];
        setPaymentMethods(active);
        if (active.length > 0) {
          setSelectedMethodId(active[0].id);
        }
      } catch (err) {
        console.error('Failed to load payment methods', err);
      } finally {
        setLoadingMethods(false);
      }
    };
    fetchMethods();
  }, []);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId) || paymentMethods[0];

  const handleCopyUpi = (upiId: string) => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (processing) return;

    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      setError('Please complete all shipping address fields.');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const paymentMethodName = selectedMethod ? selectedMethod.name : 'UPI / QR Code Pay';

      // Call real backend endpoint to validate stock atomically and record order
      const res = await api.createOrder({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        paymentMethod: paymentMethodName
      });

      // Refresh cart state to reflect newly placed order
      await refreshCart();

      // Navigate to order confirmation
      navigate(`/order-success/${res.order.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please verify warehouse stock availability.');
      setProcessing(false);
    }
  };

  // Generate dynamic QR Code URL with the exact total amount
  const storeUpi = selectedMethod?.upiId || 'buygen.electronics@okhdfcbank';
  const qrUrl = selectedMethod?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3D${encodeURIComponent(storeUpi)}%26pn%3DBUYGEN%2520Electronics%26am%3D${total}%26cu%3DINR`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      
      {/* Top Header */}
      <div className="bg-[#0b0e24] p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <span>Verified Checkout</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Direct Warehouse Sync
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
            Complete Your Electronics Order
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review delivery destination, select payment method, and complete order placement.
          </p>
        </div>

        <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
          <span className="text-xs text-slate-400 block">Total Payable:</span>
          <span className="font-heading font-black text-2xl text-cyan-300">
            ₹{total.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-emerald-400 font-bold block">Free Express Delivery</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs sm:text-sm text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Shipping Address & Payment Selection */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. Shipping Address */}
          <div className="bg-[#0b0e24] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                1
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-white">
                  Shipping Destination
                </h2>
                <p className="text-xs text-slate-400">Where should we dispatch your electronics?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Recipient Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-white focus:outline-hidden transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-white focus:outline-hidden transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Street Address, Apartment / Flat *
                </label>
                <input
                  type="text"
                  required
                  placeholder="House / Flat No., Building, Street Name"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-white focus:outline-hidden transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-white focus:outline-hidden transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  State *
                </label>
                <input
                  type="text"
                  required
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-white focus:outline-hidden transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Postal Pincode *
                </label>
                <input
                  type="text"
                  required
                  placeholder="6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl text-white focus:outline-hidden transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  disabled
                  value="India (Dispatch available nationwide)"
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800/60 rounded-xl text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Method Selection (Managed by Admin) */}
          <div className="bg-[#0b0e24] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                2
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-white">
                  Payment Method
                </h2>
                <p className="text-xs text-slate-400">Select how you want to pay for this order</p>
              </div>
            </div>

            {loadingMethods ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Loading store payment options...
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="p-6 text-center text-amber-300 text-xs bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                No active payment methods configured by store admin.
              </div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const isSelected = selectedMethodId === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethodId(method.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-cyan-400 bg-slate-900/90 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                          : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600 bg-transparent'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-slate-950" />}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                              {method.type === 'upi' && <QrCode className="w-5 h-5" />}
                              {method.type === 'cod' && <Banknote className="w-5 h-5 text-emerald-400" />}
                              {method.type === 'card' && <CreditCard className="w-5 h-5 text-indigo-400" />}
                              {method.type === 'netbanking' && <Building2 className="w-5 h-5 text-amber-400" />}
                              {method.type === 'custom' && <CreditCard className="w-5 h-5 text-slate-300" />}
                            </div>

                            <div>
                              <h3 className="font-bold text-sm text-white">{method.name}</h3>
                              <p className="text-xs text-slate-400">{method.description}</p>
                            </div>
                          </div>
                        </div>

                        {method.type === 'upi' && (
                          <span className="hidden sm:inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            Instant Scan & Pay
                          </span>
                        )}
                        {method.type === 'cod' && (
                          <span className="hidden sm:inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                            Pay on Delivery
                          </span>
                        )}
                      </div>

                      {/* Expanded View for Selected Method */}
                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-300 space-y-4">
                          
                          {/* Case 1: UPI / QR Code */}
                          {method.type === 'upi' && (
                            <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 flex flex-col sm:flex-row items-center gap-6">
                              <div className="w-40 h-40 bg-white p-2 rounded-2xl shadow-xl shrink-0 flex items-center justify-center">
                                <img
                                  src={qrUrl}
                                  alt="BUYGEN UPI QR"
                                  className="w-full h-full object-contain"
                                />
                              </div>

                              <div className="space-y-2.5 text-center sm:text-left min-w-0">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[11px]">
                                  <span>Scan using GPay / PhonePe / Paytm</span>
                                </div>
                                <h4 className="font-heading font-black text-lg text-white">
                                  ₹{total.toLocaleString('en-IN')}
                                </h4>
                                
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-center sm:justify-start gap-2">
                                    <span className="text-xs text-slate-400">Pay to UPI ID:</span>
                                    <span className="font-mono text-xs font-bold text-cyan-300 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                                      {storeUpi}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleCopyUpi(storeUpi); }}
                                      className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                                      title="Copy UPI ID"
                                    >
                                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-center sm:justify-start gap-2">
                                    <span className="text-xs text-slate-400">GPay / PhonePe Mobile:</span>
                                    <span className="font-mono text-xs font-bold text-amber-300 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                                      +91 98765 43210
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleCopyUpi('+919876543210'); }}
                                      className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                                      title="Copy Mobile Number"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                  {method.instructions || 'Scan the QR code above or pay directly to the Mobile Number or UPI ID via GPay, PhonePe, Paytm, or BHIM. Enter your reference number below and click Place Order to confirm.'}
                                </p>

                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    Optional: UTR / Reference Number
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 423985729103"
                                    value={upiRefId}
                                    onChange={(e) => setUpiRefId(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full max-w-xs px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Case 2: Cash on Delivery */}
                          {method.type === 'cod' && (
                            <div className="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-500/30 space-y-2">
                              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                                <Truck className="w-4 h-4" />
                                <span>Doorstep Payment Policy</span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {method.instructions || 'Please keep exact cash ready (₹' + total.toLocaleString('en-IN') + ') or scan the delivery executive’s official QR code when your courier arrives.'}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                ✅ No advance payment required • Inspect package upon arrival
                              </p>
                            </div>
                          )}

                          {/* Case 3: Card */}
                          {method.type === 'card' && (
                            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  Card Number
                                </label>
                                <input
                                  type="text"
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full px-3.5 py-2 bg-[#0b0e24] border border-slate-800 rounded-xl text-white font-mono text-xs focus:border-cyan-400 focus:outline-hidden"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Expiry
                                  </label>
                                  <input
                                    type="text"
                                    value={cardExpiry}
                                    onChange={(e) => setCardExpiry(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full px-3.5 py-2 bg-[#0b0e24] border border-slate-800 rounded-xl text-white font-mono text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    CVV
                                  </label>
                                  <input
                                    type="password"
                                    maxLength={4}
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full px-3.5 py-2 bg-[#0b0e24] border border-slate-800 rounded-xl text-white font-mono text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Case 4: Net Banking or other */}
                          {(method.type === 'netbanking' || method.type === 'custom') && (
                            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-slate-300">
                              <p className="text-xs">
                                {method.instructions || 'You will be redirected to the secure bank portal for instant account authorization.'}
                              </p>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0b0e24] rounded-3xl border border-slate-800 p-6 shadow-xl space-y-5 sticky top-24">
            <h3 className="font-heading font-black text-lg text-white pb-3 border-b border-slate-800 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-slate-400 font-normal">{itemCount} items</span>
            </h3>

            {/* Items snippet */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                    </p>
                  </div>
                  <span className="font-heading font-bold text-xs text-white">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Store Discount</span>
                  <span className="font-mono">-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Delivery Charges</span>
                <span className="text-emerald-400 font-bold">FREE</span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-sm text-white">Total Amount</span>
                <span className="font-heading font-black text-xl text-cyan-300">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition cursor-pointer active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{processing ? 'Processing Order...' : 'Confirm & Place Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="space-y-1.5 pt-2 text-[11px] text-slate-400 text-center">
              <p className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Encrypted 256-bit Secure Checkout</span>
              </p>
              <p>Warehouse stock deducted automatically upon order confirmation.</p>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};
