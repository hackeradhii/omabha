import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCart } from '@/context/CartContext';
import { useCustomer } from '@/context/CustomerContext';
import Image from 'next/image';
import Link from 'next/link';
import { 
  createPaymentOrder, 
  initiateRazorpayPayment, 
  PAYMENT_METHODS, 
  formatCurrency, 
  calculateOrderTotal 
} from '@/lib/payment';
import { 
  DiscountCodeInput, 
  CartDiscountSummary, 
  AvailablePromotions, 
  AutomaticDiscountNotification,
  PromotionalBanner
} from '@/components/MarketingPromotions';
import { 
  checkAutomaticDiscounts, 
  getAvailablePromotions 
} from '@/lib/shopify';

function OrderSummary({ cartItems, orderTotals, appliedDiscounts, onDiscountApplied, onDiscountRemoved }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gold/20 shadow-sm">
      <h3 className="text-lg font-semibold text-charcoal mb-4">Order Summary</h3>
      
      {/* Cart Items */}
      <div className="space-y-3 mb-6">
        {cartItems.map((item) => {
          const itemPrice = parseFloat(item.price.amount || item.price);
          return (
            <div key={item.id} className="flex items-center space-x-3">
              <div className="w-12 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.image?.url ? (
                  <Image
                    src={item.image.url}
                    alt={item.image.altText || item.title}
                    width={48}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-charcoal text-sm line-clamp-2">{item.title}</h4>
                <p className="text-xs text-charcoal/60">Qty: {item.quantity || 1}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-charcoal">{formatCurrency(itemPrice)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Totals */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-charcoal/70">Subtotal</span>
          <span className="text-charcoal">{formatCurrency(orderTotals.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal/70">Shipping</span>
          <span className="text-charcoal">
            {orderTotals.shipping > 0 ? formatCurrency(orderTotals.shipping) : 'Free'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal/70">Tax</span>
          <span className="text-charcoal">{formatCurrency(orderTotals.tax)}</span>
        </div>
        {orderTotals.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-charcoal/70">Discount</span>
            <span className="text-green-600">-{formatCurrency(orderTotals.discount)}</span>
          </div>
        )}
        {/* Applied Discounts Summary */}
        <CartDiscountSummary 
          subtotal={orderTotals.subtotal} 
          appliedDiscounts={appliedDiscounts} 
        />
        
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-charcoal">Total</span>
            <span className="text-burgundy">{formatCurrency(orderTotals.total)}</span>
          </div>
        </div>
      </div>
      
      {/* Discount Code Input */}
      <div className="mt-6">
        <DiscountCodeInput 
          onDiscountApplied={onDiscountApplied}
          onDiscountRemoved={onDiscountRemoved}
        />
      </div>
    </div>
  );
}

function PaymentMethodSelector({ selectedMethod, onMethodChange }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gold/20 shadow-sm">
      <h3 className="text-lg font-semibold text-charcoal mb-4">Payment Methods</h3>
      <div className="space-y-3">
        {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
          <label
            key={key}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
              selectedMethod === key
                ? 'border-burgundy bg-burgundy/5'
                : 'border-gray-200 hover:border-gold hover:bg-gold/5'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={key}
              checked={selectedMethod === key}
              onChange={(e) => onMethodChange(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center space-x-3 flex-1">
              <span className="text-2xl">{method.icon}</span>
              <div>
                <h4 className="font-medium text-charcoal">{method.name}</h4>
                <p className="text-sm text-charcoal/60">{method.description}</p>
              </div>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 ${
              selectedMethod === key ? 'border-burgundy bg-burgundy' : 'border-gray-300'
            }`}>
              {selectedMethod === key && (
                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartCount, clearCart } = useCart();
  const { customer, isLoggedIn } = useCustomer();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState([]);
  const [orderTotals, setOrderTotals] = useState({});
  const [appliedDiscounts, setAppliedDiscounts] = useState([]);
  const [automaticDiscount, setAutomaticDiscount] = useState(null);
  const [promotionalBanner, setPromotionalBanner] = useState(null);
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.email || '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
      return;
    }

    if (cartCount === 0) {
      router.push('/');
      return;
    }

    // Calculate order totals
    const shipping = 99; // Fixed shipping cost
    const tax = 0; // Tax calculation can be added later
    
    // Calculate discount amount from applied discounts
    const discountAmount = appliedDiscounts.reduce((total, discount) => {
      switch (discount.type) {
        case 'percentage':
          return total + (calculateOrderTotal(cartItems, 0, 0, 0).subtotal * discount.value) / 100;
        case 'fixed_amount':
          return total + Math.min(discount.value, calculateOrderTotal(cartItems, 0, 0, 0).subtotal);
        default:
          return total;
      }
    }, 0);
    
    const totals = calculateOrderTotal(cartItems, shipping, tax, discountAmount);
    setOrderTotals(totals);
    
    // Check for automatic discounts
    checkAutomaticDiscounts(totals.subtotal).then(autoDiscount => {
      if (autoDiscount && !appliedDiscounts.find(d => d.id === autoDiscount.id)) {
        setAutomaticDiscount(autoDiscount);
        setAppliedDiscounts(prev => [...prev, autoDiscount]);
      }
    }).catch(console.error);
    
    // Load promotional banner
    getAvailablePromotions().then(promotions => {
      const bannerPromotion = promotions.find(p => p.showAsBanner);
      if (bannerPromotion) {
        setPromotionalBanner(bannerPromotion);
      }
    }).catch(console.error);
  }, [isLoggedIn, cartCount, cartItems, router]);

  useEffect(() => {
    if (customer) {
      setShippingInfo(prev => ({
        ...prev,
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || ''
      }));
    }
  }, [customer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDiscountApplied = (discount) => {
    setAppliedDiscounts(prev => {
      // Remove any existing discount of the same type
      const filtered = prev.filter(d => d.code !== discount.code);
      return [...filtered, discount];
    });
  };
  
  const handleDiscountRemoved = () => {
    setAppliedDiscounts([]);
  };

  const validateShippingInfo = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address1', 'city', 'state', 'pincode'];
    const missing = required.filter(field => !shippingInfo[field]?.trim());
    
    if (missing.length > 0) {
      setErrors([`Please fill in all required fields: ${missing.join(', ')}`]);
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      setErrors(['Please enter a valid email address']);
      return false;
    }

    // Validate phone
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(shippingInfo.phone.replace(/\s+/g, ''))) {
      setErrors(['Please enter a valid 10-digit mobile number']);
      return false;
    }

    // Validate pincode
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(shippingInfo.pincode)) {
      setErrors(['Please enter a valid 6-digit pincode']);
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    setErrors([]);
    
    if (!validateShippingInfo()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment order
      const orderData = {
        amount: orderTotals.total,
        currency: 'INR',
        customerInfo: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: shippingInfo.phone
        },
        cartItems: cartItems
      };

      const { order } = await createPaymentOrder(orderData);

      // Initiate Razorpay payment
      await initiateRazorpayPayment({
        order,
        customerInfo: orderData.customerInfo,
        cartItems,
        shippingAddress: shippingInfo,
        onSuccess: (result) => {
          setIsProcessing(false);
          clearCart();
          router.push(`/order-confirmation?orderId=${result.order.id}`);
        },
        onFailure: (error) => {
          setIsProcessing(false);
          setErrors([error.message || 'Payment failed. Please try again.']);
        }
      });

    } catch (error) {
      setIsProcessing(false);
      setErrors([error.message || 'Failed to process payment. Please try again.']);
    }
  };

  if (!isLoggedIn || cartCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-ivory to-gold/5 pt-32 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-24 h-24 text-charcoal/30 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 className="text-2xl font-bold text-charcoal mb-4">Cart is Empty</h2>
          <p className="text-charcoal/70 mb-6">Add some items to your cart before checkout.</p>
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-burgundy to-burgundy/90 text-white rounded-xl hover:shadow-lg transition-all duration-300">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-ivory to-gold/5 pt-32">
      {/* Promotional Banner */}
      {promotionalBanner && (
        <PromotionalBanner 
          promotion={promotionalBanner} 
          onClose={() => setPromotionalBanner(null)} 
        />
      )}
      
      {/* Automatic Discount Notification */}
      <AutomaticDiscountNotification discount={automaticDiscount} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-charcoal mb-2">Checkout</h1>
          <p className="text-charcoal/70">Complete your order securely</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-xl p-6 border border-gold/20 shadow-sm">
              <h3 className="text-lg font-semibold text-charcoal mb-4">Shipping Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={shippingInfo.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={shippingInfo.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-charcoal mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-charcoal mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-charcoal mb-2">Address Line 1 *</label>
                  <input
                    type="text"
                    name="address1"
                    value={shippingInfo.address1}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-charcoal mb-2">Address Line 2</label>
                  <input
                    type="text"
                    name="address2"
                    value={shippingInfo.address2}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={shippingInfo.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit pincode"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onMethodChange={setSelectedPaymentMethod}
            />
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <OrderSummary 
              cartItems={cartItems} 
              orderTotals={orderTotals}
              appliedDiscounts={appliedDiscounts}
              onDiscountApplied={handleDiscountApplied}
              onDiscountRemoved={handleDiscountRemoved}
            />
            
            {/* Available Promotions */}
            <div className="bg-white rounded-xl p-6 border border-gold/20 shadow-sm">
              <AvailablePromotions />
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                {errors.map((error, index) => (
                  <p key={index} className="text-red-700 text-sm">{error}</p>
                ))}
              </div>
            )}

            {/* Place Order Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-burgundy to-burgundy/90 text-white font-bold text-lg rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                `Pay ${formatCurrency(orderTotals.total || 0)}`
              )}
            </button>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-700 text-sm font-medium">
                  Secure payment powered by Razorpay
                </p>
              </div>
              <p className="text-green-600 text-xs mt-1">
                Your payment information is encrypted and secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}