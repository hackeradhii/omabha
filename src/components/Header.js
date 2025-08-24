import { useCart } from '@/context/CartContext';
import { useCustomer } from '@/context/CustomerContext';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthModal from './AuthModal';

export default function Header() {
  const { openCart, cartCount } = useCart();
  const { customer, isLoggedIn, logout } = useCustomer();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Check if we're on homepage to handle transparent navbar over hero
  const isHomepage = router.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // On homepage, navbar becomes solid after scrolling past hero (viewport height)
      // On other pages, navbar becomes solid after 50px
      const scrollThreshold = isHomepage ? window.innerHeight * 0.8 : 50;
      setIsScrolled(scrollPosition > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomepage]);

  const handleAuthClick = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserDropdown(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchBar(false);
      setSearchQuery('');
    }
  };

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    if (showSearchBar) {
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Sarees', href: '/collections/sarees' },
    { name: 'Kurtis', href: '/collections/kurtis' },
    { name: 'New Arrivals', href: '/collections/new-arrivals' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-in-out ${
      isScrolled ? 'py-2' : 'py-4'
    }`}>
      <nav className={`mx-auto smooth-transform ${
        isScrolled 
          ? 'max-w-3xl px-4 py-2 bg-ivory/98 backdrop-blur-lg rounded-full shadow-xl border border-gold/30 navbar-pill' 
          : isHomepage
          ? 'max-w-5xl px-6 py-4 bg-transparent backdrop-blur-none rounded-full shadow-none border-none navbar-pill'
          : 'max-w-5xl px-6 py-4 bg-ivory/92 backdrop-blur-md rounded-full shadow-2xl border border-gold/20 navbar-pill'
      }`}>
        <div className={`flex justify-between items-center transition-all duration-300 ${
          isScrolled ? 'gap-8' : ''
        }`}>
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="block">
              <Image 
                src="/logo.png" 
                alt="Omabha Logo" 
                width={isScrolled ? 70 : 90} 
                height={isScrolled ? 35 : 45}
                className={`object-contain transition-all duration-300 ${
                  isScrolled ? 'transform scale-90' : ''
                }`}
                priority
              />
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className={`hidden lg:flex transition-all duration-300 ${
            isScrolled ? 'lg:gap-x-4' : 'lg:gap-x-6'
          }`}>
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`relative font-semibold transition-all duration-300 group px-3 py-2 rounded-full ${
                  isScrolled ? 'text-sm' : 'text-md'
                } ${
                  isHomepage && !isScrolled 
                    ? 'text-white hover:text-gold drop-shadow-lg' 
                    : 'text-charcoal hover:text-gold'
                }`}
              >
                <span className="relative z-10">{link.name}</span>
                <div className="absolute inset-0 bg-gold/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
              </Link>
            ))}
          </div>

          {/* Right: Icons, User Account & Mobile Menu Button */}
          <div className={`flex items-center transition-all duration-300 ${
            isScrolled ? 'gap-x-2' : 'gap-x-4'
          }`}>
            {/* Search */}
            <div className="relative">
              <button 
                onClick={toggleSearchBar}
                className={`hidden lg:block transition-all duration-300 rounded-full hover:bg-gold/10 ${
                  isScrolled ? 'p-1.5 scale-90' : 'p-2'
                } ${
                  isHomepage && !isScrolled 
                    ? 'text-white hover:text-gold drop-shadow-lg' 
                    : 'text-charcoal hover:text-gold'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {/* Search Bar Overlay */}
              {showSearchBar && (
                <div className="absolute right-0 top-full mt-2 z-30">
                  <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl border border-gold/20 p-4 w-80">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search sarees, kurtis, lehengas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-12 pr-12 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                        autoFocus
                      />
                      <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-burgundy text-white text-sm rounded-lg hover:bg-gold hover:text-charcoal transition-colors"
                      >
                        Go
                      </button>
                    </div>
                    <div className="mt-3 text-center">
                      <Link href="/search" className="text-sm text-burgundy hover:text-gold transition-colors">
                        Advanced Search
                      </Link>
                    </div>
                  </form>
                </div>
              )}
            </div>
            
            {/* User Account */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className={`flex items-center space-x-2 transition-all duration-300 rounded-full hover:bg-gold/10 ${
                    isScrolled ? 'p-1.5 scale-90' : 'p-2'
                  } ${
                    isHomepage && !isScrolled 
                      ? 'text-white hover:text-gold drop-shadow-lg' 
                      : 'text-charcoal hover:text-gold'
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-burgundy to-gold rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {customer?.firstName?.charAt(0) || customer?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  {!isScrolled && (
                    <span className="hidden lg:block text-sm font-medium">
                      {customer?.firstName || 'Account'}
                    </span>
                  )}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gold/20 py-2 z-30">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-charcoal">
                        {customer?.firstName} {customer?.lastName}
                      </p>
                      <p className="text-sm text-charcoal/70">{customer?.email}</p>
                    </div>
                    
                    <div className="py-2">
                      <Link href="/account" className="flex items-center px-4 py-2 text-charcoal hover:bg-gold/10 transition-colors">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Account
                      </Link>
                      <Link href="/account/orders" className="flex items-center px-4 py-2 text-charcoal hover:bg-gold/10 transition-colors">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        My Orders
                      </Link>
                      <Link href="/account/wishlist" className="flex items-center px-4 py-2 text-charcoal hover:bg-gold/10 transition-colors">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Wishlist
                      </Link>
                      <hr className="my-2 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleAuthClick('login')}
                className={`hidden lg:flex items-center space-x-2 transition-all duration-300 rounded-full hover:bg-gold/10 ${
                  isScrolled ? 'p-1.5 scale-90' : 'p-2'
                } ${
                  isHomepage && !isScrolled 
                    ? 'text-white hover:text-gold drop-shadow-lg' 
                    : 'text-charcoal hover:text-gold'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {!isScrolled && <span className="text-sm font-medium">Sign In</span>}
              </button>
            )}
            <button 
              onClick={openCart} 
              className={`relative transition-all duration-300 rounded-full hover:bg-gold/10 group ${
                isScrolled ? 'p-1.5 scale-90' : 'p-2'
              } ${
                isHomepage && !isScrolled 
                  ? 'text-white hover:text-gold drop-shadow-lg' 
                  : 'text-charcoal hover:text-gold'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`fill="none" viewBox="0 0 24 24" stroke="currentColor" transition-transform duration-300 group-hover:scale-110 ${
                isScrolled ? 'h-6 w-6' : 'h-7 w-7'
              }`}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className={`absolute bg-burgundy text-white font-bold rounded-full flex items-center justify-center transition-all duration-300 animate-pulse ${
                  isScrolled ? '-top-1 -right-1 h-4 w-4 text-xs' : '-top-2 -right-2 h-5 w-5 text-xs'
                }`}>
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className={`lg:hidden transition-all duration-300 rounded-full hover:bg-gold/10 ${
                isScrolled ? 'p-1.5 scale-90' : 'p-2'
              } ${
                isHomepage && !isScrolled 
                  ? 'text-white hover:text-gold drop-shadow-lg' 
                  : 'text-charcoal hover:text-gold'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className={`py-4 border-t border-gold/30 mt-4 transition-all duration-300 ${
            isScrolled ? 'rounded-b-2xl' : ''
          }`}>
            <div className="flex flex-col gap-y-4">
              {navLinks.map((link, index) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={`text-md font-semibold text-charcoal hover:text-gold transition-all duration-300 transform hover:translate-x-2 py-2 px-3 rounded-lg hover:bg-gold/10 ${
                    isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                  style={{ 
                    transitionDelay: isMenuOpen ? `${index * 100}ms` : '0ms' 
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Mobile Auth */}
              {!isLoggedIn ? (
                <>
                  <button 
                    onClick={() => handleAuthClick('login')}
                    className={`flex items-center gap-x-2 text-charcoal hover:text-gold transition-all duration-300 transform hover:translate-x-2 py-2 px-3 rounded-lg hover:bg-gold/10 ${
                      isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                    style={{ 
                      transitionDelay: isMenuOpen ? `${navLinks.length * 100}ms` : '0ms' 
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Sign In</span>
                  </button>
                  <button 
                    onClick={() => handleAuthClick('register')}
                    className={`flex items-center gap-x-2 text-charcoal hover:text-gold transition-all duration-300 transform hover:translate-x-2 py-2 px-3 rounded-lg hover:bg-gold/10 ${
                      isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                    style={{ 
                      transitionDelay: isMenuOpen ? `${(navLinks.length + 1) * 100}ms` : '0ms' 
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Sign Up</span>
                  </button>
                </>
              ) : (
                <>
                  <div className={`flex items-center gap-x-3 py-2 px-3 ${
                    isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                  style={{ 
                    transitionDelay: isMenuOpen ? `${navLinks.length * 100}ms` : '0ms' 
                  }}>
                    <div className="w-8 h-8 bg-gradient-to-br from-burgundy to-gold rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {customer?.firstName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="font-medium text-charcoal">
                      {customer?.firstName} {customer?.lastName}
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className={`flex items-center gap-x-2 text-red-600 hover:text-red-700 transition-all duration-300 transform hover:translate-x-2 py-2 px-3 rounded-lg hover:bg-red-50 ${
                      isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                    style={{ 
                      transitionDelay: isMenuOpen ? `${(navLinks.length + 1) * 100}ms` : '0ms' 
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </>
              )}
              <button 
                onClick={() => {
                  router.push('/search');
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-x-2 text-charcoal hover:text-gold transition-all duration-300 transform hover:translate-x-2 py-2 px-3 rounded-lg hover:bg-gold/10 tap-target mobile-focus touch-manipulation ${
                isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ 
                transitionDelay: isMenuOpen ? `${navLinks.length * 100}ms` : '0ms' 
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode={authMode}
      />
    </header>
  );
}