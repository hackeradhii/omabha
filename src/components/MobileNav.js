import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCustomer } from '@/context/CustomerContext';

export default function MobileNav() {
  const router = useRouter();
  const { cartCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { isLoggedIn } = useCustomer();
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const path = router.pathname;
    if (path === '/') setActiveTab('home');
    else if (path === '/search') setActiveTab('search');
    else if (path === '/wishlist') setActiveTab('wishlist');
    else if (path === '/account' || path.startsWith('/account')) setActiveTab('account');
    else if (path === '/orders') setActiveTab('orders');
    else setActiveTab('');
  }, [router.pathname]);

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'search',
      label: 'Search',
      href: '/search',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      href: isLoggedIn ? '/wishlist' : '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      badge: wishlistCount > 0 ? wishlistCount : null,
      requiresAuth: true
    },
    {
      id: 'orders',
      label: 'Orders',
      href: isLoggedIn ? '/orders' : '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      requiresAuth: true
    },
    {
      id: 'account',
      label: 'Account',
      href: isLoggedIn ? '/account' : '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      requiresAuth: true
    }
  ];

  return (
    <>
      {/* Mobile Bottom Navigation - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gold/20 z-40 md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const shouldShow = !item.requiresAuth || isLoggedIn;
            
            if (!shouldShow) return null;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 relative transition-all duration-200 ${
                  isActive 
                    ? 'text-burgundy' 
                    : 'text-charcoal/60 hover:text-burgundy active:text-burgundy'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 bg-burgundy text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-burgundy' : 'text-charcoal/60'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-burgundy rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Button */}
      <div className="fixed bottom-20 right-4 z-30 md:hidden">
        <button 
          onClick={openCart}
          className="bg-burgundy text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 relative"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7M17 8v8a2 2 0 01-2 2H9a2 2 0 01-2-2V8" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-gold text-charcoal text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Content Spacer */}
      <div className="h-16 md:hidden"></div>
    </>
  );
}