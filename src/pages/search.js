import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SearchFilter from '@/components/SearchFilter';
import WishlistButton from '@/components/WishlistButton';
import ReviewSummary from '@/components/ReviewSummary';
import MobileProductCard from '@/components/MobileProductCard';
import { ProductImage } from '@/components/OptimizedImage';
import { SearchSEO } from '@/components/SEO';
import { useCart } from '@/context/CartContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { title, handle, priceRange, compareAtPriceRange, images, variants, availableForSale, tags } = product;
  const imageUrl = images?.nodes?.[0]?.url;
  const price = priceRange?.minVariantPrice?.amount;
  const comparePrice = compareAtPriceRange?.minVariantPrice?.amount;
  const mainVariant = variants?.nodes?.[0];
  
  const discount = comparePrice && price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (mainVariant && availableForSale) {
      const itemToAdd = {
        id: mainVariant.id,
        title: product.title,
        price: mainVariant.price || priceRange.minVariantPrice,
        image: images.nodes[0] || { url: '', altText: title }
      };
      addToCart(itemToAdd);
    }
  };

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gold/10">
      <Link href={`/products/${handle}`}>
        <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
          {imageUrl ? (
            <ProductImage
              product={product}
              priority={false}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Wishlist Button */}
          <div className="absolute top-3 right-3">
            <WishlistButton 
              product={product} 
              size="md" 
              variant="icon" 
              className="bg-white/80 hover:bg-white shadow-sm"
            />
          </div>
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-burgundy text-white px-2 py-1 rounded-full text-xs font-bold">
              {discount}% OFF
            </div>
          )}
          
          {/* Availability Badge */}
          {!availableForSale && (
            <div className="absolute bottom-3 left-3 bg-gray-800 text-white px-2 py-1 rounded-full text-xs font-medium">
              Out of Stock
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/products/${handle}`}>
          <h3 className="font-medium text-charcoal line-clamp-2 mb-2 group-hover:text-burgundy transition-colors">
            {title}
          </h3>
        </Link>
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs bg-gold/10 text-charcoal/60 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Rating */}
        <div className="mb-3">
          <ReviewSummary productId={product.id} size="sm" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-serif font-bold text-burgundy">
              ₹{parseFloat(price).toFixed(2)}
            </span>
            {comparePrice && parseFloat(comparePrice) > parseFloat(price) && (
              <span className="text-sm text-gray-500 line-through">
                ₹{parseFloat(comparePrice).toFixed(2)}
              </span>
            )}
          </div>
          
          {availableForSale && mainVariant && (
            <button
              onClick={handleAddToCart}
              className="hidden sm:block px-3 py-1.5 bg-burgundy text-white text-sm rounded-lg hover:bg-gold hover:text-charcoal transition-all duration-200 transform hover:scale-105 touch-manipulation active:scale-95"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ResponsiveSearchProductCard({ product }) {
  return (
    <>
      {/* Mobile version */}
      <div className="block sm:hidden">
        <MobileProductCard product={product} />
      </div>
      
      {/* Desktop version */}
      <div className="hidden sm:block">
        <ProductCard product={product} />
      </div>
    </>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 gap-y-4 gap-x-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gold/10">
          <div className="aspect-[3/4] bg-gray-200 animate-pulse"></div>
          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;
  const [searchResults, setSearchResults] = useState({ products: [], pageInfo: {} });
  const [isLoading, setIsLoading] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');

  useEffect(() => {
    if (q && typeof q === 'string') {
      setInitialQuery(q);
    }
  }, [q]);

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setIsLoading(false);
  };

  const { products, pageInfo } = searchResults;
  const hasResults = products && products.length > 0;

  return (
    <>
      <SearchSEO query={initialQuery} resultsCount={products.length} />
      <div className="min-h-screen bg-gradient-to-br from-ivory via-ivory to-gold/5 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-charcoal mb-4">
            {initialQuery ? `Search Results for "${initialQuery}"` : 'Search Our Collection'}
          </h1>
          <p className="text-charcoal/70 text-lg max-w-2xl mx-auto">
            Discover beautiful traditional Indian clothing with our advanced search and filtering options
          </p>
        </div>

        {/* Search Filter Component */}
        <SearchFilter 
          onResults={handleSearchResults}
          initialQuery={initialQuery}
          className="mb-8"
        />

        {/* Results Section */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gold/20">
          {/* Results Header */}
          {hasResults && (
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-charcoal">
                  {products.length} {products.length === 1 ? 'Product' : 'Products'} Found
                </h2>
                {pageInfo.hasNextPage && (
                  <span className="text-sm text-charcoal/60">
                    (Showing first {products.length} results)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && <LoadingGrid />}

          {/* Results Grid */}
          {!isLoading && hasResults && (
            <div className="grid grid-cols-2 gap-y-4 gap-x-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ResponsiveSearchProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* No Results State */}
          {!isLoading && !hasResults && (
            <div className="text-center py-16">
              <svg className="w-24 h-24 text-charcoal/20 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-2xl font-semibold text-charcoal mb-4">No Products Found</h3>
              <p className="text-charcoal/70 mb-8 max-w-md mx-auto">
                We couldn't find any products matching your search criteria. Try adjusting your filters or search terms.
              </p>
              <Link href="/" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-burgundy to-burgundy/90 text-white rounded-xl hover:shadow-lg transition-all duration-300">
                Browse All Products
              </Link>
            </div>
          )}

          {/* Load More Button */}
          {!isLoading && hasResults && pageInfo.hasNextPage && (
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <button className="px-8 py-3 bg-gradient-to-r from-burgundy to-burgundy/90 text-white rounded-xl hover:shadow-lg transition-all duration-300">
                Load More Products
              </button>
            </div>
          )}
        </div>

        {/* Popular Searches */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-medium text-charcoal mb-4">Popular Searches</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {['silk saree', 'cotton kurti', 'designer lehenga', 'wedding collection', 'party wear', 'embroidered dress'].map((term) => (
              <Link 
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="px-4 py-2 bg-white/70 text-charcoal rounded-full hover:bg-burgundy hover:text-white transition-all duration-200 text-sm"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}