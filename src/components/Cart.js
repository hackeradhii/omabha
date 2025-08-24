import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Cart() {
  const { cart, isCartOpen, closeCart, cartCount, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();
  const subtotal = cart.reduce((total, item) => total + item.quantity * parseFloat(item.price.amount), 0);

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-ivory shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gold/50">
          <h2 className="text-xl sm:text-2xl font-serif">Your Cart ({cartCount})</h2>
          <button 
            onClick={closeCart} 
            className="text-charcoal hover:text-burgundy p-2 rounded-full hover:bg-burgundy/10 transition-all duration-200 tap-target touch-manipulation active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 mobile-scroll">
          {cart.length === 0 ? (
            <p className="text-center text-charcoal/80">Your cart is empty.</p>
          ) : (
            <ul className="space-y-6">
              {cart.map(item => (
                <li key={item.id} className="flex items-center space-x-4">
                  <div className="w-16 h-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                    <Image 
                      src={item.image.url} 
                      alt={item.image.altText} 
                      width={64} 
                      height={80} 
                      className="object-cover w-full h-full" 
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-medium text-charcoal line-clamp-2 text-sm">{item.title}</h3>
                    <p className="font-serif text-burgundy font-semibold">₹{parseFloat(item.price.amount).toFixed(2)}</p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3 mt-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm hover:bg-burgundy hover:text-white transition-colors tap-target touch-manipulation active:scale-95"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-md min-w-[2rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm hover:bg-burgundy hover:text-white transition-colors tap-target touch-manipulation active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50 tap-target touch-manipulation active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-gold/50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-serif">Subtotal</span>
              <span className="text-xl font-bold font-serif text-gold">₹{subtotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full px-6 py-4 bg-burgundy text-white font-bold text-lg rounded-xl hover:bg-gold hover:text-charcoal transition-all duration-300 shadow-xl tap-target touch-manipulation active:scale-98 no-select"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
