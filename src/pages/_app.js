import '@/styles/globals.css';
import { CartProvider } from '@/context/CartContext';
import { CustomerProvider } from '@/context/CustomerContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Cart from '@/components/Cart';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import { PerformanceMonitor, trackWebVitals } from '@/components/PerformanceMonitor';
import { LiveChatWidget } from '@/components/CustomerSupport';
import { GoogleAnalytics, UserBehaviorTracker, initGA } from '@/components/Analytics';
import { CookieConsentBanner } from '@/components/Privacy';
import { enforceHTTPS } from '@/lib/security';
import SEO from '@/components/SEO';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Enforce HTTPS in production
    enforceHTTPS();
    
    // Initialize Google Analytics
    initGA();
    
    // Create unique session ID for analytics
    if (typeof window !== 'undefined' && !sessionStorage.getItem('session_id')) {
      sessionStorage.setItem('session_id', `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, []);

  return (
    <>
      {/* Google Analytics */}
      <GoogleAnalytics />
      
      {/* Default SEO */}
      <SEO />
      
      {/* Performance monitoring */}
      <PerformanceMonitor />
      
      <CustomerProvider>
        <WishlistProvider>
          <CartProvider>
            {/* User behavior tracking */}
            <UserBehaviorTracker />
            
            <Header />
            <Component {...pageProps} />
            <Cart />
            <MobileNav />
            {/* Global live chat widget */}
            <LiveChatWidget />
            {/* GDPR Cookie Consent */}
            <CookieConsentBanner />
          </CartProvider>
        </WishlistProvider>
      </CustomerProvider>
    </>
  );
}

// Export function to track web vitals
export { trackWebVitals };
