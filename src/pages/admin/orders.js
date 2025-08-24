import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useCustomer } from '@/context/CustomerContext';
import { getOrders, updateOrderStatus } from '@/lib/shopify';
import { formatCurrency } from '@/lib/payment';
import SEO from '@/components/SEO';

function OrderStatusBadge({ status }) {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
      case 'confirmed': return { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' };
      case 'processing': return { color: 'bg-purple-100 text-purple-800', label: 'Processing' };
      case 'shipped': return { color: 'bg-indigo-100 text-indigo-800', label: 'Shipped' };
      case 'delivered': return { color: 'bg-green-100 text-green-800', label: 'Delivered' };
      case 'cancelled': return { color: 'bg-red-100 text-red-800', label: 'Cancelled' };
      default: return { color: 'bg-gray-100 text-gray-800', label: status || 'Unknown' };
    }
  };

  const config = getStatusConfig(status);
  return <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>{config.label}</span>;
}

function OrderDetailsModal({ order, isOpen, onClose, onStatusUpdate }) {
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (order) setNewStatus(order.fulfillmentStatus || order.status || 'pending');
  }, [order]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order.status) return;
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Order #{order.orderNumber || order.id.slice(-6)}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Order Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <OrderStatusBadge status={order.fulfillmentStatus || order.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{order.totalPrice?.amount ? formatCurrency(parseFloat(order.totalPrice.amount)) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span>{order.customer?.firstName} {order.customer?.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Update Status</h3>
              <div className="space-y-3">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating || newStatus === order.status}
                  className="w-full px-4 py-2 bg-burgundy text-white rounded-md hover:bg-gold hover:text-charcoal transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const router = useRouter();
  const { customer, isLoggedIn } = useCustomer();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoggedIn || !customer) {
      router.push('/');
      return;
    }
    fetchOrders();
  }, [isLoggedIn, customer, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await getOrders({ first: 100 });
      setOrders(result.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleStatusUpdate = async () => {
    await fetchOrders();
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer?.email && order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || 
                         (order.fulfillmentStatus || order.status || 'pending').toLowerCase() === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => (o.fulfillmentStatus || o.status || 'pending') === 'pending').length,
    processing: orders.filter(o => (o.fulfillmentStatus || o.status || 'pending') === 'processing').length,
    shipped: orders.filter(o => (o.fulfillmentStatus || o.status || 'pending') === 'shipped').length,
    delivered: orders.filter(o => (o.fulfillmentStatus || o.status || 'pending') === 'delivered').length,
    totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.totalPrice?.amount || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-6 h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Order Management - Admin Dashboard" description="Manage your store orders" noIndex={true} />
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600 mt-2">{orders.length} total orders</p>
            </div>
            <Link href="/admin" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.processing}</p>
              <p className="text-sm text-gray-600">Processing</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.shipped}</p>
              <p className="text-sm text-gray-600">Shipped</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              <p className="text-sm text-gray-600">Delivered</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-lg font-bold text-burgundy">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-sm text-gray-600">Revenue</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{order.orderNumber || order.id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{order.customer?.firstName} {order.customer?.lastName}</p>
                          <p className="text-gray-500">{order.customer?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <OrderStatusBadge status={order.fulfillmentStatus || order.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.totalPrice?.amount ? formatCurrency(parseFloat(order.totalPrice.amount)) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-burgundy hover:text-gold"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No orders have been placed yet.'}
                </p>
              </div>
            )}
          </div>
        </div>

        <OrderDetailsModal
          order={selectedOrder}
          isOpen={showOrderDetails}
          onClose={() => setShowOrderDetails(false)}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </>
  );
}