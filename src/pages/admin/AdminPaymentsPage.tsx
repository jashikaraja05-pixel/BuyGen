import React, { useEffect, useState } from 'react';
import { 
  CreditCard, 
  QrCode, 
  Banknote, 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import type { PaymentMethodConfig } from '../../types/index.ts';
import { api } from '../../services/api.ts';

export const AdminPaymentsPage: React.FC = () => {
  const [methods, setMethods] = useState<PaymentMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<PaymentMethodConfig['type']>('upi');
  const [enabled, setEnabled] = useState(true);
  const [description, setDescription] = useState('');
  const [upiId, setUpiId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminPaymentMethods();
      setMethods(res.paymentMethods || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const handleToggle = async (method: PaymentMethodConfig) => {
    try {
      const updatedEnabled = !method.enabled;
      await api.updatePaymentMethod(method.id, { enabled: updatedEnabled });
      setMethods(prev => prev.map(m => m.id === method.id ? { ...m, enabled: updatedEnabled } : m));
      setSuccessMsg(`"${method.name}" is now ${updatedEnabled ? 'Enabled' : 'Disabled'} for customer checkout.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update payment status');
    }
  };

  const openCreateModal = () => {
    setEditingMethod(null);
    setName('');
    setType('upi');
    setEnabled(true);
    setDescription('');
    setUpiId('');
    setQrCodeUrl('');
    setInstructions('');
    setIsModalOpen(true);
  };

  const openEditModal = (method: PaymentMethodConfig) => {
    setEditingMethod(method);
    setName(method.name);
    setType(method.type);
    setEnabled(method.enabled);
    setDescription(method.description);
    setUpiId(method.upiId || '');
    setQrCodeUrl(method.qrCodeUrl || '');
    setInstructions(method.instructions || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Payment method name is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Automatically generate a valid QR Code URL if type is UPI and UPI ID is provided
      let finalQr = qrCodeUrl.trim();
      if (type === 'upi' && upiId.trim() && !finalQr) {
        finalQr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3D${encodeURIComponent(upiId.trim())}%26pn%3DBUYGEN%2520Electronics%26cu%3DINR`;
      }

      const payload = {
        name: name.trim(),
        type,
        enabled,
        description: description.trim(),
        upiId: upiId.trim() || undefined,
        qrCodeUrl: finalQr || undefined,
        instructions: instructions.trim() || undefined
      };

      if (editingMethod) {
        const res = await api.updatePaymentMethod(editingMethod.id, payload);
        setMethods(prev => prev.map(m => m.id === editingMethod.id ? res.paymentMethod : m));
        setSuccessMsg(`"${res.paymentMethod.name}" updated successfully.`);
      } else {
        const res = await api.createPaymentMethod(payload);
        setMethods(prev => [...prev, res.paymentMethod]);
        setSuccessMsg(`New payment method "${res.paymentMethod.name}" added successfully.`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save payment method');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, methodName: string) => {
    if (!window.confirm(`Are you sure you want to remove the payment method "${methodName}"?`)) {
      return;
    }

    try {
      await api.deletePaymentMethod(id);
      setMethods(prev => prev.filter(m => m.id !== id));
      setSuccessMsg(`"${methodName}" deleted.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete payment method');
    }
  };

  const handleCopyUPI = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMethodIcon = (type: PaymentMethodConfig['type']) => {
    switch (type) {
      case 'upi':
        return <QrCode className="w-5 h-5 text-cyan-400" />;
      case 'cod':
        return <Banknote className="w-5 h-5 text-emerald-400" />;
      case 'card':
        return <CreditCard className="w-5 h-5 text-indigo-400" />;
      case 'netbanking':
        return <Building2 className="w-5 h-5 text-amber-400" />;
      default:
        return <CreditCard className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Top Banner Card */}
      <div className="bg-[#0b0e24] p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-wider">
              Payment Gateway Controller
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Checkout Sync
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
            Store Payment Methods
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Configure active payment methods for customers checking out. Set your official UPI ID and QR code, manage Cash on Delivery (COD), Card payments, and custom options.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadPaymentMethods}
            disabled={loading}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:opacity-95 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Payment Method</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs sm:text-sm text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs sm:text-sm text-emerald-300 flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {methods.map((method) => {
          const isUpi = method.type === 'upi';
          return (
            <div
              key={method.id}
              className={`bg-[#0b0e24] rounded-3xl border transition-all p-6 space-y-4 shadow-xl flex flex-col justify-between ${
                method.enabled 
                  ? 'border-slate-800 hover:border-cyan-500/50' 
                  : 'border-slate-800/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 shadow-inner">
                      {getMethodIcon(method.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-bold text-white text-base">
                          {method.name}
                        </h3>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          method.enabled 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {method.enabled ? 'Active in Store' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {method.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle button */}
                  <button
                    type="button"
                    onClick={() => handleToggle(method)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      method.enabled ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                    title={method.enabled ? 'Click to disable' : 'Click to enable'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        method.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* UPI QR & Details display if UPI */}
                {isUpi && (
                  <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex items-center gap-4">
                    {method.qrCodeUrl ? (
                      <div className="w-20 h-20 bg-white p-1 rounded-xl shrink-0 shadow-md">
                        <img 
                          src={method.qrCodeUrl} 
                          alt="Store UPI QR Code" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 shrink-0 text-[10px] text-center p-1">
                        No QR Image
                      </div>
                    )}

                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                        Official Store UPI ID:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white truncate">
                          {method.upiId || 'Not Configured'}
                        </span>
                        {method.upiId && (
                          <button
                            type="button"
                            onClick={() => handleCopyUPI(method.id, method.upiId!)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Copy UPI ID"
                          >
                            {copiedId === method.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Customers scanning this QR code in checkout will send payments directly to this UPI address.
                      </p>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {method.instructions && (
                  <div className="mt-3 text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                    <span className="font-semibold text-slate-300 block mb-0.5">Customer Instructions:</span>
                    {method.instructions}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  Method ID: <span className="font-mono">{method.id}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(method)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white rounded-xl border border-cyan-500/30 font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Configure</span>
                  </button>

                  {!['pm-upi', 'pm-cod', 'pm-card'].includes(method.id) && (
                    <button
                      type="button"
                      onClick={() => handleDelete(method.id, method.name)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 transition cursor-pointer"
                      title="Delete payment method"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b0e24] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative text-white my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-xl text-white">
                  {editingMethod ? 'Configure Payment Method' : 'Add Payment Method'}
                </h3>
                <p className="text-xs text-slate-400">
                  Control checkout availability, QR code, and instructions.
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Method Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UPI Instant QR Code Pay"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-cyan-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Method Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-cyan-400 focus:outline-hidden"
                  >
                    <option value="upi">UPI / QR Code</option>
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="card">Credit / Debit Card</option>
                    <option value="netbanking">Net Banking</option>
                    <option value="custom">Custom Method</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Customer Visibility
                  </label>
                  <select
                    value={enabled ? 'true' : 'false'}
                    onChange={(e) => setEnabled(e.target.value === 'true')}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-cyan-400 focus:outline-hidden"
                  >
                    <option value="true">Enabled (Visible in Checkout)</option>
                    <option value="false">Disabled (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scan & pay with any UPI App"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-cyan-400 focus:outline-hidden"
                />
              </div>

              {type === 'upi' && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-3">
                  <span className="text-xs font-bold text-cyan-300 block">
                    ⚡ UPI & QR Configuration
                  </span>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Store UPI ID *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. buygen@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0b0e24] border border-slate-800 rounded-xl text-white font-mono text-xs focus:border-cyan-400 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Custom QR Code Image (Upload File / Photo or Enter URL)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Paste image URL (or upload image below)"
                        value={qrCodeUrl}
                        onChange={(e) => setQrCodeUrl(e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#0b0e24] border border-slate-800 rounded-xl text-white text-xs focus:border-cyan-400 focus:outline-hidden"
                      />
                      <div className="flex items-center gap-3">
                        <label className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5">
                          <span>Browse / Upload QR Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    setQrCodeUrl(reader.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        {qrCodeUrl && (
                          <button
                            type="button"
                            onClick={() => setQrCodeUrl('')}
                            className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                          >
                            Remove QR Image
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Checkout Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Instructions displayed to customer after selecting this method"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-cyan-400 focus:outline-hidden resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 hover:opacity-95 cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingMethod ? 'Update Payment Method' : 'Create Payment Method'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
