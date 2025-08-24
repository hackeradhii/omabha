import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductImage } from './OptimizedImage';
import WishlistButton from './WishlistButton';
import ReviewSummary from './ReviewSummary';
import { useCart } from '@/context/CartContext';
import { useCustomer } from '@/context/CustomerContext';
import { getRelatedProducts } from '@/lib/shopify';
// Note: getRecommendedProducts, getProductRecommendations removed - trending features disabled

// Individual product recommendation card
function RecommendationCard({ product, size = 'default', showQuickAdd = true }) {
  const { addToCart } = useCart();
  const { title, handle, priceRange, images, compareAtPriceRange, availableForSale, tags } = product;
  const price = priceRange?.minVariantPrice?.amount;
  const comparePrice = compareAtPriceRange?.minVariantPrice?.amount;
  const discount = comparePrice && price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.variants?.edges?.[0]?.node && availableForSale) {
      addToCart({
        id: product.variants.edges[0].node.id,
        title: product.title,
        price: product.variants.edges[0].node.price || priceRange.minVariantPrice,
        image: product.images?.edges?.[0]?.node || product.images?.nodes?.[0] || { url: '', altText: title }
      });
    }
  };

  const formatPrice = (priceObj) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: priceObj?.currencyCode || 'INR',
    }).format(parseFloat(priceObj?.amount || 0));
  };

  const cardSize = size === 'compact' ? 'w-48' : 'w-64';
  const imageSize = size === 'compact' ? 'h-32' : 'h-48';

  return (
    <div className={`group bg-white rounded-xl overflow-hidden shadow-sm border border-gold/10 hover:shadow-lg transition-all duration-300 ${cardSize} flex-shrink-0`}>
      <Link href={`/products/${handle}`}>
        <div className={`relative ${imageSize} bg-gray-100 overflow-hidden`}>
          <ProductImage
            product={product}
            priority={false}
            sizes="(max-width: 768px) 200px, 256px"
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-burgundy text-white px-2 py-1 rounded-full text-xs font-bold">
              {discount}% OFF
            </div>
          )}
          
          {/* Wishlist Button */}
          <div className="absolute top-2 right-2">
            <WishlistButton 
              product={product} 
              size="sm" 
              variant="icon" 
              className="bg-white/80 hover:bg-white shadow-sm"
            />
          </div>
        </div>
      </Link>
      
      <div className="p-3">
        <Link href={`/products/${handle}`}>
          <h3 className="font-medium text-charcoal text-sm line-clamp-2 mb-2 group-hover:text-burgundy transition-colors">
            {title}
          </h3>
        </Link>
        
        {/* Tags */}
        {tags && tags.length > 0 && size !== 'compact' && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="text-xs bg-gold/10 text-charcoal/60 px-1 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Rating */}
        <div className="mb-2">
          <ReviewSummary productId={product.id} size="xs" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-serif font-bold text-burgundy">
              {formatPrice(priceRange?.minVariantPrice)}
            </span>
            {comparePrice && parseFloat(comparePrice) > parseFloat(price) && (
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(compareAtPriceRange?.minVariantPrice)}
              </span>
            )}
          </div>
          
          {showQuickAdd && availableForSale && (
            <button
              onClick={handleQuickAdd}
              className="px-2 py-1 bg-burgundy text-white text-xs rounded-md hover:bg-gold hover:text-charcoal transition-all duration-200 transform hover:scale-105"
            >
              + Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Related Products Component
export function RelatedProducts({ product, maxItems = 4 }) {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;
      
      try {
        setLoading(true);
        
        // Try to get related products based on product type, tags, or vendor
        const related = await getRelatedProducts(product.id, {
          productType: product.productType,
          tags: product.tags,
          vendor: product.vendor,
          excludeId: product.id
        });
        
        setRelatedProducts(related.slice(0, maxItems));
      } catch (error) {
        console.error('Error fetching related products:', error);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product, maxItems]);

  if (loading) {
    return (
      <div className="py-8">
        <h3 className="text-xl font-semibold text-charcoal mb-4">Related Products</h3>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-64 flex-shrink-0">
              <div className="bg-gray-200 h-48 rounded-t-xl animate-pulse"></div>
              <div className="bg-white p-3 rounded-b-xl border border-gold/10">
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) return null;

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-charcoal">You Might Also Like</h3>
        <Link href="/search" className="text-burgundy hover:text-gold text-sm font-medium">
          View All
        </Link>
      </div>
      
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {relatedProducts.map((relatedProduct) => (
          <RecommendationCard 
            key={relatedProduct.id} 
            product={relatedProduct} 
          />
        ))}
      </div>
    </div>
  );
}

// Frequently Bought Together Component
export function FrequentlyBoughtTogether({ product }) {
  const [bundleProducts, setBundleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBundleProducts = async () => {
      if (!product) return;
      
      try {
        setLoading(true);
        
        // Get products that are frequently bought together
        // This could be based on analytics data or manually curated bundles
        // Note: getProductRecommendations disabled, using fallback approach
        const bundle = [];
        
        setBundleProducts([product, ...bundle.slice(0, 2)]);
        
        const total = [product, ...bundle.slice(0, 2)].reduce((sum, p) => {
          return sum + parseFloat(p.priceRange?.minVariantPrice?.amount || 0);
        }, 0);
        setTotalPrice(total);
        
      } catch (error) {
        console.error('Error fetching bundle products:', error);
        setBundleProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBundleProducts();
  }, [product]);

  const handleAddBundle = () => {
    bundleProducts.forEach(bundleProduct => {
      if (bundleProduct.variants?.edges?.[0]?.node && bundleProduct.availableForSale) {
        addToCart({
          id: bundleProduct.variants.edges[0].node.id,
          title: bundleProduct.title,
          price: bundleProduct.variants.edges[0].node.price || bundleProduct.priceRange?.minVariantPrice,
          image: bundleProduct.images?.edges?.[0]?.node || bundleProduct.images?.nodes?.[0] || { url: '', altText: bundleProduct.title }
        });
      }
    });
  };

  if (loading || bundleProducts.length < 2) return null;

  return (
    <div className="bg-gradient-to-r from-ivory to-gold/5 rounded-2xl p-6 mb-8">
      <h3 className="text-xl font-semibold text-charcoal mb-4">Frequently Bought Together</h3>
      
      <div className="flex items-center space-x-4 mb-6 overflow-x-auto">
        {bundleProducts.map((bundleProduct, index) => (
          <div key={bundleProduct.id} className="flex items-center">
            <div className="w-20 h-24 bg-white rounded-lg overflow-hidden shadow-sm flex-shrink-0">
              <ProductImage
                product={bundleProduct}
                priority={false}
                sizes="80px"
                className="object-cover w-full h-full"
              />
            </div>
            {index < bundleProducts.length - 1 && (
              <div className="mx-3 text-charcoal/60">+</div>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-charcoal/70 mb-1">Bundle Price:</p>
          <p className="text-xl font-bold text-burgundy">
            ₹{totalPrice.toFixed(2)}
          </p>
        </div>
        
        <button
          onClick={handleAddBundle}
          className="px-6 py-3 bg-burgundy text-white rounded-lg hover:bg-gold hover:text-charcoal transition-all duration-300 font-medium"
        >
          Add All to Cart
        </button>
      </div>
    </div>
  );
}

// DISABLED: Personalized and trending recommendations component removed per user request
/*
// Personalized Recommendations Component
export function PersonalizedRecommendations({ maxItems = 6 }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { customer, isLoggedIn } = useCustomer();

  useEffect(() => {
    const fetchPersonalizedRecommendations = async () => {
      try {
        setLoading(true);
        
        let recommendedProducts = [];
        
        if (isLoggedIn && customer) {
          // Get personalized recommendations based on customer history
          recommendedProducts = await getProductRecommendations(customer.id, 'personalized');
        } else {
          // Get trending or popular products for non-logged-in users
          recommendedProducts = await getRecommendedProducts('trending');
        }
        
        setRecommendations(recommendedProducts.slice(0, maxItems));
      } catch (error) {
        console.error('Error fetching personalized recommendations:', error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalizedRecommendations();
  }, [customer, isLoggedIn, maxItems]);

  if (loading) {
    return (
      <div className="py-8">
        <h3 className="text-xl font-semibold text-charcoal mb-4">
          {isLoggedIn ? 'Recommended for You' : 'Trending Now'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(maxItems)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gold/10">
              <div className="aspect-[3/4] bg-gray-200 animate-pulse"></div>
              <div className="p-3">
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-charcoal">
          {isLoggedIn ? 'Recommended for You' : 'Trending Now'}
        </h3>
        <Link href="/search" className="text-burgundy hover:text-gold text-sm font-medium">
          View All
        </Link>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {recommendations.map((product) => (
          <RecommendationCard 
            key={product.id} 
            product={product} 
            size="compact"
          />
        ))}
      </div>
    </div>
  );
}
*/

// DISABLED: Recently viewed products component removed per user request
/*
// Recently Viewed Products Component
export function RecentlyViewed({ maxItems = 4 }) {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    // Get recently viewed products from localStorage
    const getRecentlyViewed = () => {
      if (typeof window === 'undefined') return [];
      
      try {
        const recent = localStorage.getItem('recentlyViewed');
        return recent ? JSON.parse(recent) : [];
      } catch (error) {
        console.error('Error getting recently viewed:', error);
        return [];
      }
    };

    const recent = getRecentlyViewed();
    setRecentProducts(recent.slice(0, maxItems));
  }, [maxItems]);

  if (recentProducts.length === 0) return null;

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-charcoal">Recently Viewed</h3>
        <button 
          onClick={() => {
            localStorage.removeItem('recentlyViewed');
            setRecentProducts([]);
          }}
          className="text-charcoal/60 hover:text-burgundy text-sm"
        >
          Clear History
        </button>
      </div>
      
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {recentProducts.map((product) => (
          <RecommendationCard 
            key={product.id} 
            product={product} 
          />
        ))}
      </div>
    </div>
  );
}
*/

export default RelatedProducts;