import { useState, useEffect } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { useCustomer } from '@/context/CustomerContext';

export default function WishlistButton({ 
  product, 
  size = 'md', 
  variant = 'icon', 
  className = '',
  showTooltip = true,
  onToggle = null 
}) {
  const { 
    isInWishlist, 
    toggleWishlist, 
    isLoading, 
    error,
    isLoggedIn 
  } = useWishlist();
  const [isToggling, setIsToggling] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [notification, setNotification] = useState('');

  const isInWishlistState = isInWishlist(product.id);

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'w-8 h-8 p-1.5',
      icon: 'w-4 h-4',
      text: 'text-xs',
      spacing: 'space-x-1.5'
    },
    md: {
      button: 'w-10 h-10 p-2',
      icon: 'w-5 h-5',
      text: 'text-sm',
      spacing: 'space-x-2'
    },
    lg: {
      button: 'w-12 h-12 p-2.5',
      icon: 'w-6 h-6',
      text: 'text-base',
      spacing: 'space-x-2.5'
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  const handleToggle = async () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    setIsToggling(true);
    try {
      const result = await toggleWishlist(product);
      
      if (result.success) {
        setNotification(result.message);
        setTimeout(() => setNotification(''), 2000);
        
        // Call onToggle callback if provided
        if (onToggle) {
          onToggle(isInWishlistState, result);
        }
      } else {
        setNotification(result.message || 'Something went wrong');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (error) {
      setNotification('Failed to update wishlist');
      setTimeout(() => setNotification(''), 3000);
    } finally {
      setIsToggling(false);
    }
  };

  // Button content based on variant
  const renderContent = () => {
    if (variant === 'text') {
      return (
        <div className={`flex items-center ${config.spacing}`}>
          <HeartIcon />
          <span className={`font-medium ${config.text}`}>
            {isInWishlistState ? 'Saved' : 'Save'}
          </span>
        </div>
      );
    }

    if (variant === 'full') {
      return (
        <div className={`flex items-center justify-center ${config.spacing} px-4 py-2`}>
          <HeartIcon />
          <span className={`font-medium ${config.text}`}>
            {isInWishlistState ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </span>
        </div>
      );
    }

    // Default icon variant
    return <HeartIcon />;
  };

  const HeartIcon = () => {
    if (isToggling || isLoading) {
      return (
        <svg className={`${config.icon} animate-spin`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    }

    return (
      <svg 
        className={`${config.icon} transition-all duration-200`} 
        fill={isInWishlistState ? "currentColor" : "none"} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
    );
  };

  // Base button classes
  const baseClasses = `
    relative transition-all duration-200 transform hover:scale-110 active:scale-95 
    focus:outline-none focus:ring-2 focus:ring-burgundy/20 rounded-full
    ${isInWishlistState 
      ? 'text-red-500 hover:text-red-600' 
      : 'text-charcoal/60 hover:text-red-500'
    }
    ${variant === 'icon' ? config.button : ''}
    ${variant === 'full' ? 'w-full rounded-xl border border-gray-200 hover:border-red-300' : ''}
    ${variant === 'text' ? 'px-3 py-1.5 rounded-lg hover:bg-red-50' : ''}
    ${className}
  `;

  return (
    <div className="relative inline-block">
      <button
        onClick={handleToggle}
        disabled={isToggling || isLoading}
        className={baseClasses}
        aria-label={isInWishlistState ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {renderContent()}
      </button>

      {/* Tooltip */}
      {showTooltip && variant === 'icon' && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-charcoal text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {isInWishlistState ? 'Remove from wishlist' : 'Add to wishlist'}
        </div>
      )}

      {/* Login Prompt */}
      {showLoginPrompt && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-burgundy text-white text-xs rounded-lg whitespace-nowrap z-20 animate-fadeIn">
          Please log in to save items
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap z-20 animate-fadeIn ${
          notification.includes('Failed') || notification.includes('wrong')
            ? 'bg-red-100 text-red-700 border border-red-200'
            : 'bg-green-100 text-green-700 border border-green-200'
        }`}>
          {notification}
        </div>
      )}

      {/* Error Display */}
      {error && variant === 'full' && (
        <div className="mt-2 text-xs text-red-600 text-center">
          {error}
        </div>
      )}
    </div>
  );
}