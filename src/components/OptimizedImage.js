import { useState, forwardRef } from 'react';
import Image from 'next/image';

// Shopify image transformation utility
const getShopifyImageUrl = (originalUrl, options = {}) => {
  if (!originalUrl) return '';
  
  const { width, height, quality = 80, crop = 'center', format = 'webp' } = options;
  
  // Check if it's a Shopify CDN URL
  if (!originalUrl.includes('cdn.shopify.com')) {
    return originalUrl;
  }
  
  let transformedUrl = originalUrl;
  
  // Remove existing transformations
  transformedUrl = transformedUrl.replace(/\.(jpg|jpeg|png|webp).*$/i, '');
  
  const params = [];
  
  if (width && height) {
    params.push(`${width}x${height}`);
  } else if (width) {
    params.push(`${width}x`);
  } else if (height) {
    params.push(`x${height}`);
  }
  
  if (crop && (width || height)) {
    params.push(`crop_${crop}`);
  }
  
  // Add format and quality
  const extension = format === 'webp' ? 'webp' : 'jpg';
  const urlParams = params.length > 0 ? `_${params.join('_')}` : '';
  
  return `${transformedUrl}${urlParams}.${extension}?v=${Date.now()}&quality=${quality}`;
};

// Optimized Image Component
const OptimizedImage = forwardRef(({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 80,
  crop = 'center',
  format = 'webp',
  fallback = '/placeholder-product.svg',
  loading = 'lazy',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
  onError,
  ...props
}, ref) => {
  const [imageError, setImageError] = useState(false);
  
  // Check if it's an SVG file
  const isSVG = src && src.includes('.svg');
  
  // Set initial loaded state - SVGs should be considered loaded immediately
  const [imageLoaded, setImageLoaded] = useState(isSVG);

  const handleError = (e) => {
    console.warn('Image failed to load:', src);
    setImageError(true);
    // Force show fallback immediately for better UX
    setImageLoaded(true);
    if (onError) onError(e);
  };

  const handleLoad = (e) => {
    setImageLoaded(true);
    if (onLoad) onLoad(e);
  };

  // Use fallback if there's an error or no src
  const imageSrc = imageError || !src ? fallback : (
    src.includes('cdn.shopify.com') 
      ? getShopifyImageUrl(src, { width, height, quality, crop, format })
      : src
  );

  return (
    <div className={`relative overflow-hidden ${className}`} ref={ref}>
      <Image
        src={imageSrc}
        alt={alt || 'Product image'}
        width={width}
        height={height}
        priority={priority}
        loading={priority ? 'eager' : loading}
        quality={quality}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        } ${props.imageClassName || 'object-cover w-full h-full'}`}
        {...props}
      />
      
      {/* Loading placeholder */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Product Image Component with multiple sizes for responsive design
export const ProductImage = ({ 
  product, 
  className = '', 
  priority = false,
  sizes = '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
}) => {
  // Check for the correct data structure - prioritize nodes format
  const image = product?.images?.nodes?.[0] || product?.images?.edges?.[0]?.node;
  
  return (
    <OptimizedImage
      src={image?.url}
      alt={image?.altText || product?.title || 'Product image'}
      width={600}
      height={800}
      className={`aspect-[3/4] ${className}`}
      priority={priority}
      quality={85}
      crop="center"
      format="webp"
      sizes={sizes}
    />
  );
};

// Hero Image Component for landing pages
export const HeroImage = ({ 
  src, 
  alt, 
  className = '',
  priority = true 
}) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={1920}
      height={1080}
      className={`w-full h-full ${className}`}
      priority={priority}
      quality={90}
      crop="center"
      format="webp"
      sizes="100vw"
    />
  );
};

// Avatar Image Component
export const AvatarImage = ({ 
  src, 
  alt, 
  size = 40,
  className = ''
}) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      quality={90}
      crop="center"
      format="webp"
      sizes="(max-width: 768px) 32px, 40px"
    />
  );
};

export default OptimizedImage;