import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useCustomer } from '@/context/CustomerContext';
import { 
  applyDiscountCode, 
  removeDiscountCode, 
  getAvailablePromotions,
  getCustomerEligibleDiscounts 
} from '@/lib/shopify';

// Discount code input component
export function DiscountCodeInput({ onDiscountApplied, onDiscountRemoved }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const { cart } = useCart();

  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      setLoading(true);
      setError('');
      
      const result = await applyDiscountCode(code.trim(), cart);
      
      if (result.success) {
        setAppliedDiscount(result.discount);
        onDiscountApplied?.(result.discount);
        setCode('');
      } else {
        setError(result.error || 'Invalid discount code');
      }
    } catch (error) {
      setError('Failed to apply discount code');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDiscount = async () => {
    try {
      setLoading(true);
      const result = await removeDiscountCode(appliedDiscount.code);
      
      if (result.success) {
        setAppliedDiscount(null);
        onDiscountRemoved?.();
      }
    } catch (error) {
      console.error('Error removing discount:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      {!appliedDiscount ? (
        <form onSubmit={handleApplyDiscount} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Code
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter discount code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!code.trim() || loading}
                className="px-4 py-2 bg-burgundy text-white rounded-md hover:bg-gold hover:text-charcoal transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Applying...' : 'Apply'}
              </button>
            </div>
            {error && (
              <p className="text-red-600 text-sm mt-1">{error}</p>
            )}
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">
              {appliedDiscount.code} - {appliedDiscount.title}
            </span>
            <span className="text-sm text-green-600 font-semibold">
              -{appliedDiscount.value}
            </span>
          </div>
          <button
            onClick={handleRemoveDiscount}
            disabled={loading}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

// Promotional banner component
export function PromotionalBanner({ promotion, onClose }) {
  if (!promotion) return null;

  const getPromotionColor = (type) => {
    switch (type) {
      case 'percentage':
        return 'from-green-500 to-green-600';
      case 'fixed_amount':
        return 'from-blue-500 to-blue-600';
      case 'free_shipping':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-burgundy to-burgundy/90';
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getPromotionColor(promotion.type)} text-white py-3 px-4 relative`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1m0 0V6a2 2 0 112 0v1m0 0V9a2 2 0 11-2 0v2M6 12h.01M18 12h.01" />
          </svg>
          <span className="font-medium">{promotion.title}</span>
          {promotion.code && (
            <span className="bg-white/20 px-2 py-1 rounded text-sm font-bold">
              Use code: {promotion.code}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Available promotions component
export function AvailablePromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { customer, isLoggedIn } = useCustomer();

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        
        // Get general promotions
        const generalPromotions = await getAvailablePromotions();
        
        // Get customer-specific discounts if logged in
        let customerDiscounts = [];
        if (isLoggedIn && customer) {
          customerDiscounts = await getCustomerEligibleDiscounts(customer.id);
        }
        
        setPromotions([...generalPromotions, ...customerDiscounts]);
      } catch (error) {
        console.error('Error fetching promotions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [customer, isLoggedIn]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (promotions.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Available Offers</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map((promotion) => (
          <PromotionCard key={promotion.id} promotion={promotion} />
        ))}
      </div>
    </div>
  );
}

// Individual promotion card
function PromotionCard({ promotion }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (promotion.code) {
      navigator.clipboard.writeText(promotion.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPromotionIcon = (type) => {
    switch (type) {
      case 'percentage':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'fixed_amount':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'free_shipping':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 p-2 bg-burgundy/10 rounded-lg text-burgundy">
          {getPromotionIcon(promotion.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900">{promotion.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{promotion.description}</p>
          
          {promotion.minimum_amount && (
            <p className="text-xs text-gray-500 mt-2">
              Minimum order: ₹{promotion.minimum_amount}
            </p>
          )}
          
          {promotion.expires_at && (
            <p className="text-xs text-red-600 mt-1">
              Expires: {new Date(promotion.expires_at).toLocaleDateString()}
            </p>
          )}
          
          {promotion.code && (
            <div className="mt-3 flex items-center space-x-2">
              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                {promotion.code}
              </code>
              <button
                onClick={handleCopyCode}
                className="text-burgundy hover:text-gold text-sm font-medium"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Cart discount summary
export function CartDiscountSummary({ subtotal, appliedDiscounts = [] }) {
  if (appliedDiscounts.length === 0) return null;

  const calculateDiscount = (discount, subtotal) => {
    switch (discount.type) {
      case 'percentage':
        return (subtotal * discount.value) / 100;
      case 'fixed_amount':
        return Math.min(discount.value, subtotal);
      default:
        return 0;
    }
  };

  const totalDiscount = appliedDiscounts.reduce((total, discount) => {
    return total + calculateDiscount(discount, subtotal);
  }, 0);

  return (
    <div className="border-t border-gray-200 pt-4 space-y-2">
      {appliedDiscounts.map((discount) => (
        <div key={discount.id} className="flex justify-between text-sm">
          <span className="text-green-600">
            {discount.title} ({discount.code})
          </span>
          <span className="text-green-600 font-medium">
            -₹{calculateDiscount(discount, subtotal).toFixed(2)}
          </span>
        </div>
      ))}
      <div className="flex justify-between font-semibold">
        <span>Total Savings:</span>
        <span className="text-green-600">-₹{totalDiscount.toFixed(2)}</span>
      </div>
    </div>
  );
}

// Automatic discount notification
export function AutomaticDiscountNotification({ discount }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (discount) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [discount]);

  if (!discount || !show) return null;

  return (
    <div className="fixed top-24 right-4 z-50 max-w-sm">
      <div className="bg-green-500 text-white rounded-lg shadow-lg p-4 flex items-start space-x-3">
        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <h4 className="font-semibold">Discount Applied!</h4>
          <p className="text-sm">{discount.title}</p>
          <p className="text-sm opacity-90">You saved ₹{discount.amount}</p>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-white hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Marketing popup for new visitors
export function MarketingPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // Show popup after 10 seconds for new visitors
    const hasSeenPopup = localStorage.getItem('marketing_popup_seen');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => setShow(true), 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      // In production, this would subscribe to newsletter/marketing
      console.log('Subscribing email:', email);
      setSubscribed(true);
      
      setTimeout(() => {
        setShow(false);
        localStorage.setItem('marketing_popup_seen', 'true');
      }, 2000);
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('marketing_popup_seen', 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!subscribed ? (
          <>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Get 10% Off Your First Order!
              </h3>
              <p className="text-gray-600">
                Subscribe to our newsletter and be the first to know about new arrivals and exclusive offers.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-burgundy focus:border-burgundy"
              />
              <button
                type="submit"
                className="w-full bg-burgundy text-white py-3 rounded-lg hover:bg-gold hover:text-charcoal transition-colors font-medium"
              >
                Get My 10% Discount
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              No spam, unsubscribe at any time. Discount valid for first-time customers only.
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600 mb-4">Check your email for your 10% discount code.</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <code className="text-green-800 font-mono font-bold">WELCOME10</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiscountCodeInput;