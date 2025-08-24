import Head from 'next/head';

const SEO = ({
  title = 'Omabha Store - Traditional Indian Clothing',
  description = 'Discover beautiful traditional Indian clothing at Omabha Store. Handpicked sarees, kurtis, lehengas and more with authentic craftsmanship.',
  keywords = 'indian clothing, sarees, kurtis, lehengas, traditional wear, ethnic wear, handwoven, silk sarees, cotton kurtis',
  canonical,
  image = '/og-image.jpg',
  imageAlt = 'Omabha Store - Traditional Indian Clothing',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'Omabha Store',
  noindex = false,
  nofollow = false,
  structuredData,
  children
}) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://omabha.com';
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
  const canonicalUrl = canonical || siteUrl;

  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Omabha Store',
    description: 'Premium traditional Indian clothing store',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      'https://www.instagram.com/omabhastore',
      'https://www.facebook.com/omabhastore',
      'https://www.pinterest.com/omabhastore'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-XXXXXXXXXX',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi']
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressRegion: 'India'
    }
  };

  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow'
  ].join(', ');

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={robotsContent} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Omabha Store" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={imageAlt} />
      <meta name="twitter:site" content="@omabhastore" />
      <meta name="twitter:creator" content="@omabhastore" />
      
      {/* Article specific meta tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Favicon and App Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="theme-color" content="#8C1F28" />
      
      {/* Indian Market Specific */}
      <meta name="geo.region" content="IN" />
      <meta name="geo.country" content="India" />
      <meta name="language" content="en-IN" />
      <meta name="currency" content="INR" />
      
      {/* Performance and Core Web Vitals */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://cdn.shopify.com" />
      <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData || defaultStructuredData)
        }}
      />
      
      {/* Additional custom head elements */}
      {children}
    </Head>
  );
};

// Product-specific SEO component
export const ProductSEO = ({ product }) => {
  if (!product) return <SEO />;

  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || product.title,
    image: product.images?.edges?.[0]?.node?.url || product.images?.nodes?.[0]?.url,
    brand: {
      '@type': 'Brand',
      name: product.vendor || 'Omabha Store'
    },
    offers: {
      '@type': 'Offer',
      price: product.priceRange?.minVariantPrice?.amount || product.variants?.edges?.[0]?.node?.price?.amount,
      priceCurrency: product.priceRange?.minVariantPrice?.currencyCode || 'INR',
      availability: product.availableForSale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Omabha Store'
      }
    },
    category: product.productType || 'Clothing',
    sku: product.variants?.edges?.[0]?.node?.sku,
    gtin: product.variants?.edges?.[0]?.node?.barcode
  };

  const price = product.priceRange?.minVariantPrice?.amount || product.variants?.edges?.[0]?.node?.price?.amount;
  const currency = product.priceRange?.minVariantPrice?.currencyCode || 'INR';
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(parseFloat(price));

  return (
    <SEO
      title={`${product.title} - Omabha Store`}
      description={product.description || `Buy ${product.title} at Omabha Store. Premium quality traditional Indian clothing with authentic craftsmanship. Price: ${formattedPrice}`}
      keywords={`${product.title}, ${product.productType || 'indian clothing'}, ${product.vendor || 'omabha'}, buy online, traditional wear`}
      image={product.images?.edges?.[0]?.node?.url || product.images?.nodes?.[0]?.url}
      imageAlt={product.images?.edges?.[0]?.node?.altText || product.title}
      type="product"
      structuredData={productStructuredData}
    />
  );
};

// Collection-specific SEO component
export const CollectionSEO = ({ collection }) => {
  if (!collection) return <SEO />;

  const collectionStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    description: collection.description || collection.title,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/collections/${collection.handle}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: collection.products?.edges?.length || 0,
      itemListElement: collection.products?.edges?.map((edge, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: edge.node.title,
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${edge.node.handle}`
        }
      })) || []
    }
  };

  return (
    <SEO
      title={`${collection.title} - Omabha Store`}
      description={collection.description || `Shop ${collection.title} collection at Omabha Store. Discover premium traditional Indian clothing with authentic craftsmanship.`}
      keywords={`${collection.title}, indian clothing collection, traditional wear, ethnic wear, ${collection.handle}`}
      image={collection.image?.url}
      imageAlt={collection.image?.altText || collection.title}
      structuredData={collectionStructuredData}
    />
  );
};

// Search page SEO component
export const SearchSEO = ({ query, resultsCount }) => {
  return (
    <SEO
      title={query ? `Search Results for "${query}" - Omabha Store` : 'Search - Omabha Store'}
      description={query 
        ? `Found ${resultsCount || 0} products for "${query}". Shop traditional Indian clothing at Omabha Store.`
        : 'Search for traditional Indian clothing, sarees, kurtis, lehengas and more at Omabha Store.'
      }
      keywords={`search, ${query || 'indian clothing'}, traditional wear, ethnic wear`}
      noindex={true} // Typically don't index search result pages
    />
  );
};

export default SEO;