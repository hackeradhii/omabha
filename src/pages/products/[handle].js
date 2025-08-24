import { getAllProductHandles, getProductByHandle } from '@/lib/shopify';
// Note: trackProductView removed - trending features disabled
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import Accordion from '@/components/Accordion';
import WishlistButton from '@/components/WishlistButton';
import ProductReviews from '@/components/ProductReviews';
import { RelatedProducts, FrequentlyBoughtTogether } from '@/components/ProductRecommendations';
import { ProductSEO } from '@/components/SEO';
import Link from 'next/link';

export default function ProductPage({ product }) {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(product.images.nodes[0].url);

  // Product view tracking disabled - trending features removed
  /*
  // Track product view for recommendations
  useEffect(() => {
    if (product) {
      trackProductView({
        id: product.id,
        title: product.title,
        handle: product.handle,
        priceRange: product.priceRange,
        images: product.images,
        productType: product.productType,
        vendor: product.vendor,
        tags: product.tags
      });
    }
  }, [product]);
  */

  if (!product) {
    return <div>Product not found.</div>;
  }

  const mainVariant = product.variants.nodes[0];
  const compareAtPrice = mainVariant.compareAtPrice?.amount;
  const price = mainVariant.price.amount;
  const discount = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  function handleAddToCart() {
    const itemToAdd = {
        id: mainVariant.id,
        title: product.title,
        price: mainVariant.price,
        image: product.images.nodes[0]
    };
    addToCart(itemToAdd);
  }

  return (
    <>
      <ProductSEO product={product} />
      <div className="bg-ivory min-h-screen pt-32">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <div className="text-sm text-charcoal/70 mb-6">
          <Link href="/" className="hover:text-gold">Home</Link>
          <span className="mx-2">/</span>
          <span>Sarees</span>
          <span className="mx-2">/</span>
          <span className="font-medium">{product.title}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-hidden">
              {product.images.nodes.slice(0, 5).map((image, index) => (
                <button key={index} onClick={() => setSelectedImage(image.url)} className={`w-20 h-28 flex-shrink-0 rounded-md overflow-hidden border-2 ${selectedImage === image.url ? 'border-burgundy' : 'border-transparent'}`}>
                  <Image
                    src={image.url}
                    alt={image.altText || `Thumbnail ${index + 1}`}
                    width={80}
                    height={112}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
            <div className="w-full h-[600px] flex-1 overflow-hidden rounded-lg shadow-lg">
              <Image
                src={selectedImage}
                alt={product.images.nodes[0].altText || `Image of ${product.title}`}
                width={800}
                height={1200}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-charcoal">{product.title}</h1>
            
            {/* Price and Discount */}
            <div className="mt-4 flex items-baseline gap-3">
              <p className="text-3xl font-serif text-gold">₹{parseFloat(price).toFixed(2)}</p>
              {compareAtPrice && (
                <p className="text-xl font-sans text-charcoal/50 line-through">MRP ₹{parseFloat(compareAtPrice).toFixed(2)}</p>
              )}
              {discount > 0 && (
                <p className="text-lg font-bold text-burgundy">{discount}% off</p>
              )}
            </div>
            <p className="text-sm text-charcoal/60 mt-1">Inclusive of all taxes</p>

            {/* Actions */}
            <div className="mt-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleAddToCart}
                  className="w-full py-3 bg-burgundy text-white font-bold text-lg rounded-md hover:bg-gold hover:text-charcoal transition-all duration-300 shadow-lg"
                >
                  ADD TO CART
                </button>
                <WishlistButton 
                  product={product}
                  variant="full"
                  className="hover:bg-red-50 hover:border-red-300"
                />
              </div>
            </div>

            {/* Accordion Details */}
            <div className="mt-10 space-y-2">
              <Accordion title="Product Details">
                <div className="prose max-w-none text-charcoal/80" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
              </Accordion>
              <Accordion title="Size & Fit">
                <p className="text-charcoal/80">Saree Length: 5.5 meters</p>
                <p className="text-charcoal/80">Blouse Piece Length: 0.8 meters</p>
              </Accordion>
              <Accordion title="Material & Care">
                <p className="text-charcoal/80">Fabric: Soft Silk</p>
                <p className="text-charcoal/80">Care: Dry Clean Only</p>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <div className="mt-16">
          <ProductReviews productId={product.id} />
        </div>

        {/* Frequently Bought Together */}
        <div className="mt-16">
          <FrequentlyBoughtTogether product={product} />
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <RelatedProducts product={product} maxItems={6} />
        </div>
      </main>
    </div>
    </>
  );
}

export async function getStaticPaths() {
  const products = await getAllProductHandles();
  const paths = products.map(product => ({
    params: { handle: product.handle },
  }));
  return {
    paths,
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const product = await getProductByHandle(params.handle);
  return {
    props: {
      product,
    },
    revalidate: 60,
  };
}

