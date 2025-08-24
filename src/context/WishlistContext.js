import { createContext, useContext, useState, useEffect } from 'react';
import { useCustomer } from './CustomerContext';
import { 
  getCustomerWishlist, 
  addToWishlist as addToWishlistAPI, 
  removeFromWishlist as removeFromWishlistAPI,
  isInWishlist as isInWishlistAPI
} from '@/lib/shopify';

const WishlistContext = createContext();

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { customer, customerAccessToken, isLoggedIn } = useCustomer();

  // Load wishlist when customer logs in
  useEffect(() => {
    const loadWishlist = async () => {
      if (isLoggedIn && customerAccessToken) {
        setIsLoading(true);
        setError(null);
        try {
          const wishlistProducts = await getCustomerWishlist(customerAccessToken);
          setWishlist(wishlistProducts);
        } catch (error) {
          console.error('Failed to load wishlist:', error);
          setError('Failed to load wishlist');
          setWishlist([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Clear wishlist when not logged in
        setWishlist([]);
        setError(null);
      }
    };

    loadWishlist();
  }, [isLoggedIn, customerAccessToken]);

  // Add product to wishlist
  const addToWishlist = async (product) => {
    if (!isLoggedIn || !customerAccessToken) {
      setError('Please log in to add items to your wishlist');
      return { success: false, message: 'Please log in to add items to your wishlist' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await addToWishlistAPI(customerAccessToken, product.id);
      
      if (result.success) {
        // Add product to local state if not already present
        setWishlist(prev => {
          const isAlreadyInWishlist = prev.some(item => item.id === product.id);
          if (!isAlreadyInWishlist) {
            return [...prev, product];
          }
          return prev;
        });
        return { success: true, message: 'Added to wishlist!' };
      } else {
        const errorMessage = result.errors?.[0]?.message || 'Failed to add to wishlist';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      const errorMessage = 'Failed to add to wishlist';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    if (!isLoggedIn || !customerAccessToken) {
      setError('Please log in to manage your wishlist');
      return { success: false, message: 'Please log in to manage your wishlist' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await removeFromWishlistAPI(customerAccessToken, productId);
      
      if (result.success) {
        // Remove product from local state
        setWishlist(prev => prev.filter(item => item.id !== productId));
        return { success: true, message: 'Removed from wishlist' };
      } else {
        const errorMessage = result.errors?.[0]?.message || 'Failed to remove from wishlist';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      const errorMessage = 'Failed to remove from wishlist';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle product in wishlist
  const toggleWishlist = async (product) => {
    const isInWishlist = wishlist.some(item => item.id === product.id);
    
    if (isInWishlist) {
      return await removeFromWishlist(product.id);
    } else {
      return await addToWishlist(product);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  // Clear wishlist
  const clearWishlist = () => {
    setWishlist([]);
    setError(null);
  };

  // Get wishlist count
  const wishlistCount = wishlist.length;

  // Check if product is in wishlist (async version for server-side verification)
  const checkIfInWishlist = async (productId) => {
    if (!isLoggedIn || !customerAccessToken) {
      return false;
    }

    try {
      return await isInWishlistAPI(customerAccessToken, productId);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      return false;
    }
  };

  const value = {
    wishlist,
    wishlistCount,
    isLoading,
    error,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    checkIfInWishlist,
    clearWishlist,
    isLoggedIn
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}