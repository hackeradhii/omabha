import { createContext, useContext, useState } from 'react';
import { createCheckout } from '@/lib/shopify';
import { trackAddToCart, trackRemoveFromCart, trackBeginCheckout } from '@/components/Analytics';
import { trackCartAnalytics } from '@/lib/shopify';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  function openCart() {
    setIsCartOpen(true);
  }

  function closeCart() {
    setIsCartOpen(false);
  }

  function addToCart(newItem) {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === newItem.id);
      if (existingItem) {
        const updatedCart = prevCart.map(item =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
        
        // Track analytics for add to cart
        trackAddToCart(newItem, 1);
        trackCartAnalytics('add', {
          item: newItem,
          quantity: 1,
          totalItems: updatedCart.reduce((total, item) => total + item.quantity, 0),
          totalValue: updatedCart.reduce((total, item) => total + (parseFloat(item.price.amount || item.price) * item.quantity), 0)
        });
        
        return updatedCart;
      } else {
        const updatedCart = [...prevCart, { ...newItem, quantity: 1 }];
        
        // Track analytics for add to cart
        trackAddToCart(newItem, 1);
        trackCartAnalytics('add', {
          item: newItem,
          quantity: 1,
          totalItems: updatedCart.reduce((total, item) => total + item.quantity, 0),
          totalValue: updatedCart.reduce((total, item) => total + (parseFloat(item.price.amount || item.price) * item.quantity), 0)
        });
        
        return updatedCart;
      }
    });
    openCart();
  }

  function removeFromCart(itemId) {
    setCart((prevCart) => {
      const removedItem = prevCart.find(item => item.id === itemId);
      const updatedCart = prevCart.filter(item => item.id !== itemId);
      
      if (removedItem) {
        // Track analytics for remove from cart
        trackRemoveFromCart(removedItem, removedItem.quantity);
        trackCartAnalytics('remove', {
          item: removedItem,
          quantity: removedItem.quantity,
          totalItems: updatedCart.reduce((total, item) => total + item.quantity, 0),
          totalValue: updatedCart.reduce((total, item) => total + (parseFloat(item.price.amount || item.price) * item.quantity), 0)
        });
      }
      
      return updatedCart;
    });
  }

  function updateQuantity(itemId, newQuantity) {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart((prevCart) => 
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  async function checkout() {
    const lineItems = cart.map(item => {
        return {
            variantId: item.id,
            quantity: item.quantity,
        };
    });
    
    // Track begin checkout analytics
    const totalValue = cart.reduce((total, item) => total + (parseFloat(item.price.amount || item.price) * item.quantity), 0);
    trackBeginCheckout(cart, totalValue);
    trackCartAnalytics('checkout', {
      items: cart,
      totalItems: cart.reduce((total, item) => total + item.quantity, 0),
      totalValue
    });
    
    const checkoutData = await createCheckout(lineItems);
    if (checkoutData?.webUrl) {
        window.location.href = checkoutData.webUrl;
    } else {
        console.error("Failed to create checkout.");
    }
  }

  const value = {
    cart,
    isCartOpen,
    openCart,
    closeCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    checkout,
    cartCount: cart.reduce((total, item) => total + item.quantity, 0)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}