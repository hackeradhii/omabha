import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { formatCurrency } from '@/lib/payment';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      // In a real application, you would fetch order details from your backend
      // For now, we'll simulate order data
      const mockOrderData = {
        id: orderId,
        orderNumber: `OMB${Date.now().toString().slice(-6)}`,
        status: 'confirmed',
        amount: 2499.00,
        currency: 'INR',
        paymentMethod: 'UPI',
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        customer: {
          name: 'Customer',
          email: 'customer@example.com'
        },
        shipping: {
          address: 'Customer Address',
          city: 'City',
          state: 'State',
          pincode: '123456'
        },
        items: [
          {
            id: '1',
            title: 'Elegant Silk Saree',
            quantity: 1,
            price: 2499.00,
            image: '/placeholder-product.jpg'
          }
        ]
      };

      setOrderData(mockOrderData);
      setIsLoading(false);
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-ivory to-gold/5 pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy mx-auto mb-4"></div>
          <p className="text-charcoal/70">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-ivory to-gold/5 pt-32 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-24 h-24 text-charcoal/30 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-charcoal mb-4">Order Not Found</h2>
          <p className="text-charcoal/70 mb-6">The order you're looking for doesn't exist.</p>
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-burgundy to-burgundy/90 text-white rounded-xl hover:shadow-lg transition-all duration-300">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDeliveryDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-ivory to-gold/5 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-charcoal mb-2">
            Order Confirmed!
          </h1>
          <p className="text-charcoal/70 text-lg">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="bg-white rounded-xl p-6 border border-gold/20 shadow-sm">
            <h2 className="text-xl font-semibold text-charcoal mb-4">Order Details</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-charcoal/70">Order Number</span>
                <span className="font-medium text-charcoal">{orderData.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Order Date</span>
                <span className="font-medium text-charcoal">{formatDate(orderData.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Payment Method</span>
                <span className="font-medium text-charcoal">{orderData.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium capitalize">
                  {orderData.status}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-charcoal/70">Total Amount</span>
                  <span className="font-bold text-burgundy text-lg">
                    {formatCurrency(orderData.amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-xl p-6 border border-gold/20 shadow-sm">
            <h2 className="text-xl font-semibold text-charcoal mb-4">Delivery Information</h2>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-charcoal mb-1">Estimated Delivery</h3>
                <p className="text-charcoal/70">{formatDeliveryDate(orderData.estimatedDelivery)}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-charcoal mb-1">Delivery Address</h3>
                <div className="text-charcoal/70 text-sm">
                  <p>{orderData.customer.name}</p>
                  <p>{orderData.shipping.address}</p>
                  <p>{orderData.shipping.city}, {orderData.shipping.state} {orderData.shipping.pincode}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-blue-700 text-sm font-medium">
                    Tracking information will be sent to your email
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mt-8 bg-white rounded-xl p-6 border border-gold/20 shadow-sm">
          <h2 className="text-xl font-semibold text-charcoal mb-4">Order Items</h2>
          
          <div className="space-y-4">
            {orderData.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-charcoal">{item.title}</h3>
                  <p className="text-sm text-charcoal/60">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-charcoal">{formatCurrency(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/account"
              className="px-6 py-3 bg-burgundy text-white rounded-xl hover:bg-gold hover:text-charcoal transition-colors font-medium"
            >
              View Order History
            </Link>
            <Link 
              href="/"
              className="px-6 py-3 border border-burgundy text-burgundy rounded-xl hover:bg-burgundy hover:text-white transition-colors font-medium"
            >
              Continue Shopping
            </Link>
          </div>
          
          <div className="text-center">
            <p className="text-charcoal/70 text-sm">
              Need help? <Link href="/contact" className="text-burgundy hover:text-gold">Contact our support team</Link>
            </p>
          </div>
        </div>

        {/* Order Tracking Steps */}
        <div className="mt-12 bg-white rounded-xl p-6 border border-gold/20 shadow-sm">
          <h2 className="text-xl font-semibold text-charcoal mb-6 text-center">Order Tracking</h2>
          
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>
            <div className="absolute top-4 left-0 h-0.5 bg-burgundy z-10" style={{ width: '33%' }}></div>
            
            {[
              { step: 'Order Confirmed', completed: true, icon: '✓' },
              { step: 'Processing', completed: false, icon: '📦' },
              { step: 'Shipped', completed: false, icon: '🚚' },
              { step: 'Delivered', completed: false, icon: '🏠' }
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center relative z-20">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.completed 
                    ? 'bg-burgundy text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.completed ? '✓' : index + 1}
                </div>
                <p className={`mt-2 text-xs text-center ${
                  step.completed ? 'text-burgundy font-medium' : 'text-charcoal/60'
                }`}>
                  {step.step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}