import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCustomer } from '@/context/CustomerContext';
import Link from 'next/link';
import Image from 'next/image';
import { getCustomerOrders, cancelOrder } from '@/lib/shopify';
import { formatCurrency } from '@/lib/payment';

function OrderStatusBadge({ status }) {
  const getStatusConfig = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' };
      case 'CONFIRMED':
        return { color: 'bg-blue-100 text-blue-800', text: 'Confirmed' };
      case 'PROCESSING':
        return { color: 'bg-purple-100 text-purple-800', text: 'Processing' };
      case 'SHIPPED':
      case 'IN_TRANSIT':
        return { color: 'bg-indigo-100 text-indigo-800', text: 'Shipped' };
      case 'DELIVERED':
      case 'FULFILLED':
        return { color: 'bg-green-100 text-green-800', text: 'Delivered' };
      case 'CANCELLED':
        return { color: 'bg-red-100 text-red-800', text: 'Cancelled' };
      case 'UNFULFILLED':
        return { color: 'bg-orange-100 text-orange-800', text: 'Processing' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status || 'Unknown' };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
}

function OrderCard({ order, onCancelOrder }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canCancel = () => {
    const status = order.fulfillmentStatus?.toUpperCase();
    return status === 'PENDING' || status === 'CONFIRMED' || status === 'UNFULFILLED';
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    setIsCancelling(true);
    try {
      await onCancelOrder(order.id, 'Cancelled by customer');
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const getTrackingSteps = () => {
    const allSteps = [
      { key: 'CONFIRMED', label: 'Order Confirmed', icon: '✓' },
      { key: 'PROCESSING', label: 'Processing', icon: '📦' },
      { key: 'SHIPPED', label: 'Shipped', icon: '🚚' },
      { key: 'DELIVERED', label: 'Delivered', icon: '🏠' }
    ];

    const currentStatus = order.fulfillmentStatus?.toUpperCase();
    const statusOrder = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  return (
    <div className="bg-white rounded-xl border border-gold/20 shadow-sm overflow-hidden">
      {/* Order Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h3 className="text-lg font-semibold text-charcoal">
                Order {order.orderNumber || order.name}
              </h3>
              <OrderStatusBadge status={order.fulfillmentStatus} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-charcoal/70">
              <div>
                <span className="font-medium">Order Date:</span><br />
                {formatDate(order.createdAt)}
              </div>
              <div>
                <span className="font-medium">Total:</span><br />
                <span className="text-burgundy font-semibold text-base">
                  {formatCurrency(parseFloat(order.totalPrice.amount))}
                </span>
              </div>
              <div>
                <span className="font-medium">Payment:</span><br />
                {order.financialStatus === 'PAID' ? (
                  <span className="text-green-600">Paid</span>
                ) : (
                  <span className="text-orange-600">{order.financialStatus}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canCancel() && (
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-2 text-sm text-burgundy hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
            >
              {isExpanded ? 'Hide Details' : 'View Details'}
            </button>
          </div>
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="px-6 py-4 bg-gray-50">
        <div className="flex items-center space-x-4">
          {order.lineItems?.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-12 h-16 bg-gray-200 rounded-lg overflow-hidden">
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="font-medium text-sm text-charcoal line-clamp-1">{item.title}</p>
                <p className="text-xs text-charcoal/60">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
          {order.lineItems?.length > 3 && (
            <div className="text-sm text-charcoal/60">
              +{order.lineItems.length - 3} more items
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-200 space-y-6">
          {/* Order Tracking */}
          <div>
            <h4 className="font-semibold text-charcoal mb-4">Order Tracking</h4>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>
              <div 
                className="absolute top-4 left-0 h-0.5 bg-burgundy z-10 transition-all duration-300" 
                style={{ width: `${(getTrackingSteps().filter(s => s.completed).length / getTrackingSteps().length) * 100}%` }}
              ></div>
              
              {getTrackingSteps().map((step, index) => (
                <div key={index} className="flex flex-col items-center relative z-20">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    step.completed 
                      ? 'bg-burgundy text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.completed ? '✓' : index + 1}
                  </div>
                  <p className={`mt-2 text-xs text-center ${
                    step.completed ? 'text-burgundy font-medium' : 'text-charcoal/60'
                  }`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-semibold text-charcoal mb-4">Order Items</h4>
            <div className="space-y-3">
              {order.lineItems?.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-16 h-20 bg-gray-200 rounded-lg overflow-hidden">
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-charcoal">{item.title}</h5>
                    <p className="text-sm text-charcoal/60">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-charcoal">
                      {formatCurrency(parseFloat(item.price.amount))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div>
              <h4 className="font-semibold text-charcoal mb-4">Status History</h4>
              <div className="space-y-3">
                {order.statusHistory.reverse().map((status, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-burgundy rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-charcoal text-sm">{status.message}</p>
                        <span className="text-xs text-charcoal/60">
                          {formatDate(status.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div>
              <h4 className="font-semibold text-charcoal mb-2">Shipping Address</h4>
              <div className="text-sm text-charcoal/70 bg-gray-50 p-3 rounded-lg">
                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { customer, isLoggedIn, customerAccessToken } = useCustomer();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
      return;
    }

    loadOrders();
  }, [isLoggedIn, customerAccessToken, router]);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCustomerOrders(customerAccessToken);
      setOrders(result.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId, reason) => {
    try {
      const result = await cancelOrder(orderId, reason);
      if (result.success) {
        // Reload orders to reflect the cancellation
        await loadOrders();
      } else {
        alert('Failed to cancel order. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-ivory to-gold/5 pt-32 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-24 h-24 text-charcoal/30 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-2xl font-bold text-charcoal mb-4">Please Log In</h2>
          <p className="text-charcoal/70 mb-6">You need to be logged in to view your orders.</p>
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-burgundy to-burgundy/90 text-white rounded-xl hover:shadow-lg transition-all duration-300">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-ivory to-gold/5 pt-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-burgundy to-gold rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-charcoal mb-2">
            My Orders
          </h1>
          <p className="text-charcoal/70 text-lg">
            Track your orders and view purchase history
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gold/20 shadow-sm">
                <div className="animate-pulse space-y-4">
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/6"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders List */}
        {!isLoading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onCancelOrder={handleCancelOrder}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-charcoal/20 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-2xl font-semibold text-charcoal mb-4">No orders yet</h3>
            <p className="text-charcoal/70 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <div className="space-y-4">
              <Link href="/" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-burgundy to-burgundy/90 text-white rounded-xl hover:shadow-lg transition-all duration-300">
                Start Shopping
              </Link>
              <div className="text-center">
                <Link href="/account" className="text-sm text-burgundy hover:text-gold transition-colors">
                  Back to Account
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}