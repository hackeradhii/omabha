import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import Image from 'next/image';
import { InventoryStatus } from './InventoryManagement';
import WishlistButton from './WishlistButton';

export default function MobileProductCard({ product }) {
  const { addToCart } = useCart();
  const [imageLoading, setImageLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Handle touch gestures for mobile interactions
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      // Left swipe - Add to cart
      handleAddToCart();
    } else if (isRightSwipe) {
      // Right swipe - View product details
      // This will be handled by the Link component naturally
    }
  };

  const handleAddToCart = () => {
    if (product.variants?.edges?.[0]?.node) {
      addToCart({
        id: product.variants.edges[0].node.id,
        title: product.title,
        price: product.variants.edges[0].node.price,
        image: product.images.nodes?.[0] || product.images.edges?.[0]?.node || { url: '/placeholder-product.svg', altText: product.title }
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: price.currencyCode || 'INR',
    }).format(parseFloat(price.amount));
  };

  return (
    <div 
      className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gold/10 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:scale-98"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Product Image */}
      <Link href={`/products/${product.handle}`}>
        <div className="relative aspect-[3/4] bg-gradient-to-br from-ivory to-gold/5 overflow-hidden">
          <Image
            src={product?.images?.nodes?.[0]?.url}
            alt={product?.images?.nodes?.[0]?.altText || `Image of ${product.title}`}
            width={600}
            height={800}
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${imageLoading ? 'blur-sm' : 'blur-0'}`}
            onLoad={() => setImageLoading(false)}
            priority={false}
          />

          {/* Mobile-specific overlay badges */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            {/* Inventory Status */}
            <InventoryStatus 
              product={product} 
              variant={product.variants?.edges?.[0]?.node} 
              className="bg-white/90 backdrop-blur-sm rounded-md" 
            />
            
            {/* Wishlist Button */}
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
              <WishlistButton 
                product={product} 
                className="w-5 h-5 text-charcoal hover:text-burgundy"
              />
            </div>
          </div>

          {/* Touch gesture hints */}
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-black/60 text-white px-2 py-1 rounded-md text-xs flex items-center">
              <span>←</span>
              <span className="ml-1">Add to Cart</span>
            </div>
            <div className="bg-black/60 text-white px-2 py-1 rounded-md text-xs flex items-center">
              <span>View</span>
              <span className="ml-1">→</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${product.handle}`}>
          <h3 className="font-medium text-charcoal line-clamp-2 text-sm leading-tight mb-2 group-hover:text-burgundy transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Price and Actions */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-col">
            {product.variants?.edges?.[0]?.node?.price && (
              <span className="font-serif text-burgundy font-semibold text-lg">
                {formatPrice(product.variants.edges[0].node.price)}
              </span>
            )}
            {product.vendor && (
              <span className="text-xs text-charcoal/60 mt-1">{product.vendor}</span>
            )}
          </div>

          {/* Mobile-friendly Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.variants?.edges?.[0]?.node?.availableForSale === false}
            className="bg-burgundy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold hover:text-charcoal transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95 touch-manipulation"
          >
            {product.variants?.edges?.[0]?.node?.availableForSale === false ? 'Sold Out' : 'Add'}
          </button>
        </div>

        {/* Mobile Touch Instructions */}
        <div className="mt-3 pt-3 border-t border-gold/10">
          <p className="text-xs text-charcoal/50 text-center">
            Swipe left to add to cart • Tap to view details
          </p>
        </div>
      </div>
    </div>
  );
}