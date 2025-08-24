import { getProducts, getHeroCollections } from '../lib/shopify';
import Link from 'next/link';
import WishlistButton from '@/components/WishlistButton';
import ReviewSummary from '@/components/ReviewSummary';
import MobileProductCard from '@/components/MobileProductCard';
import Image from 'next/image';
import { InventoryStatus } from '@/components/InventoryManagement';
import { MarketingPopup } from '@/components/MarketingPromotions';
import SEO from '@/components/SEO';
import { useCart } from '@/context/CartContext';
import HeroCarousel from '@/components/HeroCarousel';

function ProductCard({ product }) {
  const { title, handle, priceRange, images, compareAtPriceRange, availableForSale, tags } = product;
  const { addToCart } = useCart();
  const imageUrl = images?.nodes?.[0]?.url;
  const price = priceRange.minVariantPrice.amount;
  const comparePrice = compareAtPriceRange?.minVariantPrice?.amount;
  
  const discount = comparePrice && price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  const handleAddToCart = () => {
    if (product.variants?.edges?.[0]?.node) {
      addToCart({
        id: product.variants.edges[0].node.id,
        title: product.title,
        price: product.variants.edges[0].node.price,
        image: product.images.nodes?.[0] || product.images.edges?.[0]?.node || { url: imageUrl, altText: title }
      });
    }
  };

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gold/10">
      <Link href={`/products/${handle}`}>
        <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={images?.nodes?.[0]?.altText || `Image of ${title}`}
              width={600}
              height={800}
              className="object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-500"
              priority={false}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
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
      
      {/* Wishlist Button */}
      <div className="absolute top-3 right-3">
        <WishlistButton 
          product={product} 
          size="md" 
          variant="icon" 
          className="bg-white/80 hover:bg-white shadow-sm"
        />
      </div>
      
      <div className="p-4">
        <Link href={`/products/${handle}`}>
          <h3 className="font-medium text-charcoal line-clamp-2 mb-2 group-hover:text-burgundy transition-colors">
            {title}
          </h3>
        </Link>
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 2).map((tag, index) => (
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

        {/* Inventory Status */}
        <div className="mb-3">
          <InventoryStatus 
            product={product} 
            variant={product.variants?.edges?.[0]?.node || product.variants?.nodes?.[0]} 
          />
        </div>
        
        <div className="flex items-baseline justify-between">
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
          
          {/* Add to Cart Button - Hidden on mobile (uses MobileProductCard) */}
          <button
            onClick={handleAddToCart}
            disabled={!availableForSale}
            className="hidden sm:block bg-burgundy text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gold hover:text-charcoal transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {availableForSale ? 'Add to Cart' : 'Sold Out'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResponsiveProductCard({ product }) {
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

export default function HomePage({ products, heroCollections }) {
  console.log('🎯 Hero Collections Data:', heroCollections);
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Omabha Store - Traditional Indian Clothing',
    description: 'Discover beautiful traditional Indian clothing at Omabha Store. Handpicked sarees, kurtis, lehengas and more with authentic craftsmanship.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://omabha.com',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.title,
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://omabha.com'}/products/${product.handle}`
        }
      }))
    }
  };

  return (
    <>
      <SEO
        title="Omabha Store - Premium Traditional Indian Clothing | Sarees, Kurtis, Lehengas"
        description="Discover beautiful traditional Indian clothing at Omabha Store. Handpicked sarees, kurtis, lehengas and more with authentic craftsmanship. Free shipping across India."
        keywords="indian clothing, sarees online, kurtis, lehengas, traditional wear, ethnic wear, handwoven sarees, silk sarees, cotton kurtis, designer lehengas, wedding wear, party wear"
        structuredData={structuredData}
      />
      <main className="bg-ivory">
        {/* Hero Carousel Section */}
        <HeroCarousel 
          heroCollections={heroCollections}
          autoRotate={true}
          interval={5000} // 5 seconds
        />
      
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-24 lg:max-w-7xl lg:px-8">
        <div className="text-center border-b-2 border-gold pb-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Latest Arrivals</h2>
          <p className="mt-4 text-lg text-charcoal/80">Handpicked for timeless elegance.</p>
        </div>

        <div className="grid grid-cols-2 gap-y-6 gap-x-3 sm:grid-cols-2 sm:gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ResponsiveProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
      </main>
      
      {/* Marketing Popup for new visitors */}
      <MarketingPopup />
    </>
  );
}

export async function getStaticProps() {
  console.log('🚀 Fetching data for homepage...');
  
  const result = await getProducts();
  
  // Fetch hero collections for carousel
  const heroCollections = await getHeroCollections(10);
  console.log('🎯 Hero collections found:', heroCollections.length);
  
  return {
    props: {
      products: result.products || [],
      heroCollections: heroCollections || [],
    },
    revalidate: 60, // Revalidate every minute for updated content
  };
}
