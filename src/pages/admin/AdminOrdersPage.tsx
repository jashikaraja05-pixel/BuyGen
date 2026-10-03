import React, { useEffect, useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  CreditCard, 
  ChevronRight, 
  X,
  AlertCircle,
  CheckCircle2,
  Truck
} from 'lucide-react';
import type { Order, OrderStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { DataTable, ColumnDef, FilterConfig } from '../../components/admin/DataTable.tsx';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const statuses: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getOrders();
      setOrders(res.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdating(true);
      const res = await api.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(res.order);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  // Filtered dataset before sorting in DataTable
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || o.paymentMethod.toLowerCase().includes(paymentFilter.toLowerCase());
      return matchesStatus && matchesPayment;
    });
  }, [orders, statusFilter, paymentFilter]);

  // Column definitions for DataTable
  const columns: ColumnDef<Order>[] = [
    {
      id: 'orderId',
      header: 'Order ID',
      sortable: true,
      sortKey: (o) => o.id,
      cell: (o) => (
        <span className="font-mono font-bold text-indigo-600">
          {o.id}
        </span>
      )
    },
    {
      id: 'customer',
      header: 'Customer',
      sortable: true,
      sortKey: (o) => o.customerName,
      cell: (o) => (
        <div>
          <p className="font-bold text-slate-900">{o.customerName}</p>
          <p className="text-[11px] text-slate-400">{o.customerEmail}</p>
        </div>
      )
    },
    {
      id: 'date',
      header: 'Date Placed',
      sortable: true,
      sortKey: (o) => new Date(o.createdAt),
      cell: (o) => (
        <span className="text-slate-500 text-xs">
          {new Date(o.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      id: 'items',
      header: 'Purchased Items',
      sortable: true,
      sortKey: (o) => o.items.reduce((s, i) => s + i.quantity, 0),
      hideOnTablet: true,
      cell: (o) => (
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-2 overflow-hidden">
            {o.items.slice(0, 3).map((item, idx) => (
              <img 
                key={idx} 
                src={item.image} 
                alt="" 
                className="inline-block h-7 w-7 rounded-lg ring-2 ring-white object-cover bg-slate-100" 
              />
            ))}
          </div>
          <span className="text-xs text-slate-600 font-semibold ml-1">
            {o.items.reduce((s, i) => s + i.quantity, 0)} units
          </span>
        </div>
      )
    },
    {
      id: 'total',
      header: 'Total',
      sortable: true,
      sortKey: (o) => o.total,
      cell: (o) => (
        <span className="font-mono font-bold text-slate-900">
          ₹{o.total.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      id: 'payment',
      header: 'Payment',
      sortable: true,
      sortKey: (o) => o.paymentMethod,
      hideOnTablet: true,
      cell: (o) => (
        <span className="text-xs text-slate-500 font-medium">
          {o.paymentMethod.replace(' Simulation', '')}
        </span>
      )
    },
    {
      id: 'status',
      header: 'Status & Progression',
      sortable: true,
      sortKey: (o) => o.status,
      cell: (o) => (
        <select
          value={o.status}
          disabled={updating}
          onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
          onClick={(e) => e.stopPropagation()}
          className={`p-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
            o.status === 'Delivered'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : o.status === 'Shipped'
              ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
              : o.status === 'Processing'
              ? 'bg-purple-50 text-purple-800 border-purple-200'
              : o.status === 'Confirmed'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )
    },
    {
      id: 'actions',
      header: 'Action',
      sortable: false,
      headerClassName: 'text-right',
      cell: (o) => (
        <div className="text-right">
          <button
            onClick={() => setSelectedOrder(o)}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs cursor-pointer transition"
          >
            Inspect
          </button>
        </div>
      )
    }
  ];

  // Filters configuration for DataTable
  const filterConfigs: FilterConfig[] = [
    {
      id: 'status',
      label: 'Order Status',
      value: statusFilter,
      options: [
        { label: 'All Statuses', value: 'all' },
        ...statuses.map(s => ({ label: s, value: s }))
      ],
      onChange: setStatusFilter
    },
    {
      id: 'payment',
      label: 'Payment Method',
      value: paymentFilter,
      options: [
        { label: 'All Payment Methods', value: 'all' },
        { label: 'UPI Simulation', value: 'upi' },
        { label: 'Card Simulation', value: 'card' },
        { label: 'Cash on Delivery', value: 'cash' }
      ],
      onChange: setPaymentFilter
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Reusable, responsive DataTable */}
      <DataTable<Order>
        title="Order Management"
        subtitle="Review customer electronics orders, verify delivery destinations, and advance dispatch milestones."
        data={filteredOrders}
        columns={columns}
        keyExtractor={(o) => o.id}
        searchPlaceholder="Search by Order ID, customer name, email, or city..."
        searchFilter={(o, q) => 
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          o.shippingAddress.city.toLowerCase().includes(q) ||
          o.items.some(item => item.name.toLowerCase().includes(q))
        }
        filters={filterConfigs}
        defaultSort={{ columnId: 'date', direction: 'desc' }}
        pageSize={8}
        renderCard={(o) => (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-mono font-bold text-indigo-600 text-xs">{o.id}</span>
              <span className="text-[11px] text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{o.customerName}</p>
              <p className="text-xs text-slate-500">{o.customerEmail}</p>
              <p className="text-xs text-slate-500 mt-1">
                Deliver to: <span className="font-semibold text-slate-700">{o.shippingAddress.city}, {o.shippingAddress.state}</span>
              </p>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 text-[11px] block">Amount Paid</span>
                <span className="font-mono font-bold text-slate-900 text-sm">₹{o.total.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <select
                  value={o.status}
                  disabled={updating}
                  onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                  className="p-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-slate-50"
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => setSelectedOrder(o)}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl cursor-pointer transition text-center"
            >
              View Full Order Receipt & Address
            </button>
          </div>
        )}
      />

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="font-heading font-black text-xl text-slate-900">
                  Order {selectedOrder.id}
                </h3>
                <span className="text-xs text-slate-400">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Updater inside Modal */}
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
                  Change Dispatch Status
                </span>
                <span className="text-xs text-indigo-700">Advances customer tracking milestones in real time</span>
              </div>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                className="p-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 shadow-xs cursor-pointer"
              >
                {statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Items list */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Purchased Electronics ({selectedOrder.items.reduce((s, i) => s + i.quantity, 0)})
              </h4>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
                {selectedOrder.items.map((item) => (
                  <div key={item.productId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200" />
                    <div className="truncate flex-1">
                      <p className="font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="font-bold font-mono text-slate-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="p-4 bg-slate-50 rounded-2xl space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Shipping Destination Address</span>
              </div>
              <p className="font-semibold text-slate-800">{selectedOrder.shippingAddress.fullName} ({selectedOrder.shippingAddress.phone})</p>
              <p>{selectedOrder.shippingAddress.address}</p>
              <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
            </div>

            {/* Totals */}
            <div className="pt-2 border-t flex justify-between items-baseline text-sm">
              <span className="font-bold text-slate-900">Total Order Amount</span>
              <span className="font-black text-xl text-indigo-600 font-mono">
                ₹{selectedOrder.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
