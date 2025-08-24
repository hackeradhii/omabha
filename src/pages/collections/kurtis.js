import { getProducts } from '@/lib/shopify';
import Image from 'next/image';
import Link from 'next/link';
import WishlistButton from '@/components/WishlistButton';
import ReviewSummary from '@/components/ReviewSummary';

function ProductCard({ product }) {
  const { title, handle, priceRange, images, compareAtPriceRange, availableForSale, tags } = product;
  const imageUrl = images.nodes[0]?.url;
  const price = priceRange.minVariantPrice.amount;
  const comparePrice = compareAtPriceRange?.minVariantPrice?.amount;
  
  const discount = comparePrice && price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gold/10">
      <Link href={`/products/${handle}`}>
        <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
          <Image
            src={imageUrl}
            alt={images.nodes[0]?.altText || `Image of ${title}`}
            width={500}
            height={750}
            className="object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          
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
      </div>
    </div>
  );
}

export default function KurtisPage({ products }) {
  const kurtiProducts = products.filter(product => 
    product.title.toLowerCase().includes('kurti') || 
    product.title.toLowerCase().includes('anarkali') ||
    product.title.toLowerCase().includes('suit')
  );

  return (
    <main className="bg-ivory min-h-screen pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center border-b-2 border-gold pb-4 mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Kurtis Collection</h1>
          <p className="mt-4 text-lg text-charcoal/80">Stylish and comfortable kurtis for modern women.</p>
        </div>

        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {kurtiProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}

export async function getStaticProps() {
  const result = await getProducts();
  return {
    props: {
      products: result.products || [],
    },
    revalidate: 60,
  };
}