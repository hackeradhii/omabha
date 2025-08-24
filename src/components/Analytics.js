import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useCustomer } from '@/context/CustomerContext';
import { useCart } from '@/context/CartContext';

// Google Analytics configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID || 'G-XXXXXXXXXX';

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Track page views
export const trackPageView = (url, title) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_title: title,
      page_location: url,
    });
  }
};

// Track events
export const trackEvent = (action, category, label, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// E-commerce tracking functions
export const trackPurchase = (transactionId, items, value, currency = 'INR') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.title,
        category: item.productType,
        quantity: item.quantity,
        price: item.price.amount || item.price,
      }))
    });
  }
};

export const trackAddToCart = (item, quantity = 1) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'INR',
      value: parseFloat(item.price.amount || item.price) * quantity,
      items: [{
        item_id: item.id,
        item_name: item.title,
        category: item.productType,
        quantity: quantity,
        price: item.price.amount || item.price,
      }]
    });
  }
};

export const trackRemoveFromCart = (item, quantity = 1) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'remove_from_cart', {
      currency: 'INR',
      value: parseFloat(item.price.amount || item.price) * quantity,
      items: [{
        item_id: item.id,
        item_name: item.title,
        category: item.productType,
        quantity: quantity,
        price: item.price.amount || item.price,
      }]
    });
  }
};

export const trackViewItem = (item) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'INR',
      value: parseFloat(item.price.amount || item.price),
      items: [{
        item_id: item.id,
        item_name: item.title,
        category: item.productType,
        price: item.price.amount || item.price,
      }]
    });
  }
};

export const trackBeginCheckout = (items, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'INR',
      value: value,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.title,
        category: item.productType,
        quantity: item.quantity,
        price: item.price.amount || item.price,
      }))
    });
  }
};

export const trackSearch = (searchTerm, resultCount) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
      result_count: resultCount
    });
  }
};

export const trackSignUp = (method = 'email') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      method: method
    });
  }
};

export const trackLogin = (method = 'email') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login', {
      method: method
    });
  }
};

// Custom event tracking for specific business metrics
export const trackWishlistAdd = (item) => {
  trackEvent('add_to_wishlist', 'engagement', item.title, parseFloat(item.price.amount || item.price));
};

export const trackWishlistRemove = (item) => {
  trackEvent('remove_from_wishlist', 'engagement', item.title, parseFloat(item.price.amount || item.price));
};

export const trackReviewSubmit = (productId, rating) => {
  trackEvent('submit_review', 'engagement', productId, rating);
};

export const trackSupportContact = (category) => {
  trackEvent('contact_support', 'customer_service', category);
};

export const trackDiscountUsed = (discountCode, value) => {
  trackEvent('discount_applied', 'marketing', discountCode, value);
};

export const trackNewsletterSignup = (source) => {
  trackEvent('newsletter_signup', 'marketing', source);
};

// Performance tracking
export const trackPerformance = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Track Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          window.gtag('event', 'page_load_time', {
            event_category: 'performance',
            value: Math.round(entry.loadEventEnd - entry.loadEventStart)
          });
        }
      }
    });
    observer.observe({ entryTypes: ['navigation'] });
  }
};

// User behavior tracking component
export function UserBehaviorTracker() {
  const router = useRouter();
  const { customer } = useCustomer();
  const { cart } = useCart();
  const [sessionStart] = useState(Date.now());

  useEffect(() => {
    // Track page views
    const handleRouteChange = (url) => {
      trackPageView(url, document.title);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  useEffect(() => {
    // Track user sessions
    const sessionDuration = () => {
      const duration = Math.round((Date.now() - sessionStart) / 1000);
      trackEvent('session_duration', 'engagement', 'session_end', duration);
    };

    window.addEventListener('beforeunload', sessionDuration);
    return () => {
      window.removeEventListener('beforeunload', sessionDuration);
    };
  }, [sessionStart]);

  useEffect(() => {
    // Track user authentication status
    if (customer) {
      trackEvent('user_authenticated', 'user', customer.id);
    }
  }, [customer]);

  useEffect(() => {
    // Track cart abandonment with proper null/undefined checks
    if (cart && Array.isArray(cart) && cart.length > 0) {
      const abandonmentTimer = setTimeout(() => {
        trackEvent('cart_abandonment', 'ecommerce', 'timeout', cart.length);
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearTimeout(abandonmentTimer);
    }
  }, [cart]);

  return null; // This component doesn't render anything
}

// Analytics dashboard component for admin
export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState({
    pageViews: 0,
    uniqueVisitors: 0,
    conversionRate: 0,
    averageOrderValue: 0,
    topProducts: [],
    trafficSources: [],
    loading: true
  });

  useEffect(() => {
    // Simulate analytics data fetch
    // In a real implementation, this would fetch from Google Analytics API
    const fetchAnalytics = async () => {
      try {
        // Mock data for demonstration
        const mockData = {
          pageViews: 12543,
          uniqueVisitors: 8932,
          conversionRate: 3.2,
          averageOrderValue: 2450,
          topProducts: [
            { name: 'Banarasi Silk Saree', views: 1234, sales: 45 },
            { name: 'Lehenga Choli Set', views: 987, sales: 32 },
            { name: 'Cotton Kurta', views: 876, sales: 28 }
          ],
          trafficSources: [
            { source: 'Organic Search', percentage: 45 },
            { source: 'Social Media', percentage: 25 },
            { source: 'Direct', percentage: 20 },
            { source: 'Email', percentage: 10 }
          ]
        };

        setAnalytics({ ...mockData, loading: false });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setAnalytics(prev => ({ ...prev, loading: false }));
      }
    };

    fetchAnalytics();
  }, []);

  if (analytics.loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics Overview</h2>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{analytics.pageViews.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Page Views</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{analytics.uniqueVisitors.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Unique Visitors</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{analytics.conversionRate}%</p>
            <p className="text-sm text-gray-600">Conversion Rate</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">₹{analytics.averageOrderValue}</p>
            <p className="text-sm text-gray-600">Avg Order Value</p>
          </div>
        </div>

        {/* Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">Top Products</h3>
            <div className="space-y-3">
              {analytics.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.views} views</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{product.sales} sales</p>
                    <p className="text-xs text-gray-500">
                      {((product.sales / product.views) * 100).toFixed(1)}% conversion
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">Traffic Sources</h3>
            <div className="space-y-3">
              {analytics.trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{source.source}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-burgundy h-2 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{source.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Google Analytics script component
export function GoogleAnalytics() {
  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `,
        }}
      />
    </>
  );
}

export default UserBehaviorTracker;