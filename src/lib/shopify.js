// Mock data for development when Shopify API is not available
const mockProducts = [
  {
    id: 'mock-1',
    title: 'Elegant Silk Saree',
    handle: 'elegant-silk-saree',
    priceRange: {
      minVariantPrice: {
        amount: '2499.00',
        currencyCode: 'INR'
      }
    },
    images: {
      nodes: [{
        url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop&crop=center',
        altText: 'Elegant Silk Saree',
        width: 400,
        height: 600
      }]
    },
    availableForSale: true,
    variants: {
      edges: [{
        node: {
          id: 'mock-variant-1',
          title: 'Default Title',
          price: { amount: '2499.00', currencyCode: 'INR' },
          availableForSale: true
        }
      }],
      nodes: [{
        id: 'mock-variant-1',
        title: 'Default Title',
        price: { amount: '2499.00', currencyCode: 'INR' },
        availableForSale: true
      }]
    },
    tags: ['silk', 'traditional', 'wedding'],
    productType: 'Saree',
    vendor: 'Omabha Store',
    description: 'Beautiful handwoven silk saree perfect for special occasions'
  },
  {
    id: 'mock-2',
    title: 'Traditional Cotton Kurti',
    handle: 'traditional-cotton-kurti',
    priceRange: {
      minVariantPrice: {
        amount: '899.00',
        currencyCode: 'INR'
      }
    },
    images: {
      nodes: [{
        url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=600&fit=crop&crop=center',
        altText: 'Traditional Cotton Kurti',
        width: 400,
        height: 600
      }]
    },
    availableForSale: true,
    variants: {
      edges: [{
        node: {
          id: 'mock-variant-2',
          title: 'Default Title',
          price: { amount: '899.00', currencyCode: 'INR' },
          availableForSale: true
        }
      }],
      nodes: [{
        id: 'mock-variant-2',
        title: 'Default Title',
        price: { amount: '899.00', currencyCode: 'INR' },
        availableForSale: true
      }]
    },
    tags: ['cotton', 'casual', 'comfort'],
    productType: 'Kurti',
    vendor: 'Omabha Store',
    description: 'Comfortable cotton kurti for everyday wear'
  },
  {
    id: 'mock-3',
    title: 'Designer Banarasi Saree',
    handle: 'designer-banarasi-saree',
    priceRange: {
      minVariantPrice: {
        amount: '4999.00',
        currencyCode: 'INR'
      }
    },
    images: {
      nodes: [{
        url: '/placeholder-product.svg',
        altText: 'Designer Banarasi Saree'
      }]
    },
    availableForSale: true,
    variants: {
      edges: [{
        node: {
          id: 'mock-variant-3',
          title: 'Default Title',
          price: { amount: '4999.00', currencyCode: 'INR' },
          availableForSale: true
        }
      }]
    },
    tags: ['banarasi', 'designer', 'luxury']
  },
  {
    id: 'mock-4',
    title: 'Embroidered Anarkali Suit',
    handle: 'embroidered-anarkali-suit',
    priceRange: {
      minVariantPrice: {
        amount: '1599.00',
        currencyCode: 'INR'
      }
    },
    images: {
      nodes: [{
        url: '/placeholder-product.svg',
        altText: 'Embroidered Anarkali Suit'
      }]
    },
    availableForSale: true,
    variants: {
      edges: [{
        node: {
          id: 'mock-variant-4',
          title: 'Default Title',
          price: { amount: '1599.00', currencyCode: 'INR' },
          availableForSale: true
        }
      }]
    },
    tags: ['anarkali', 'embroidered', 'party-wear']
  },
  {
    id: 'mock-5',
    title: 'Floral Print Lehenga',
    handle: 'floral-print-lehenga',
    priceRange: {
      minVariantPrice: {
        amount: '3299.00',
        currencyCode: 'INR'
      }
    },
    images: {
      nodes: [{
        url: '/placeholder-product.svg',
        altText: 'Floral Print Lehenga'
      }]
    },
    availableForSale: true,
    variants: {
      edges: [{
        node: {
          id: 'mock-variant-5',
          title: 'Default Title',
          price: { amount: '3299.00', currencyCode: 'INR' },
          availableForSale: true
        }
      }]
    },
    tags: ['lehenga', 'floral', 'wedding']
  },
  {
    id: 'mock-6',
    title: 'Hand-woven Chanderi Saree',
    handle: 'handwoven-chanderi-saree',
    priceRange: {
      minVariantPrice: {
        amount: '1899.00',
        currencyCode: 'INR'
      }
    },
    images: {
      nodes: [{
        url: '/placeholder-product.svg',
        altText: 'Hand-woven Chanderi Saree'
      }]
    },
    availableForSale: true,
    variants: {
      edges: [{
        node: {
          id: 'mock-variant-6',
          title: 'Default Title',
          price: { amount: '1899.00', currencyCode: 'INR' },
          availableForSale: true
        }
      }]
    },
    tags: ['chanderi', 'handwoven', 'traditional']
  }
];

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN;
const apiVersion = '2024-07';

async function shopifyFetch({ query, variables }) {
  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;
  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    });
    const body = await result.json();
    if (body.errors) {
      throw body.errors[0];
    }
    return {
      status: result.status,
      body,
    };
  } catch (error) {
    console.error('Error fetching from Shopify:', { error, query, variables });
    throw { status: 500, error, query, variables };
  }
}

const gql = String.raw;

// Transform Shopify image URLs for high quality hero banners
function transformShopifyImageUrl(url, options = {}) {
  if (!url || !url.includes('cdn.shopify.com')) {
    return url;
  }

  const {
    width = 2560,    // Maximum recommended width
    height = 1440,   // Maximum recommended height for 16:9 ratio
    quality = 95,    // High quality for hero images
    format = 'webp'  // Modern format
  } = options;

  // Remove existing transformation parameters
  const baseUrl = url.split('?')[0];
  
  // Add high-quality transformation parameters
  const transformedUrl = `${baseUrl}?width=${width}&height=${height}&crop=center&format=${format}&quality=${quality}`;
  
  return transformedUrl;
}

const GET_PRODUCTS_QUERY = gql`
  query getProducts($first: Int!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
      nodes {
        id
        title
        handle
        description
        productType
        vendor
        tags
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 3) {
          nodes {
            url
            altText
            width
            height
          }
        }
        variants(first: 10) {
          nodes {
            id
            title
            availableForSale
            quantityAvailable
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
        }
        collections(first: 5) {
          nodes {
            id
            title
            handle
          }
        }
        availableForSale
        totalInventory
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

const GET_ALL_PRODUCTS_HANDLE_QUERY = gql`
  query getAllProducts($first: Int!) {
    products(first: $first) {
      nodes {
        handle
      }
    }
  }
`;

const GET_PRODUCT_BY_HANDLE_QUERY = gql`
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      productType
      vendor
      tags
      images(first: 5) {
        nodes {
          url
          altText
          width
          height
        }
      }
      variants(first: 10) {
        nodes {
          id
          title
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          availableForSale
          quantityAvailable
        }
      }
      collections(first: 5) {
        nodes {
          id
          title
          handle
        }
      }
      availableForSale
      totalInventory
    }
  }
`;

// Search Products Query with Advanced Filtering
const SEARCH_PRODUCTS_QUERY = gql`
  query searchProducts(
    $query: String!
    $first: Int!
    $after: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) {
    search(query: $query, first: $first, after: $after, types: PRODUCT) {
      edges {
        node {
          ... on Product {
            id
            title
            handle
            description
            productType
            vendor
            tags
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 3) {
              nodes {
                url
                altText
                width
                height
              }
            }
            variants(first: 5) {
              nodes {
                id
                title
                availableForSale
                quantityAvailable
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
              }
            }
            collections(first: 5) {
              nodes {
                id
                title
                handle
              }
            }
            availableForSale
            totalInventory
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

// Get Collections Query
const GET_COLLECTIONS_QUERY = gql`
  query getCollections($first: Int!) {
    collections(first: $first) {
      nodes {
        id
        title
        handle
        description
        image {
          url
          altText
          width
          height
        }
        products(first: 1) {
          nodes {
            id
          }
        }
      }
    }
  }
`;

// Get Collection Products Query
const GET_COLLECTION_PRODUCTS_QUERY = gql`
  query getCollectionProducts(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      id
      title
      description
      handle
      image {
        url
        altText
        width
        height
      }
      products(
        first: $first
        after: $after
        sortKey: $sortKey
        reverse: $reverse
        filters: $filters
      ) {
        edges {
          node {
            id
            title
            handle
            description
            productType
            vendor
            tags
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 3) {
              nodes {
                url
                altText
                width
                height
              }
            }
            variants(first: 5) {
              nodes {
                id
                title
                availableForSale
                quantityAvailable
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
              }
            }
            collections(first: 3) {
              nodes {
                id
                title
                handle
              }
            }
            availableForSale
            totalInventory
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
      }
    }
  }
`;

const CREATE_CHECKOUT_MUTATION = gql`
  mutation checkoutCreate($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      checkout {
        id
        webUrl
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
`;

// Customer Authentication Mutations
const CUSTOMER_CREATE_MUTATION = gql`
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
        phone
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = gql`
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION = gql`
  mutation customerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      deletedCustomerAccessTokenId
      userErrors {
        field
        message
      }
    }
  }
`;

const CUSTOMER_RECOVER_MUTATION = gql`
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_RESET_MUTATION = gql`
  mutation customerReset($id: ID!, $input: CustomerResetInput!) {
    customerReset(id: $id, input: $input) {
      customer {
        id
        email
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// Wishlist Metafield Mutations
const CUSTOMER_UPDATE_METAFIELD = gql`
  mutation customerUpdate($customer: CustomerUpdateInput!, $customerAccessToken: String!) {
    customerUpdate(customer: $customer, customerAccessToken: $customerAccessToken) {
      customer {
        id
        metafields(first: 5) {
          edges {
            node {
              id
              namespace
              key
              value
            }
          }
        }
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// Customer Queries
const GET_CUSTOMER_QUERY = gql`
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      defaultAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        country
        zip
        phone
      }
      addresses(first: 10) {
        edges {
          node {
            id
            firstName
            lastName
            company
            address1
            address2
            city
            province
            country
            zip
            phone
          }
        }
      }
      orders(first: 10) {
        edges {
          node {
            id
            orderNumber
            totalPrice {
              amount
              currencyCode
            }
            processedAt
            fulfillmentStatus
            financialStatus
          }
        }
      }
      metafields(first: 10) {
        edges {
          node {
            id
            namespace
            key
            value
            type
          }
        }
      }
    }
  }
`;

export async function getProducts(options = {}) {
  const {
    first = 10,
    query = '',
    sortKey = 'BEST_SELLING',
    reverse = false,
    filters = []
  } = options;

  // Check if Shopify environment variables are configured
  if (!domain || !storefrontAccessToken) {
    console.warn('Shopify API not configured, using mock data for development');
    return {
      products: mockProducts,
      pageInfo: { hasNextPage: false, hasPreviousPage: false }
    };
  }

  try {
    const res = await shopifyFetch({ 
      query: GET_PRODUCTS_QUERY, 
      variables: { first, query, sortKey, reverse }
    });
    return {
      products: res.body?.data?.products?.nodes || [],
      pageInfo: res.body?.data?.products?.pageInfo || { hasNextPage: false, hasPreviousPage: false }
    };
  } catch (error) {
    console.warn('Shopify API failed, falling back to mock data:', error.message);
    return {
      products: mockProducts,
      pageInfo: { hasNextPage: false, hasPreviousPage: false }
    };
  }
}

// Advanced Product Search Function
export async function searchProducts(searchQuery, options = {}) {
  const {
    first = 20,
    after = null,
    sortKey = 'RELEVANCE',
    reverse = false,
    filters = []
  } = options;

  if (!domain || !storefrontAccessToken) {
    console.warn('Shopify API not configured, using mock data for development');
    const filteredProducts = mockProducts.filter(product =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.handle.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      products: filteredProducts,
      pageInfo: { hasNextPage: false, hasPreviousPage: false }
    };
  }

  try {
    const res = await shopifyFetch({
      query: SEARCH_PRODUCTS_QUERY,
      variables: {
        query: searchQuery,
        first,
        after,
        sortKey,
        reverse,
        filters
      }
    });
    
    const edges = res.body?.data?.search?.edges || [];
    const products = edges.map(edge => edge.node);
    const pageInfo = res.body?.data?.search?.pageInfo || { hasNextPage: false, hasPreviousPage: false };
    
    return { products, pageInfo };
  } catch (error) {
    console.warn('Shopify search API failed:', error.message);
    return {
      products: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false }
    };
  }
}

// Get Hero Collections Function
export async function getHeroCollections(first = 10) {
  console.log('🎯 Fetching hero collections...');
  
  if (!domain || !storefrontAccessToken) {
    console.warn('❌ Shopify API not configured, using mock hero collections');
    return [
      {
        id: 'mock-hero-1',
        title: 'Spring Collection 2024',
        handle: 'hero-banner-1',
        description: 'Embrace the beauty of spring with our vibrant collection',
        image: { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920&h=1080&fit=crop', altText: 'Spring Collection' }
      },
      {
        id: 'mock-hero-2',
        title: 'Wedding Grandeur',
        handle: 'hero-banner-2', 
        description: 'Exquisite bridal wear for your special day',
        image: { url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920&h=1080&fit=crop', altText: 'Wedding Collection' }
      },
      {
        id: 'mock-hero-3',
        title: 'Festival Elegance',
        handle: 'hero-banner-3',
        description: 'Traditional attire for festive celebrations',
        image: { url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1920&h=1080&fit=crop', altText: 'Festival Collection' }
      }
    ];
  }

  try {
    const res = await shopifyFetch({ 
      query: GET_COLLECTIONS_QUERY, 
      variables: { first }
    });
    const allCollections = res.body?.data?.collections?.nodes || [];
    
    // Filter collections that start with 'hero-banner' or are in hero priority list
    const heroCollections = allCollections.filter(col => 
      col.handle.startsWith('hero-banner') ||
      ['hero-banner', 'featured', 'homepage', 'hero'].includes(col.handle)
    );
    
    // Sort by priority: exact matches first, then numbered hero-banner collections
    const sortedHeroCollections = heroCollections.sort((a, b) => {
      const priorityOrder = ['hero-banner', 'featured', 'homepage', 'hero'];
      const aIndex = priorityOrder.indexOf(a.handle);
      const bIndex = priorityOrder.indexOf(b.handle);
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // For hero-banner-1, hero-banner-2, etc., sort numerically
      const aNum = parseInt(a.handle.match(/hero-banner-(\d+)/)?.[1] || '999');
      const bNum = parseInt(b.handle.match(/hero-banner-(\d+)/)?.[1] || '999');
      return aNum - bNum;
    });
    
    console.log('🎯 Found hero collections:', sortedHeroCollections.length);
    
    // Transform image URLs for high quality
    const processedCollections = sortedHeroCollections.map(collection => ({
      ...collection,
      image: collection.image ? {
        ...collection.image,
        url: transformShopifyImageUrl(collection.image.url)
      } : null
    }));
    
    return processedCollections;
  } catch (error) {
    console.error('❌ Shopify hero collections API failed:', error);
    return [];
  }
}

// Get Collections Function
export async function getCollections(first = 20) {
  console.log('🔍 Checking Shopify configuration...');
  console.log('Domain:', domain);
  console.log('Token:', storefrontAccessToken ? 'Token exists' : 'No token');
  
  if (!domain || !storefrontAccessToken) {
    console.warn('❌ Shopify API not configured, using mock collections');
    console.log('Domain missing:', !domain);
    console.log('Token missing:', !storefrontAccessToken);
    return [
      {
        id: 'mock-collection-1',
        title: 'Sarees',
        handle: 'sarees',
        description: 'Traditional Indian sarees',
        image: { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=300&fit=crop', altText: 'Sarees Collection' }
      },
      {
        id: 'mock-collection-2',
        title: 'Kurtis',
        handle: 'kurtis',
        description: 'Comfortable and stylish kurtis',
        image: { url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=500&h=300&fit=crop', altText: 'Kurtis Collection' }
      }
    ];
  }

  console.log('✅ Shopify API configured, attempting to fetch collections...');
  try {
    const res = await shopifyFetch({ 
      query: GET_COLLECTIONS_QUERY, 
      variables: { first }
    });
    const collections = res.body?.data?.collections?.nodes || [];
    console.log('📦 Fetched collections:', collections.length);
    console.log('Collections data:', collections);
    return collections;
  } catch (error) {
    console.error('❌ Shopify collections API failed:', error);
    return [];
  }
}

// Get Collection Products Function
export async function getCollectionProducts(collectionHandle, options = {}) {
  const {
    first = 20,
    after = null,
    sortKey = 'BEST_SELLING',
    reverse = false,
    filters = []
  } = options;

  if (!domain || !storefrontAccessToken) {
    console.warn('Shopify API not configured, using mock data for development');
    const filteredProducts = mockProducts.filter(product =>
      product.title.toLowerCase().includes(collectionHandle.toLowerCase())
    );
    return {
      collection: {
        id: `mock-collection-${collectionHandle}`,
        title: collectionHandle.charAt(0).toUpperCase() + collectionHandle.slice(1),
        handle: collectionHandle,
        description: `Collection of ${collectionHandle}`
      },
      products: filteredProducts,
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      filters: []
    };
  }

  try {
    const res = await shopifyFetch({
      query: GET_COLLECTION_PRODUCTS_QUERY,
      variables: {
        handle: collectionHandle,
        first,
        after,
        sortKey,
        reverse,
        filters
      }
    });
    
    const collection = res.body?.data?.collection;
    if (!collection) {
      return {
        collection: null,
        products: [],
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
        filters: []
      };
    }
    
    const products = collection.products?.edges?.map(edge => edge.node) || [];
    const pageInfo = collection.products?.pageInfo || { hasNextPage: false, hasPreviousPage: false };
    const filters = collection.products?.filters || [];
    
    return {
      collection: {
        id: collection.id,
        title: collection.title,
        handle: collection.handle,
        description: collection.description,
        image: collection.image
      },
      products,
      pageInfo,
      filters
    };
  } catch (error) {
    console.warn('Shopify collection products API failed:', error.message);
    return {
      collection: null,
      products: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      filters: []
    };
  }
}

// Filter Products Function
export async function filterProducts(options = {}) {
  const {
    productType = '',
    vendor = '',
    tags = [],
    minPrice = null,
    maxPrice = null,
    available = null,
    first = 20,
    sortKey = 'BEST_SELLING',
    reverse = false
  } = options;

  let query = '';
  const queryParts = [];

  if (productType) {
    queryParts.push(`product_type:${productType}`);
  }
  
  if (vendor) {
    queryParts.push(`vendor:${vendor}`);
  }
  
  if (tags.length > 0) {
    const tagQuery = tags.map(tag => `tag:${tag}`).join(' OR ');
    queryParts.push(`(${tagQuery})`);
  }
  
  if (minPrice !== null || maxPrice !== null) {
    if (minPrice !== null && maxPrice !== null) {
      queryParts.push(`variants.price:>=${minPrice} AND variants.price:<=${maxPrice}`);
    } else if (minPrice !== null) {
      queryParts.push(`variants.price:>=${minPrice}`);
    } else if (maxPrice !== null) {
      queryParts.push(`variants.price:<=${maxPrice}`);
    }
  }
  
  if (available !== null) {
    queryParts.push(`available:${available}`);
  }

  query = queryParts.join(' AND ');

  return await getProducts({ first, query, sortKey, reverse });
}

export async function getAllProductHandles() {
  if (!domain || !storefrontAccessToken) {
    return mockProducts.map(product => ({ handle: product.handle }));
  }

  try {
    const res = await shopifyFetch({ query: GET_ALL_PRODUCTS_HANDLE_QUERY, variables: { first: 250 } });
    return res.body?.data?.products?.nodes || [];
  } catch (error) {
    console.warn('Shopify API failed, falling back to mock data');
    return mockProducts.map(product => ({ handle: product.handle }));
  }
}

export async function getProductByHandle(handle) {
  if (!domain || !storefrontAccessToken) {
    const mockProduct = mockProducts.find(p => p.handle === handle);
    if (mockProduct) {
      return {
        ...mockProduct,
        descriptionHtml: '<p>Beautiful traditional Indian garment crafted with care and attention to detail.</p>',
        variants: {
          nodes: [{
            id: `variant-${mockProduct.id}`,
            title: 'Default',
            price: mockProduct.priceRange.minVariantPrice
          }]
        }
      };
    }
    return null;
  }

  try {
    const res = await shopifyFetch({
      query: GET_PRODUCT_BY_HANDLE_QUERY,
      variables: { handle: handle },
    });
    return res.body?.data?.product || null;
  } catch (error) {
    console.warn('Shopify API failed for product:', handle);
    return null;
  }
}

export async function createCheckout(lineItems) {
    const variables = {
        input: {
            lineItems: lineItems,
        },
    };
    const res = await shopifyFetch({
        query: CREATE_CHECKOUT_MUTATION,
        variables,
    });
    return res.body?.data?.checkoutCreate?.checkout;
}

// Customer Authentication Functions
export async function createCustomer(customerData) {
  try {
    const variables = {
      input: {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        password: customerData.password,
        phone: customerData.phone || null,
        acceptsMarketing: customerData.acceptsMarketing || false,
      },
    };
    
    const res = await shopifyFetch({
      query: CUSTOMER_CREATE_MUTATION,
      variables,
    });
    
    return {
      customer: res.body?.data?.customerCreate?.customer,
      errors: res.body?.data?.customerCreate?.customerUserErrors || [],
    };
  } catch (error) {
    console.error('Error creating customer:', error);
    return { customer: null, errors: [{ message: 'Failed to create account' }] };
  }
}

export async function customerLogin(email, password) {
  try {
    const variables = {
      input: {
        email,
        password,
      },
    };
    
    const res = await shopifyFetch({
      query: CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
      variables,
    });
    
    return {
      accessToken: res.body?.data?.customerAccessTokenCreate?.customerAccessToken,
      errors: res.body?.data?.customerAccessTokenCreate?.customerUserErrors || [],
    };
  } catch (error) {
    console.error('Error logging in customer:', error);
    return { accessToken: null, errors: [{ message: 'Login failed' }] };
  }
}

export async function customerLogout(customerAccessToken) {
  try {
    const res = await shopifyFetch({
      query: CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION,
      variables: { customerAccessToken },
    });
    
    return {
      success: !!res.body?.data?.customerAccessTokenDelete?.deletedAccessToken,
      errors: res.body?.data?.customerAccessTokenDelete?.userErrors || [],
    };
  } catch (error) {
    console.error('Error logging out customer:', error);
    return { success: false, errors: [{ message: 'Logout failed' }] };
  }
}

export async function getCustomer(customerAccessToken) {
  try {
    const res = await shopifyFetch({
      query: GET_CUSTOMER_QUERY,
      variables: { customerAccessToken },
    });
    
    return res.body?.data?.customer;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
}

export async function customerPasswordRecover(email) {
  try {
    const res = await shopifyFetch({
      query: CUSTOMER_RECOVER_MUTATION,
      variables: { email },
    });
    
    return {
      success: !res.body?.data?.customerRecover?.customerUserErrors?.length,
      errors: res.body?.data?.customerRecover?.customerUserErrors || [],
    };
  } catch (error) {
    console.error('Error recovering password:', error);
    return { success: false, errors: [{ message: 'Password recovery failed' }] };
  }
}

// Wishlist Functions
export async function getCustomerWishlist(customerAccessToken) {
  try {
    const customer = await getCustomer(customerAccessToken);
    if (!customer) return [];
    
    const wishlistMetafield = customer.metafields?.edges?.find(
      edge => edge.node.namespace === 'custom' && edge.node.key === 'wishlist'
    );
    
    if (!wishlistMetafield) return [];
    
    try {
      const wishlistProductIds = JSON.parse(wishlistMetafield.node.value);
      // Fetch full product details for wishlist items
      const wishlistProducts = [];
      
      for (const productId of wishlistProductIds) {
        try {
          // Convert product ID to handle for fetching
          const productHandle = productId.split('/').pop();
          const product = await getProductByHandle(productHandle);
          if (product) {
            wishlistProducts.push(product);
          }
        } catch (error) {
          console.warn('Failed to fetch wishlist product:', productId, error);
        }
      }
      
      return wishlistProducts;
    } catch (parseError) {
      console.error('Failed to parse wishlist data:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
}

export async function addToWishlist(customerAccessToken, productId) {
  try {
    const customer = await getCustomer(customerAccessToken);
    if (!customer) {
      return { success: false, errors: [{ message: 'Customer not found' }] };
    }
    
    const existingWishlistMetafield = customer.metafields?.edges?.find(
      edge => edge.node.namespace === 'custom' && edge.node.key === 'wishlist'
    );
    
    let wishlistProductIds = [];
    if (existingWishlistMetafield) {
      try {
        wishlistProductIds = JSON.parse(existingWishlistMetafield.node.value);
      } catch (parseError) {
        console.warn('Failed to parse existing wishlist:', parseError);
      }
    }
    
    // Add product if not already in wishlist
    if (!wishlistProductIds.includes(productId)) {
      wishlistProductIds.push(productId);
    }
    
    const res = await shopifyFetch({
      query: CUSTOMER_UPDATE_METAFIELD,
      variables: {
        customerAccessToken,
        customer: {
          metafields: [
            {
              namespace: 'custom',
              key: 'wishlist',
              value: JSON.stringify(wishlistProductIds),
              type: 'json'
            }
          ]
        }
      }
    });
    
    return {
      success: !res.body?.data?.customerUpdate?.customerUserErrors?.length,
      errors: res.body?.data?.customerUpdate?.customerUserErrors || [],
    };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return { success: false, errors: [{ message: 'Failed to add to wishlist' }] };
  }
}

export async function removeFromWishlist(customerAccessToken, productId) {
  try {
    const customer = await getCustomer(customerAccessToken);
    if (!customer) {
      return { success: false, errors: [{ message: 'Customer not found' }] };
    }
    
    const existingWishlistMetafield = customer.metafields?.edges?.find(
      edge => edge.node.namespace === 'custom' && edge.node.key === 'wishlist'
    );
    
    if (!existingWishlistMetafield) {
      return { success: true, errors: [] }; // Nothing to remove
    }
    
    let wishlistProductIds = [];
    try {
      wishlistProductIds = JSON.parse(existingWishlistMetafield.node.value);
    } catch (parseError) {
      console.warn('Failed to parse existing wishlist:', parseError);
      return { success: false, errors: [{ message: 'Invalid wishlist data' }] };
    }
    
    // Remove product from wishlist
    wishlistProductIds = wishlistProductIds.filter(id => id !== productId);
    
    const res = await shopifyFetch({
      query: CUSTOMER_UPDATE_METAFIELD,
      variables: {
        customerAccessToken,
        customer: {
          metafields: [
            {
              namespace: 'custom',
              key: 'wishlist',
              value: JSON.stringify(wishlistProductIds),
              type: 'json'
            }
          ]
        }
      }
    });
    
    return {
      success: !res.body?.data?.customerUpdate?.customerUserErrors?.length,
      errors: res.body?.data?.customerUpdate?.customerUserErrors || [],
    };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return { success: false, errors: [{ message: 'Failed to remove from wishlist' }] };
  }
}

export async function isInWishlist(customerAccessToken, productId) {
  try {
    const customer = await getCustomer(customerAccessToken);
    if (!customer) return false;
    
    const wishlistMetafield = customer.metafields?.edges?.find(
      edge => edge.node.namespace === 'custom' && edge.node.key === 'wishlist'
    );
    
    if (!wishlistMetafield) return false;
    
    try {
      const wishlistProductIds = JSON.parse(wishlistMetafield.node.value);
      return wishlistProductIds.includes(productId);
    } catch (parseError) {
      console.error('Failed to parse wishlist data:', parseError);
      return false;
    }
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
}

// Reviews Functions - Using localStorage for demo (in production, use Shopify metafields)
export async function getProductReviews(productId) {
  try {
    // Get stored reviews from localStorage
    const storedReviews = typeof window !== 'undefined' ? 
      JSON.parse(localStorage.getItem(`reviews_${productId}`) || '[]') : [];
    
    // Add some mock reviews for demonstration
    const mockReviews = [
      {
        id: 'review_1',
        productId,
        customerId: 'customer_1',
        customerName: 'Priya Sharma',
        rating: 5,
        title: 'Absolutely beautiful!',
        content: 'The fabric quality is excellent and the design is stunning. Perfect for special occasions.',
        createdAt: '2024-08-20T10:00:00Z',
        verified: true
      },
      {
        id: 'review_2',
        productId,
        customerId: 'customer_2',
        customerName: 'Anjali Gupta',
        rating: 4,
        title: 'Great purchase',
        content: 'Love the traditional design. The delivery was quick and packaging was excellent.',
        createdAt: '2024-08-18T14:30:00Z',
        verified: true
      },
      {
        id: 'review_3',
        productId,
        customerId: 'customer_3',
        customerName: 'Meera Reddy',
        rating: 5,
        title: 'Perfect fit and quality',
        content: 'Exactly as shown in the pictures. The colors are vibrant and the material feels premium.',
        createdAt: '2024-08-15T09:15:00Z',
        verified: false
      }
    ];
    
    // Combine stored and mock reviews
    const allReviews = [...storedReviews, ...mockReviews];
    
    // Calculate average rating
    const avgRating = allReviews.length > 0 ? 
      allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length : 0;
    
    return {
      reviews: allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      totalReviews: allReviews.length,
      averageRating: Number(avgRating.toFixed(1)),
      ratingDistribution: {
        5: allReviews.filter(r => r.rating === 5).length,
        4: allReviews.filter(r => r.rating === 4).length,
        3: allReviews.filter(r => r.rating === 3).length,
        2: allReviews.filter(r => r.rating === 2).length,
        1: allReviews.filter(r => r.rating === 1).length,
      }
    };
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return {
      reviews: [],
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }
}

export async function addProductReview(customerAccessToken, productId, reviewData) {
  try {
    if (!customerAccessToken) {
      return { success: false, errors: [{ message: 'Please log in to submit a review' }] };
    }
    
    const customer = await getCustomer(customerAccessToken);
    if (!customer) {
      return { success: false, errors: [{ message: 'Customer not found' }] };
    }
    
    // Check if customer has already reviewed this product
    const existingReviews = typeof window !== 'undefined' ? 
      JSON.parse(localStorage.getItem(`reviews_${productId}`) || '[]') : [];
    
    const hasReviewed = existingReviews.some(review => review.customerId === customer.id);
    if (hasReviewed) {
      return { success: false, errors: [{ message: 'You have already reviewed this product' }] };
    }
    
    // Create new review
    const newReview = {
      id: `review_${Date.now()}`,
      productId,
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      rating: reviewData.rating,
      title: reviewData.title,
      content: reviewData.content,
      createdAt: new Date().toISOString(),
      verified: true // Could be determined by purchase history
    };
    
    // Store review in localStorage (in production, this would be stored in Shopify metafields)
    if (typeof window !== 'undefined') {
      existingReviews.push(newReview);
      localStorage.setItem(`reviews_${productId}`, JSON.stringify(existingReviews));
    }
    
    return { success: true, review: newReview };
  } catch (error) {
    console.error('Error adding product review:', error);
    return { success: false, errors: [{ message: 'Failed to submit review' }] };
  }
}

export async function updateProductReview(customerAccessToken, reviewId, productId, reviewData) {
  try {
    if (!customerAccessToken) {
      return { success: false, errors: [{ message: 'Please log in to update review' }] };
    }
    
    const customer = await getCustomer(customerAccessToken);
    if (!customer) {
      return { success: false, errors: [{ message: 'Customer not found' }] };
    }
    
    // Get existing reviews
    const existingReviews = typeof window !== 'undefined' ? 
      JSON.parse(localStorage.getItem(`reviews_${productId}`) || '[]') : [];
    
    const reviewIndex = existingReviews.findIndex(r => r.id === reviewId && r.customerId === customer.id);
    if (reviewIndex === -1) {
      return { success: false, errors: [{ message: 'Review not found or not authorized' }] };
    }
    
    // Update review
    existingReviews[reviewIndex] = {
      ...existingReviews[reviewIndex],
      rating: reviewData.rating,
      title: reviewData.title,
      content: reviewData.content,
      updatedAt: new Date().toISOString()
    };
    
    // Store updated reviews
    if (typeof window !== 'undefined') {
      localStorage.setItem(`reviews_${productId}`, JSON.stringify(existingReviews));
    }
    
    return { success: true, review: existingReviews[reviewIndex] };
  } catch (error) {
    console.error('Error updating product review:', error);
    return { success: false, errors: [{ message: 'Failed to update review' }] };
  }
}

export async function deleteProductReview(customerAccessToken, reviewId, productId) {
  try {
    if (!customerAccessToken) {
      return { success: false, errors: [{ message: 'Please log in to delete review' }] };
    }
    
    const customer = await getCustomer(customerAccessToken);
    if (!customer) {
      return { success: false, errors: [{ message: 'Customer not found' }] };
    }
    
    // Get existing reviews
    const existingReviews = typeof window !== 'undefined' ? 
      JSON.parse(localStorage.getItem(`reviews_${productId}`) || '[]') : [];
    
    const reviewIndex = existingReviews.findIndex(r => r.id === reviewId && r.customerId === customer.id);
    if (reviewIndex === -1) {
      return { success: false, errors: [{ message: 'Review not found or not authorized' }] };
    }
    
    // Remove review
    existingReviews.splice(reviewIndex, 1);
    
    // Store updated reviews
    if (typeof window !== 'undefined') {
      localStorage.setItem(`reviews_${productId}`, JSON.stringify(existingReviews));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting product review:', error);
    return { success: false, errors: [{ message: 'Failed to delete review' }] };
  }
}

export async function getCustomerReviews(customerAccessToken) {
  try {
    if (!customerAccessToken) {
      return [];
    }
    
    const customer = await getCustomer(customerAccessToken);
    if (!customer) {
      return [];
    }
    
    // In a real implementation, this would query customer's review metafields
    // For now, we'll check localStorage for all reviews by this customer
    const allReviews = [];
    
    if (typeof window !== 'undefined') {
      // Check all stored reviews for this customer
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('reviews_')) {
          try {
            const reviews = JSON.parse(localStorage.getItem(key) || '[]');
            const customerReviews = reviews.filter(r => r.customerId === customer.id);
            allReviews.push(...customerReviews);
          } catch (error) {
            console.warn('Failed to parse reviews for key:', key);
          }
        }
      }
    }
    
    return allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error fetching customer reviews:', error);
    return [];
  }
}

// Order Management Functions
export async function createShopifyOrder(orderData) {
  try {
    // This would typically use Shopify Admin API to create orders
    // For demo purposes, we'll simulate order creation and store locally
    const order = {
      id: `gid://shopify/Order/${Date.now()}`,
      orderNumber: `OMB${Date.now().toString().slice(-6)}`,
      name: `#OMB${Date.now().toString().slice(-6)}`,
      email: orderData.customer.email,
      phone: orderData.customer.phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      financialStatus: 'PAID',
      fulfillmentStatus: 'UNFULFILLED',
      totalPrice: {
        amount: orderData.amount.toString(),
        currencyCode: orderData.currency || 'INR'
      },
      subtotalPrice: {
        amount: (orderData.amount - (orderData.shipping || 0) - (orderData.tax || 0)).toString(),
        currencyCode: orderData.currency || 'INR'
      },
      totalShippingPrice: {
        amount: (orderData.shipping || 0).toString(),
        currencyCode: orderData.currency || 'INR'
      },
      totalTax: {
        amount: (orderData.tax || 0).toString(),
        currencyCode: orderData.currency || 'INR'
      },
      customer: {
        id: orderData.customer.id || `gid://shopify/Customer/${Date.now()}`,
        firstName: orderData.customer.firstName,
        lastName: orderData.customer.lastName,
        email: orderData.customer.email,
        phone: orderData.customer.phone
      },
      shippingAddress: {
        firstName: orderData.shippingAddress.firstName,
        lastName: orderData.shippingAddress.lastName,
        address1: orderData.shippingAddress.address1,
        address2: orderData.shippingAddress.address2,
        city: orderData.shippingAddress.city,
        province: orderData.shippingAddress.state,
        zip: orderData.shippingAddress.pincode,
        country: orderData.shippingAddress.country,
        phone: orderData.shippingAddress.phone
      },
      lineItems: orderData.cartItems.map((item, index) => ({
        id: `gid://shopify/LineItem/${Date.now()}_${index}`,
        title: item.title,
        quantity: item.quantity || 1,
        variantId: item.id,
        price: {
          amount: parseFloat(item.price.amount || item.price).toString(),
          currencyCode: 'INR'
        },
        product: {
          id: item.productId || item.id,
          title: item.title,
          handle: item.handle
        }
      })),
      paymentDetails: {
        razorpay_order_id: orderData.razorpay_order_id,
        razorpay_payment_id: orderData.razorpay_payment_id,
        method: orderData.paymentMethod || 'razorpay'
      },
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: new Date().toISOString(),
          message: 'Order placed successfully'
        },
        {
          status: 'CONFIRMED',
          timestamp: new Date().toISOString(),
          message: 'Payment confirmed'
        }
      ]
    };

    // Store order locally (in production, this would be handled by Shopify)
    if (typeof window !== 'undefined') {
      const existingOrders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
      existingOrders.push(order);
      localStorage.setItem('customer_orders', JSON.stringify(existingOrders));
    }

    return { success: true, order };
  } catch (error) {
    console.error('Error creating Shopify order:', error);
    return { success: false, error: error.message };
  }
}

export async function getCustomerOrders(customerAccessToken) {
  try {
    const customer = await getCustomer(customerAccessToken);
    if (!customer) {
      return { orders: [], pageInfo: { hasNextPage: false } };
    }

    // In production, this would query Shopify Orders API
    // For demo, we'll get orders from localStorage and add some mock orders
    let orders = [];
    
    if (typeof window !== 'undefined') {
      const storedOrders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
      orders = storedOrders.filter(order => 
        order.customer.email === customer.email
      );
    }

    // Add some mock orders for demonstration
    const mockOrders = [
      {
        id: 'gid://shopify/Order/mock_1',
        orderNumber: 'OMB001',
        name: '#OMB001',
        createdAt: '2024-08-20T10:00:00Z',
        processedAt: '2024-08-20T10:00:00Z',
        financialStatus: 'PAID',
        fulfillmentStatus: 'FULFILLED',
        totalPrice: { amount: '2499.00', currencyCode: 'INR' },
        lineItems: [
          {
            id: 'line_1',
            title: 'Elegant Silk Saree',
            quantity: 1,
            price: { amount: '2499.00', currencyCode: 'INR' }
          }
        ],
        statusHistory: [
          { status: 'DELIVERED', timestamp: '2024-08-25T14:30:00Z', message: 'Order delivered successfully' }
        ]
      },
      {
        id: 'gid://shopify/Order/mock_2',
        orderNumber: 'OMB002',
        name: '#OMB002',
        createdAt: '2024-08-22T15:30:00Z',
        processedAt: '2024-08-22T15:30:00Z',
        financialStatus: 'PAID',
        fulfillmentStatus: 'IN_TRANSIT',
        totalPrice: { amount: '1599.00', currencyCode: 'INR' },
        lineItems: [
          {
            id: 'line_2',
            title: 'Designer Cotton Kurti',
            quantity: 1,
            price: { amount: '1599.00', currencyCode: 'INR' }
          }
        ],
        statusHistory: [
          { status: 'SHIPPED', timestamp: '2024-08-23T09:00:00Z', message: 'Order shipped via Blue Dart' }
        ]
      }
    ];

    // Combine stored and mock orders
    const allOrders = [...orders, ...mockOrders];
    
    return {
      orders: allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      pageInfo: { hasNextPage: false }
    };
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return { orders: [], pageInfo: { hasNextPage: false } };
  }
}

export async function getOrderById(orderId) {
  try {
    // In production, this would use Shopify Admin API
    if (typeof window !== 'undefined') {
      const storedOrders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
      const order = storedOrders.find(o => o.id === orderId || o.orderNumber === orderId);
      if (order) {
        return { success: true, order };
      }
    }

    // Mock order for demo
    if (orderId) {
      const mockOrder = {
        id: orderId,
        orderNumber: `OMB${orderId.slice(-6)}`,
        name: `#OMB${orderId.slice(-6)}`,
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        financialStatus: 'PAID',
        fulfillmentStatus: 'PROCESSING',
        totalPrice: { amount: '2499.00', currencyCode: 'INR' },
        customer: {
          firstName: 'Customer',
          lastName: 'Name',
          email: 'customer@example.com'
        },
        shippingAddress: {
          address1: 'Customer Address',
          city: 'City',
          province: 'State',
          zip: '123456',
          country: 'India'
        },
        lineItems: [
          {
            id: 'line_1',
            title: 'Sample Product',
            quantity: 1,
            price: { amount: '2499.00', currencyCode: 'INR' }
          }
        ],
        statusHistory: [
          {
            status: 'CONFIRMED',
            timestamp: new Date().toISOString(),
            message: 'Order confirmed and payment received'
          }
        ]
      };
      return { success: true, order: mockOrder };
    }

    return { success: false, error: 'Order not found' };
  } catch (error) {
    console.error('Error fetching order:', error);
    return { success: false, error: error.message };
  }
}

export async function updateOrderStatus(orderId, status, message) {
  try {
    // In production, this would update via Shopify Admin API
    if (typeof window !== 'undefined') {
      const storedOrders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
      const orderIndex = storedOrders.findIndex(o => o.id === orderId);
      
      if (orderIndex !== -1) {
        storedOrders[orderIndex].fulfillmentStatus = status;
        storedOrders[orderIndex].updatedAt = new Date().toISOString();
        
        if (!storedOrders[orderIndex].statusHistory) {
          storedOrders[orderIndex].statusHistory = [];
        }
        
        storedOrders[orderIndex].statusHistory.push({
          status,
          timestamp: new Date().toISOString(),
          message: message || `Order status updated to ${status}`
        });
        
        localStorage.setItem('customer_orders', JSON.stringify(storedOrders));
        return { success: true, order: storedOrders[orderIndex] };
      }
    }

    return { success: false, error: 'Order not found' };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message };
  }
}

export async function cancelOrder(orderId, reason) {
  try {
    // In production, this would use Shopify Admin API
    const result = await updateOrderStatus(orderId, 'CANCELLED', `Order cancelled: ${reason}`);
    return result;
  } catch (error) {
    console.error('Error cancelling order:', error);
    return { success: false, error: error.message };
  }
}

// Product Recommendations Functions - DISABLED
// Trending and recommendation features have been removed per user request

/*
const PRODUCT_RECOMMENDATIONS_QUERY = gql`
  query getProductRecommendations($productId: ID!, $intent: ProductRecommendationIntent!) {
    productRecommendations(productId: $productId, intent: $intent) {
      id
      title
      handle
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 1) {
        nodes {
          url
          altText
        }
      }
      variants(first: 1) {
        edges {
          node {
            id
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
      }
      availableForSale
      tags
      vendor
      productType
    }
  }
`;
*/

const RELATED_PRODUCTS_QUERY = gql`
  query getRelatedProducts(
    $query: String!
    $first: Int!
    $excludeIds: [ID!]
  ) {
    products(first: $first, query: $query) {
      nodes {
        id
        title
        handle
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 1) {
          nodes {
            url
            altText
          }
        }
        variants(first: 1) {
          edges {
            node {
              id
              availableForSale
              price {
                amount
                currencyCode
              }
            }
          }
        }
        availableForSale
        tags
        vendor
        productType
      }
    }
  }
`;

export async function getRelatedProducts(productId, options = {}) {
  try {
    const { productType, tags = [], vendor, excludeId, maxItems = 6 } = options;
    
    // In production environment with valid Shopify setup
    if (domain && storefrontAccessToken) {
      try {
        // Build query based on available criteria
        let queryFilters = [];
        
        if (productType) {
          queryFilters.push(`product_type:"${productType}"`);
        }
        
        if (vendor) {
          queryFilters.push(`vendor:"${vendor}"`);
        }
        
        if (tags.length > 0) {
          const tagQuery = tags.slice(0, 3).map(tag => `tag:"${tag}"`).join(' OR ');
          queryFilters.push(`(${tagQuery})`);
        }
        
        // If no specific criteria, get from same product type or similar
        if (queryFilters.length === 0) {
          queryFilters.push('available_for_sale:true');
        }
        
        const query = queryFilters.join(' AND ');
        
        const { status, body } = await shopifyFetch({
          query: RELATED_PRODUCTS_QUERY,
          variables: {
            query,
            first: maxItems + 2, // Get extra in case we need to filter out the current product
            excludeIds: excludeId ? [excludeId] : []
          }
        });
        
        if (status === 200 && body.data?.products?.nodes) {
          let products = body.data.products.nodes;
          
          // Filter out the current product if it appears in results
          if (excludeId) {
            products = products.filter(p => p.id !== excludeId);
          }
          
          return products.slice(0, maxItems);
        }
      } catch (error) {
        console.log('Using mock data for related products:', error.message);
      }
    }
    
    // Fallback to mock products with some filtering logic
    let relatedProducts = [...mockProducts];
    
    // If we have an exclude ID, filter it out
    if (excludeId) {
      relatedProducts = relatedProducts.filter(p => p.id !== excludeId);
    }
    
    // Simple filtering based on product type or vendor
    if (productType || vendor) {
      relatedProducts = relatedProducts.filter(p => {
        return p.productType === productType || p.vendor === vendor;
      });
    }
    
    // If no matches found, return random products
    if (relatedProducts.length === 0) {
      relatedProducts = mockProducts.filter(p => p.id !== excludeId);
    }
    
    return relatedProducts.slice(0, maxItems);
    
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}

// DISABLED: Product recommendations function removed per user request
/*
export async function getProductRecommendations(productId, intent = 'RELATED') {
  try {
    // In production environment with valid Shopify setup
    if (domain && storefrontAccessToken) {
      try {
        const { status, body } = await shopifyFetch({
          query: PRODUCT_RECOMMENDATIONS_QUERY,
          variables: {
            productId,
            intent: intent.toUpperCase()
          }
        });
        
        if (status === 200 && body.data?.productRecommendations) {
          return body.data.productRecommendations;
        }
      } catch (error) {
        console.log('Using mock data for product recommendations:', error.message);
      }
    }
    
    // Fallback to mock recommendations
    const shuffled = [...mockProducts].sort(() => 0.5 - Math.random());
    
    switch (intent) {
      case 'frequently_bought_together':
        return shuffled.slice(0, 2);
      case 'personalized':
        return shuffled.slice(0, 6);
      case 'related':
      default:
        return shuffled.slice(0, 4);
    }
    
  } catch (error) {
    console.error('Error fetching product recommendations:', error);
    return [];
  }
}
*/

// DISABLED: Trending and recommended products function removed per user request
/*
export async function getRecommendedProducts(type = 'trending', maxItems = 6) {
  try {
    // In production, this would use analytics data or Shopify's recommendation algorithms
    // For now, we'll simulate different types of recommendations
    
    let query = 'available_for_sale:true';
    let sortKey = 'BEST_SELLING';
    
    switch (type) {
      case 'trending':
        sortKey = 'BEST_SELLING';
        break;
      case 'new_arrivals':
        sortKey = 'CREATED_AT';
        break;
      case 'popular':
        sortKey = 'BEST_SELLING';
        break;
      case 'on_sale':
        query = 'available_for_sale:true AND compare_at_price:>0';
        break;
      default:
        break;
    }
    
    // In production environment with valid Shopify setup
    if (domain && storefrontAccessToken) {
      try {
        const { status, body } = await shopifyFetch({
          query: GET_PRODUCTS_QUERY,
          variables: {
            first: maxItems,
            query,
            sortKey,
            reverse: type === 'new_arrivals'
          }
        });
        
        if (status === 200 && body.data?.products?.nodes) {
          return body.data.products.nodes;
        }
      } catch (error) {
        console.log('Using mock data for recommended products:', error.message);
      }
    }
    
    // Fallback to mock products
    const shuffled = [...mockProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, maxItems);
    
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    return [];
  }
}
*/

// DISABLED: Product view tracking for recommendations removed per user request
/*
// Utility function to track product views for recommendations
export function trackProductView(product) {
  if (typeof window === 'undefined') return;
  
  try {
    // Get existing recently viewed products
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    
    // Remove if already exists to avoid duplicates
    const filtered = recentlyViewed.filter(p => p.id !== product.id);
    
    // Add to beginning of array
    const updated = [product, ...filtered].slice(0, 10); // Keep only last 10
    
    // Save back to localStorage
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    
    // In production, this would also send analytics data to track user behavior
    // for better personalized recommendations
    
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
}
*/

// DISABLED: Collection recommendations removed per user request
/*
// Get collections with products for category-based recommendations
export async function getCollectionRecommendations(collectionHandle, maxItems = 4) {
  try {
    const products = await getCollectionProducts(collectionHandle);
    
    if (products && products.length > 0) {
      // Shuffle and return subset
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, maxItems);
    }
    
    // Fallback to general recommendations
    return getRecommendedProducts('popular', maxItems);
    
  } catch (error) {
    console.error('Error fetching collection recommendations:', error);
    return [];
  }
}
*/

// Inventory Management Functions

const INVENTORY_LEVELS_QUERY = gql`
  query getInventoryLevels($id: ID!) {
    productVariant(id: $id) {
      id
      inventoryQuantity
      inventoryPolicy
      inventoryItem {
        id
        inventoryLevels(first: 5) {
          edges {
            node {
              id
              available
              location {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`;

const INVENTORY_ADJUST_MUTATION = gql`
  mutation inventoryAdjustQuantity($input: InventoryAdjustQuantityInput!) {
    inventoryAdjustQuantity(input: $input) {
      inventoryLevel {
        id
        available
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function getInventoryLevels(variantId) {
  try {
    // In production environment with valid Shopify setup
    if (domain && storefrontAccessToken) {
      try {
        const { status, body } = await shopifyFetch({
          query: INVENTORY_LEVELS_QUERY,
          variables: { id: variantId }
        });
        
        if (status === 200 && body.data?.productVariant) {
          const variant = body.data.productVariant;
          const inventoryLevels = variant.inventoryItem?.inventoryLevels?.edges || [];
          
          // Sum up available quantities across all locations
          const totalAvailable = inventoryLevels.reduce((sum, edge) => {
            return sum + (edge.node.available || 0);
          }, 0);
          
          return {
            available: totalAvailable,
            onHand: variant.inventoryQuantity || 0,
            policy: variant.inventoryPolicy,
            locations: inventoryLevels.map(edge => edge.node)
          };
        }
      } catch (error) {
        console.log('Using mock inventory data:', error.message);
      }
    }
    
    // Fallback to mock inventory data
    const mockInventory = {
      available: Math.floor(Math.random() * 50) + 1, // Random stock between 1-50
      onHand: Math.floor(Math.random() * 50) + 1,
      policy: 'DENY',
      locations: [{
        id: 'mock-location-1',
        name: 'Main Warehouse',
        available: Math.floor(Math.random() * 50) + 1
      }]
    };
    
    // Store mock data for consistency
    if (typeof window !== 'undefined') {
      const key = `inventory_${variantId}`;
      const existing = localStorage.getItem(key);
      if (!existing) {
        localStorage.setItem(key, JSON.stringify(mockInventory));
      } else {
        return JSON.parse(existing);
      }
    }
    
    return mockInventory;
    
  } catch (error) {
    console.error('Error fetching inventory levels:', error);
    return null;
  }
}

export async function updateInventoryLevel(variantId, options = {}) {
  try {
    const { available, reason = 'Manual adjustment' } = options;
    
    // In production environment with valid Shopify Admin API access
    if (domain && process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
      try {
        // This would use Shopify Admin API for inventory adjustments
        const response = await fetch(`https://${domain}/admin/api/${apiVersion}/inventory_levels/adjust.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
          },
          body: JSON.stringify({
            location_id: 'main-location', // Would be determined dynamically
            inventory_item_id: variantId,
            available_adjustment: available
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          return { success: true, data };
        }
      } catch (error) {
        console.log('Using mock inventory update:', error.message);
      }
    }
    
    // Fallback to mock inventory update
    if (typeof window !== 'undefined') {
      const key = `inventory_${variantId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      
      const updated = {
        ...existing,
        available,
        lastUpdated: new Date().toISOString(),
        updateReason: reason
      };
      
      localStorage.setItem(key, JSON.stringify(updated));
      
      // Trigger inventory update event
      window.dispatchEvent(new CustomEvent('inventory-sync', {
        detail: {
          variantId,
          inventory: updated,
          reason
        }
      }));
      
      return { success: true, data: updated };
    }
    
    return { success: false, error: 'Unable to update inventory' };
    
  } catch (error) {
    console.error('Error updating inventory level:', error);
    return { success: false, error: error.message };
  }
}

export async function getProductVariants(productId) {
  try {
    // In production environment with valid Shopify setup
    if (domain && storefrontAccessToken) {
      try {
        const query = gql`
          query getProductVariants($id: ID!) {
            product(id: $id) {
              variants(first: 50) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                    quantityAvailable
                    inventoryQuantity
                    inventoryPolicy
                  }
                }
              }
            }
          }
        `;
        
        const { status, body } = await shopifyFetch({
          query,
          variables: { id: productId }
        });
        
        if (status === 200 && body.data?.product?.variants) {
          return body.data.product.variants.edges.map(edge => edge.node);
        }
      } catch (error) {
        console.log('Using mock variant data:', error.message);
      }
    }
    
    // Fallback to mock variants
    return [
      {
        id: `${productId}_variant_1`,
        title: 'Default Title',
        price: { amount: '2499.00', currencyCode: 'INR' },
        availableForSale: true,
        quantityAvailable: Math.floor(Math.random() * 50) + 1,
        inventoryQuantity: Math.floor(Math.random() * 50) + 1,
        inventoryPolicy: 'DENY'
      }
    ];
    
  } catch (error) {
    console.error('Error fetching product variants:', error);
    return [];
  }
}

// Low stock monitoring
export async function getLowStockProducts(threshold = 5) {
  try {
    const products = await getProducts();
    const lowStockItems = [];
    
    for (const product of products.products || []) {
      const variants = await getProductVariants(product.id);
      
      for (const variant of variants) {
        const inventory = await getInventoryLevels(variant.id);
        
        if (inventory && inventory.available <= threshold && inventory.available > 0) {
          lowStockItems.push({
            product,
            variant,
            inventory
          });
        }
      }
    }
    
    return lowStockItems;
    
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return [];
  }
}

// Inventory webhook simulation (for development)

// ===========================
// ANALYTICS FUNCTIONS
// ===========================

// Track customer events
export async function trackCustomerEvent(customerId, eventType, eventData) {
  try {
    const event = {
      id: `event_${Date.now()}`,
      customerId,
      eventType,
      eventData,
      timestamp: new Date().toISOString(),
      sessionId: sessionStorage?.getItem('session_id') || 'anonymous'
    };
    
    // Store in localStorage for development (would be sent to analytics service in production)
    if (typeof window !== 'undefined') {
      const events = JSON.parse(localStorage.getItem('customer_events') || '[]');
      events.push(event);
      
      // Keep only last 1000 events
      if (events.length > 1000) {
        events.splice(0, events.length - 1000);
      }
      
      localStorage.setItem('customer_events', JSON.stringify(events));
    }
    
    return { success: true, event };
  } catch (error) {
    console.error('Error tracking customer event:', error);
    return { success: false, error: error.message };
  }
}

// Get customer analytics data
export async function getCustomerAnalytics(customerId, timeRange = '30d') {
  try {
    // In production, this would query actual analytics APIs
    const mockAnalytics = {
      customerId,
      timeRange,
      metrics: {
        totalOrders: Math.floor(Math.random() * 20) + 1,
        totalSpent: (Math.random() * 50000 + 5000).toFixed(2),
        averageOrderValue: (Math.random() * 3000 + 500).toFixed(2),
        lastOrderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        favoriteCategories: ['Sarees', 'Lehengas', 'Kurtas'],
        sessionCount: Math.floor(Math.random() * 50) + 10,
        pageViews: Math.floor(Math.random() * 200) + 50
      },
      events: typeof window !== 'undefined' ? 
        JSON.parse(localStorage.getItem('customer_events') || '[]')
          .filter(event => event.customerId === customerId)
          .slice(-50) : [],
      segments: ['High Value Customer', 'Frequent Buyer', 'Traditional Wear Enthusiast']
    };
    
    return mockAnalytics;
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    return null;
  }
}

// Get product analytics
export async function getProductAnalytics(productId, timeRange = '30d') {
  try {
    const mockProductAnalytics = {
      productId,
      timeRange,
      metrics: {
        views: Math.floor(Math.random() * 1000) + 100,
        addToCarts: Math.floor(Math.random() * 100) + 20,
        purchases: Math.floor(Math.random() * 50) + 5,
        wishlistAdds: Math.floor(Math.random() * 30) + 5,
        conversionRate: ((Math.random() * 5) + 1).toFixed(2),
        revenue: (Math.random() * 25000 + 5000).toFixed(2),
        avgRating: (Math.random() * 2 + 3).toFixed(1),
        reviewCount: Math.floor(Math.random() * 20) + 2
      },
      traffic: {
        organic: Math.floor(Math.random() * 40) + 30,
        social: Math.floor(Math.random() * 30) + 15,
        direct: Math.floor(Math.random() * 20) + 10,
        referral: Math.floor(Math.random() * 15) + 5
      },
      demographics: {
        topAge: '25-34',
        topGender: 'Female',
        topLocation: 'Mumbai'
      }
    };
    
    return mockProductAnalytics;
  } catch (error) {
    console.error('Error fetching product analytics:', error);
    return null;
  }
}

// Get store analytics overview
export async function getStoreAnalytics(timeRange = '30d') {
  try {
    const mockStoreAnalytics = {
      timeRange,
      overview: {
        totalRevenue: (Math.random() * 500000 + 100000).toFixed(2),
        totalOrders: Math.floor(Math.random() * 1000) + 200,
        totalCustomers: Math.floor(Math.random() * 500) + 100,
        conversionRate: (Math.random() * 5 + 1).toFixed(2),
        averageOrderValue: (Math.random() * 3000 + 1000).toFixed(2),
        returnCustomerRate: (Math.random() * 40 + 20).toFixed(1)
      },
      traffic: {
        sessions: Math.floor(Math.random() * 10000) + 5000,
        pageViews: Math.floor(Math.random() * 50000) + 20000,
        uniqueVisitors: Math.floor(Math.random() * 8000) + 3000,
        bounceRate: (Math.random() * 30 + 40).toFixed(1),
        averageSessionDuration: Math.floor(Math.random() * 300 + 120) // seconds
      },
      topProducts: [
        { id: 'product_1', name: 'Banarasi Silk Saree', sales: 45, revenue: 112500 },
        { id: 'product_2', name: 'Designer Lehenga', sales: 32, revenue: 96000 },
        { id: 'product_3', name: 'Cotton Kurta Set', sales: 28, revenue: 42000 }
      ],
      trafficSources: {
        organic: 45,
        social: 25,
        direct: 20,
        email: 6,
        paid: 4
      },
      deviceBreakdown: {
        mobile: 65,
        desktop: 30,
        tablet: 5
      },
      topLocations: [
        { city: 'Mumbai', percentage: 22 },
        { city: 'Delhi', percentage: 18 },
        { city: 'Bangalore', percentage: 15 },
        { city: 'Chennai', percentage: 12 },
        { city: 'Kolkata', percentage: 10 }
      ]
    };
    
    return mockStoreAnalytics;
  } catch (error) {
    console.error('Error fetching store analytics:', error);
    return null;
  }
}

// Track search analytics
export async function trackSearchAnalytics(searchTerm, resultsCount, filters = {}) {
  try {
    const searchEvent = {
      id: `search_${Date.now()}`,
      searchTerm,
      resultsCount,
      filters,
      timestamp: new Date().toISOString(),
      sessionId: sessionStorage?.getItem('session_id') || 'anonymous'
    };
    
    if (typeof window !== 'undefined') {
      const searches = JSON.parse(localStorage.getItem('search_analytics') || '[]');
      searches.push(searchEvent);
      
      // Keep only last 500 search events
      if (searches.length > 500) {
        searches.splice(0, searches.length - 500);
      }
      
      localStorage.setItem('search_analytics', JSON.stringify(searches));
    }
    
    return { success: true, searchEvent };
  } catch (error) {
    console.error('Error tracking search analytics:', error);
    return { success: false, error: error.message };
  }
}

// Get search analytics data
export async function getSearchAnalytics(timeRange = '30d') {
  try {
    const searches = typeof window !== 'undefined' ? 
      JSON.parse(localStorage.getItem('search_analytics') || '[]') : [];
    
    // Calculate top search terms
    const termCounts = {};
    searches.forEach(search => {
      const term = search.searchTerm.toLowerCase();
      termCounts[term] = (termCounts[term] || 0) + 1;
    });
    
    const topSearchTerms = Object.entries(termCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }));
    
    // Calculate search metrics
    const totalSearches = searches.length;
    const uniqueTerms = Object.keys(termCounts).length;
    const avgResultsPerSearch = searches.reduce((sum, search) => sum + search.resultsCount, 0) / totalSearches || 0;
    
    return {
      timeRange,
      totalSearches,
      uniqueTerms,
      avgResultsPerSearch: avgResultsPerSearch.toFixed(1),
      topSearchTerms,
      noResultsCount: searches.filter(s => s.resultsCount === 0).length,
      recentSearches: searches.slice(-20).reverse()
    };
  } catch (error) {
    console.error('Error fetching search analytics:', error);
    return null;
  }
}

// Track cart analytics
export async function trackCartAnalytics(action, cartData) {
  try {
    const cartEvent = {
      id: `cart_${Date.now()}`,
      action, // 'add', 'remove', 'update', 'abandon', 'checkout'
      cartData,
      timestamp: new Date().toISOString(),
      sessionId: sessionStorage?.getItem('session_id') || 'anonymous'
    };
    
    if (typeof window !== 'undefined') {
      const cartEvents = JSON.parse(localStorage.getItem('cart_analytics') || '[]');
      cartEvents.push(cartEvent);
      
      // Keep only last 1000 cart events
      if (cartEvents.length > 1000) {
        cartEvents.splice(0, cartEvents.length - 1000);
      }
      
      localStorage.setItem('cart_analytics', JSON.stringify(cartEvents));
    }
    
    return { success: true, cartEvent };
  } catch (error) {
    console.error('Error tracking cart analytics:', error);
    return { success: false, error: error.message };
  }
}

// Get cart analytics data
export async function getCartAnalytics(timeRange = '30d') {
  try {
    const cartEvents = typeof window !== 'undefined' ? 
      JSON.parse(localStorage.getItem('cart_analytics') || '[]') : [];
    
    const addToCartEvents = cartEvents.filter(event => event.action === 'add');
    const abandonmentEvents = cartEvents.filter(event => event.action === 'abandon');
    const checkoutEvents = cartEvents.filter(event => event.action === 'checkout');
    
    const cartAbandonmentRate = addToCartEvents.length > 0 ? 
      ((abandonmentEvents.length / addToCartEvents.length) * 100).toFixed(1) : '0.0';
    
    return {
      timeRange,
      totalAddToCarts: addToCartEvents.length,
      totalAbandonments: abandonmentEvents.length,
      totalCheckouts: checkoutEvents.length,
      cartAbandonmentRate,
      avgCartValue: addToCartEvents.reduce((sum, event) => {
        const value = event.cartData?.totalValue || 0;
        return sum + parseFloat(value);
      }, 0) / (addToCartEvents.length || 1),
      recentCartActions: cartEvents.slice(-20).reverse()
    };
  } catch (error) {
    console.error('Error fetching cart analytics:', error);
    return null;
  }
}

// Generate analytics report
export async function generateAnalyticsReport(reportType = 'overview', timeRange = '30d') {
  try {
    const report = {
      reportType,
      timeRange,
      generatedAt: new Date().toISOString(),
      data: {}
    };
    
    switch (reportType) {
      case 'overview':
        report.data = await getStoreAnalytics(timeRange);
        break;
      case 'products':
        const products = await getProducts();
        report.data.productAnalytics = await Promise.all(
          (products.products || []).slice(0, 10).map(async (product) => ({
            product,
            analytics: await getProductAnalytics(product.id, timeRange)
          }))
        );
        break;
      case 'customers':
        const customers = await getCustomers();
        report.data.customerAnalytics = await Promise.all(
          (customers.customers || []).slice(0, 10).map(async (customer) => ({
            customer,
            analytics: await getCustomerAnalytics(customer.id, timeRange)
          }))
        );
        break;
      case 'search':
        report.data = await getSearchAnalytics(timeRange);
        break;
      case 'cart':
        report.data = await getCartAnalytics(timeRange);
        break;
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
    
    return report;
  } catch (error) {
    console.error('Error generating analytics report:', error);
    return null;
  }
}
export function simulateInventoryWebhook(variantId, change) {
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('inventory-webhook', {
        detail: {
          variantId,
          change,
          timestamp: new Date().toISOString(),
          type: 'inventory_update'
        }
      }));
    }, Math.random() * 5000); // Random delay up to 5 seconds
  }
}

// Marketing and Promotions Functions

const DISCOUNT_CODE_APPLY_MUTATION = gql`
  mutation checkoutDiscountCodeApplyV2($discountCode: String!, $checkoutId: ID!) {
    checkoutDiscountCodeApplyV2(discountCode: $discountCode, checkoutId: $checkoutId) {
      checkout {
        id
        discountApplications(first: 10) {
          edges {
            node {
              ... on DiscountCodeApplication {
                code
                applicable
              }
            }
          }
        }
      }
      checkoutUserErrors {
        field
        message
      }
    }
  }
`;

const AVAILABLE_PROMOTIONS_QUERY = gql`
  query getAvailablePromotions {
    shop {
      name
      description
    }
  }
`;

// Mock promotions data
const mockPromotions = [
  {
    id: 'promo_1',
    title: '10% Off Storewide',
    description: 'Get 10% off on all traditional wear',
    type: 'percentage',
    value: 10,
    code: 'WELCOME10',
    minimum_amount: 999,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    active: true
  },
  {
    id: 'promo_2',
    title: 'Free Shipping',
    description: 'Free shipping on orders above ₹1999',
    type: 'free_shipping',
    value: 0,
    code: 'FREESHIP',
    minimum_amount: 1999,
    expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    active: true
  },
  {
    id: 'promo_3',
    title: '₹500 Off',
    description: 'Flat ₹500 off on orders above ₹2999',
    type: 'fixed_amount',
    value: 500,
    code: 'SAVE500',
    minimum_amount: 2999,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    active: true
  },
  {
    id: 'promo_4',
    title: 'Festival Special - 25% Off',
    description: 'Celebrate with 25% off on silk sarees',
    type: 'percentage',
    value: 25,
    code: 'FESTIVAL25',
    minimum_amount: 1499,
    expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    active: true,
    category: 'sarees'
  }
];

export async function applyDiscountCode(code, cart) {
  try {
    // In production environment with valid Shopify setup
    if (domain && storefrontAccessToken) {
      try {
        // This would use Shopify's checkout API to apply discount codes
        // For now, we'll simulate the behavior
        console.log('Applying discount code via Shopify API:', code);
      } catch (error) {
        console.log('Using mock discount validation:', error.message);
      }
    }
    
    // Mock discount code validation
    const promotion = mockPromotions.find(p => 
      p.code.toLowerCase() === code.toLowerCase() && 
      p.active &&
      new Date(p.expires_at) > new Date()
    );
    
    if (!promotion) {
      return {
        success: false,
        error: 'Invalid or expired discount code'
      };
    }
    
    // Calculate cart total
    const cartTotal = cart.reduce((total, item) => {
      return total + (parseFloat(item.price.amount || item.price) * (item.quantity || 1));
    }, 0);
    
    // Check minimum amount requirement
    if (promotion.minimum_amount && cartTotal < promotion.minimum_amount) {
      return {
        success: false,
        error: `Minimum order amount of ₹${promotion.minimum_amount} required`
      };
    }
    
    // Calculate discount amount
    let discountAmount = 0;
    let discountValue = '';
    
    switch (promotion.type) {
      case 'percentage':
        discountAmount = (cartTotal * promotion.value) / 100;
        discountValue = `${promotion.value}%`;
        break;
      case 'fixed_amount':
        discountAmount = Math.min(promotion.value, cartTotal);
        discountValue = `₹${promotion.value}`;
        break;
      case 'free_shipping':
        discountAmount = 99; // Assuming ₹99 shipping cost
        discountValue = 'Free Shipping';
        break;
    }
    
    const discount = {
      id: promotion.id,
      code: promotion.code,
      title: promotion.title,
      type: promotion.type,
      value: discountValue,
      amount: discountAmount,
      applicable: true
    };
    
    // Store applied discount
    if (typeof window !== 'undefined') {
      const appliedDiscounts = JSON.parse(localStorage.getItem('applied_discounts') || '[]');
      const updatedDiscounts = appliedDiscounts.filter(d => d.code !== code);
      updatedDiscounts.push(discount);
      localStorage.setItem('applied_discounts', JSON.stringify(updatedDiscounts));
    }
    
    return {
      success: true,
      discount
    };
    
  } catch (error) {
    console.error('Error applying discount code:', error);
    return {
      success: false,
      error: 'Failed to apply discount code'
    };
  }
}

export async function removeDiscountCode(code) {
  try {
    // In production, this would use Shopify's checkout API
    // For now, we'll remove from localStorage
    if (typeof window !== 'undefined') {
      const appliedDiscounts = JSON.parse(localStorage.getItem('applied_discounts') || '[]');
      const updatedDiscounts = appliedDiscounts.filter(d => d.code !== code);
      localStorage.setItem('applied_discounts', JSON.stringify(updatedDiscounts));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error removing discount code:', error);
    return { success: false, error: 'Failed to remove discount code' };
  }
}

export async function getAvailablePromotions() {
  try {
    // In production environment with valid Shopify setup
    if (domain && storefrontAccessToken) {
      try {
        // This would query Shopify's discount API
        console.log('Fetching promotions from Shopify API');
      } catch (error) {
        console.log('Using mock promotions data:', error.message);
      }
    }
    
    // Return active promotions that haven't expired
    const activePromotions = mockPromotions.filter(p => 
      p.active && new Date(p.expires_at) > new Date()
    );
    
    return activePromotions;
    
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return [];
  }
}

export async function getCustomerEligibleDiscounts(customerId) {
  try {
    // In production, this would check customer-specific discounts
    // For now, we'll return some mock customer-specific offers
    
    const customerSpecificOffers = [
      {
        id: 'customer_1',
        title: 'Loyal Customer Bonus',
        description: 'Exclusive 15% off for our valued customer',
        type: 'percentage',
        value: 15,
        code: 'LOYAL15',
        minimum_amount: 0,
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
        active: true,
        customer_specific: true
      }
    ];
    
    return customerSpecificOffers;
    
  } catch (error) {
    console.error('Error fetching customer discounts:', error);
    return [];
  }
}

// Check for automatic discounts based on cart contents
export async function checkAutomaticDiscounts(cart) {
  try {
    const cartTotal = cart.reduce((total, item) => {
      return total + (parseFloat(item.price.amount || item.price) * (item.quantity || 1));
    }, 0);
    
    const automaticDiscounts = [];
    
    // Free shipping auto-discount
    if (cartTotal >= 1999) {
      automaticDiscounts.push({
        id: 'auto_free_shipping',
        title: 'Free Shipping',
        description: 'Congratulations! You qualify for free shipping',
        type: 'free_shipping',
        amount: 99
      });
    }
    
    // Bulk order discount
    if (cartTotal >= 4999) {
      automaticDiscounts.push({
        id: 'auto_bulk_discount',
        title: 'Bulk Order Discount',
        description: 'Get 5% off on orders above ₹4999',
        type: 'percentage',
        value: 5,
        amount: cartTotal * 0.05
      });
    }
    
    return automaticDiscounts;
    
  } catch (error) {
    console.error('Error checking automatic discounts:', error);
    return [];
  }
}

// Newsletter subscription
export async function subscribeToNewsletter(email, source = 'popup') {
  try {
    // In production, this would integrate with email marketing service
    console.log('Subscribing to newsletter:', { email, source });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store subscription locally for demo
    if (typeof window !== 'undefined') {
      const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
      subscriptions.push({
        email,
        source,
        subscribed_at: new Date().toISOString(),
        discount_code: 'WELCOME10'
      });
      localStorage.setItem('newsletter_subscriptions', JSON.stringify(subscriptions));
    }
    
    return {
      success: true,
      discount_code: 'WELCOME10',
      message: 'Successfully subscribed! Check your email for discount code.'
    };
    
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return {
      success: false,
      error: 'Failed to subscribe to newsletter'
    };
  }
}

// =============================================================================
// CUSTOMER SUPPORT FUNCTIONS
// =============================================================================

// Mock support data
const mockFAQs = [
  {
    id: 'faq_1',
    question: 'How do I track my order?',
    answer: 'You can track your order by logging into your account and visiting the Orders section. You\'ll receive an email with tracking information once your order ships.',
    category: 'orders',
    helpful: 25,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'faq_2',
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy for all items. Items must be unused, with original tags, and in original packaging. <a href="/returns" class="text-burgundy">Learn more about returns</a>.',
    category: 'returns',
    helpful: 42,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'faq_3',
    question: 'How do I find my size?',
    answer: 'Each product page includes a detailed size chart. For sarees, the blouse measurements are provided. For ready-to-wear items, refer to our standard size guide.',
    category: 'products',
    helpful: 38,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'faq_4',
    question: 'Do you offer free shipping?',
    answer: 'Yes! We offer free shipping on all orders above ₹1999. Standard delivery takes 3-5 business days across India.',
    category: 'orders',
    helpful: 31,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'faq_5',
    question: 'What payment methods do you accept?',
    answer: 'We accept UPI, credit/debit cards, net banking, digital wallets, and cash on delivery. All payments are processed securely through Razorpay.',
    category: 'payments',
    helpful: 29,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'faq_6',
    question: 'How do I care for silk sarees?',
    answer: 'Silk sarees should be dry cleaned only. Store them in cotton bags or wrapped in muslin cloth. Avoid direct sunlight and moisture.',
    category: 'products',
    helpful: 19,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'faq_7',
    question: 'Can I exchange an item for a different size?',
    answer: 'Yes, you can exchange items for a different size within 30 days. The item must be unused with original tags. Exchange shipping is free for the first exchange.',
    category: 'returns',
    helpful: 22,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'faq_8',
    question: 'How do I create an account?',
    answer: 'Click on the "Sign In" button at the top of the page, then select "Create Account". You\'ll need to provide your email address and create a password.',
    category: 'account',
    helpful: 15,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const mockHelpArticles = [
  {
    id: 'article_1',
    title: 'Complete Size Guide for Indian Clothing',
    summary: 'Comprehensive measurements for sarees, kurtis, lehengas, and accessories',
    content: '<h2>Size Guide</h2><p>Find your perfect fit with our detailed size charts...</p>',
    category: 'Sizing',
    readTime: 5,
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'article_2',
    title: 'How to Style Traditional Indian Outfits',
    summary: 'Tips and tricks for styling sarees, kurtis, and ethnic wear',
    content: '<h2>Styling Guide</h2><p>Learn the art of traditional styling...</p>',
    category: 'Styling',
    readTime: 8,
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'article_3',
    title: 'Care Instructions for Different Fabrics',
    summary: 'Maintain the beauty and longevity of your traditional wear',
    content: '<h2>Fabric Care</h2><p>Different fabrics require different care...</p>',
    category: 'Care',
    readTime: 6,
    updatedAt: '2024-01-25T00:00:00Z'
  }
];

// Submit support ticket
export async function submitSupportTicket(ticketData) {
  try {
    // In production, this would integrate with customer service platform
    console.log('Submitting support ticket:', ticketData);
    
    // Create mock ticket
    const ticket = {
      id: `ticket_${Date.now()}`,
      ...ticketData,
      status: 'open',
      priority: ticketData.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: null,
      responses: []
    };
    
    // Store ticket locally for demo
    if (typeof window !== 'undefined') {
      const tickets = JSON.parse(localStorage.getItem('support_tickets') || '[]');
      tickets.push(ticket);
      localStorage.setItem('support_tickets', JSON.stringify(tickets));
    }
    
    // Simulate email notification
    console.log('Support ticket created successfully:', ticket.id);
    
    return {
      success: true,
      ticket,
      message: 'Your support request has been submitted successfully. We\'ll get back to you within 24 hours.'
    };
    
  } catch (error) {
    console.error('Error submitting support ticket:', error);
    throw new Error('Failed to submit support ticket');
  }
}

// Get FAQs
export async function getFAQs(category = null) {
  try {
    // In production, this would fetch from CMS or knowledge base
    let faqs = [...mockFAQs];
    
    if (category && category !== 'all') {
      faqs = faqs.filter(faq => faq.category === category);
    }
    
    // Sort by helpfulness
    faqs.sort((a, b) => b.helpful - a.helpful);
    
    return faqs;
    
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
}

// Get help articles
export async function getHelpArticles(category = null) {
  try {
    // In production, this would fetch from CMS
    let articles = [...mockHelpArticles];
    
    if (category && category !== 'all') {
      articles = articles.filter(article => article.category === category);
    }
    
    // Sort by update date
    articles.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    return articles;
    
  } catch (error) {
    console.error('Error fetching help articles:', error);
    return [];
  }
}

// Get support tickets for a customer
export async function getCustomerSupportTickets(customerId) {
  try {
    if (typeof window === 'undefined') return [];
    
    const tickets = JSON.parse(localStorage.getItem('support_tickets') || '[]');
    return tickets.filter(ticket => ticket.customerId === customerId);
    
  } catch (error) {
    console.error('Error fetching customer support tickets:', error);
    return [];
  }
}

// Update support ticket
export async function updateSupportTicket(ticketId, updates) {
  try {
    // In production, this would update via API
    console.log('Updating support ticket:', ticketId, updates);
    
    if (typeof window !== 'undefined') {
      const tickets = JSON.parse(localStorage.getItem('support_tickets') || '[]');
      const ticketIndex = tickets.findIndex(t => t.id === ticketId);
      
      if (ticketIndex >= 0) {
        tickets[ticketIndex] = {
          ...tickets[ticketIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('support_tickets', JSON.stringify(tickets));
        return { success: true, ticket: tickets[ticketIndex] };
      }
    }
    
    return { success: false, error: 'Ticket not found' };
    
  } catch (error) {
    console.error('Error updating support ticket:', error);
    throw new Error('Failed to update support ticket');
  }
}

// Add response to support ticket
export async function addTicketResponse(ticketId, response) {
  try {
    // In production, this would add response via API
    console.log('Adding response to ticket:', ticketId, response);
    
    const newResponse = {
      id: `response_${Date.now()}`,
      ...response,
      createdAt: new Date().toISOString()
    };
    
    if (typeof window !== 'undefined') {
      const tickets = JSON.parse(localStorage.getItem('support_tickets') || '[]');
      const ticketIndex = tickets.findIndex(t => t.id === ticketId);
      
      if (ticketIndex >= 0) {
        tickets[ticketIndex].responses = tickets[ticketIndex].responses || [];
        tickets[ticketIndex].responses.push(newResponse);
        tickets[ticketIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('support_tickets', JSON.stringify(tickets));
        return { success: true, response: newResponse };
      }
    }
    
    return { success: false, error: 'Ticket not found' };
    
  } catch (error) {
    console.error('Error adding ticket response:', error);
    throw new Error('Failed to add ticket response');
  }
}

// Search help content
export async function searchHelpContent(query) {
  try {
    const searchTerm = query.toLowerCase();
    
    // Search FAQs
    const faqs = await getFAQs();
    const matchingFAQs = faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm) ||
      faq.answer.toLowerCase().includes(searchTerm)
    );
    
    // Search articles
    const articles = await getHelpArticles();
    const matchingArticles = articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm) ||
      article.summary.toLowerCase().includes(searchTerm) ||
      article.content.toLowerCase().includes(searchTerm)
    );
    
    return {
      faqs: matchingFAQs,
      articles: matchingArticles,
      totalResults: matchingFAQs.length + matchingArticles.length
    };
    
  } catch (error) {
    console.error('Error searching help content:', error);
    return { faqs: [], articles: [], totalResults: 0 };
  }
}

// Get support statistics
export async function getSupportStats() {
  try {
    if (typeof window === 'undefined') {
      return {
        totalTickets: 0,
        openTickets: 0,
        resolvedTickets: 0,
        averageResponseTime: '24 hours',
        customerSatisfaction: '98%'
      };
    }
    
    const tickets = JSON.parse(localStorage.getItem('support_tickets') || '[]');
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
    
    return {
      totalTickets: tickets.length,
      openTickets,
      resolvedTickets,
      averageResponseTime: '24 hours',
      customerSatisfaction: '98%'
    };
    
  } catch (error) {
    console.error('Error fetching support stats:', error);
    return {
      totalTickets: 0,
      openTickets: 0,
      resolvedTickets: 0,
      averageResponseTime: '24 hours',
      customerSatisfaction: '98%'
    };
  }
}

// =============================================================================
// ADMIN MANAGEMENT FUNCTIONS
// =============================================================================

// Mock admin data
const mockCustomers = [
  {
    id: 'cust_1',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91-9876543210',
    createdAt: '2024-01-15T10:30:00Z',
    numberOfOrders: 3,
    totalSpent: { amount: '7500.00', currencyCode: 'INR' },
    tags: ['VIP', 'repeat-customer']
  },
  {
    id: 'cust_2',
    firstName: 'Anita',
    lastName: 'Kumar',
    email: 'anita.kumar@example.com',
    phone: '+91-8765432109',
    createdAt: '2024-02-20T14:15:00Z',
    numberOfOrders: 1,
    totalSpent: { amount: '2499.00', currencyCode: 'INR' },
    tags: ['new-customer']
  }
];

// Product Management Functions
export async function createProduct(productData) {
  try {
    // In production, this would use Shopify Admin API
    console.log('Creating product:', productData);
    
    // Mock creation
    const newProduct = {
      id: `product_${Date.now()}`,
      ...productData,
      handle: productData.title.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      variants: {
        edges: [{
          node: {
            id: `variant_${Date.now()}`,
            title: 'Default Title',
            price: { amount: productData.price.toString(), currencyCode: 'INR' },
            availableForSale: true,
            quantityAvailable: productData.inventory || 10
          }
        }]
      },
      priceRange: {
        minVariantPrice: {
          amount: productData.price.toString(),
          currencyCode: 'INR'
        }
      },
      images: { nodes: [] }
    };
    
    return { success: true, product: newProduct };
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product');
  }
}

export async function updateProduct(productId, productData) {
  try {
    // In production, this would use Shopify Admin API
    console.log('Updating product:', productId, productData);
    
    // Mock update
    return { success: true, product: { id: productId, ...productData } };
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
}

export async function deleteProduct(productId) {
  try {
    // In production, this would use Shopify Admin API
    console.log('Deleting product:', productId);
    
    // Mock deletion
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
}

// Order Management Functions

export async function fulfillOrder(orderId, fulfillmentData) {
  try {
    // In production, this would use Shopify Admin API
    console.log('Fulfilling order:', orderId, fulfillmentData);
    
    // Mock fulfillment
    return { success: true, fulfillment: { id: `fulfillment_${Date.now()}`, ...fulfillmentData } };
  } catch (error) {
    console.error('Error fulfilling order:', error);
    throw new Error('Failed to fulfill order');
  }
}

// Customer Management Functions
export async function getCustomers(options = {}) {
  try {
    const { first = 50 } = options;
    
    // In production environment with valid Shopify setup
    if (domain && storefrontAccessToken) {
      try {
        // This would use Shopify Customer API
        console.log('Fetching customers from Shopify API');
      } catch (error) {
        console.log('Using mock customers data:', error.message);
      }
    }
    
    // Return mock customers data
    return {
      customers: mockCustomers.slice(0, first),
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  } catch (error) {
    console.error('Error fetching customers:', error);
    return { customers: [], pageInfo: {} };
  }
}

export async function updateCustomer(customerId, customerData) {
  try {
    // In production, this would use Shopify Admin API
    console.log('Updating customer:', customerId, customerData);
    
    // Mock update
    return { success: true, customer: { id: customerId, ...customerData } };
  } catch (error) {
    console.error('Error updating customer:', error);
    throw new Error('Failed to update customer');
  }
}

export async function getProductById(productId) {
  try {
    // In production, this would fetch specific product by ID
    const product = mockProducts.find(p => p.id === productId);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw new Error('Failed to fetch product');
  }
}

export async function getOrders(options = {}) {
  try {
    const { first = 50 } = options;
    
    // Return mock orders data
    return {
      orders: mockOrders.slice(0, first),
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { orders: [], pageInfo: {} };
  }
}

export async function getDashboardStats() {
  try {
    const [products, orders, customers] = await Promise.all([
      getProducts({ first: 100 }),
      getOrders({ first: 100 }),
      getCustomers({ first: 100 })
    ]);
    
    const totalRevenue = (orders.orders || []).reduce((sum, order) => 
      sum + parseFloat(order.totalPrice?.amount || 0), 0
    );
    
    const lowStockItems = await getLowStockProducts(5);
    
    return {
      totalProducts: (products.products || []).length,
      totalOrders: (orders.orders || []).length,
      totalCustomers: (customers.customers || []).length,
      totalRevenue,
      lowStockCount: lowStockItems.length,
      recentOrders: (orders.orders || []).slice(0, 5),
      recentCustomers: (customers.customers || []).slice(0, 5)
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalRevenue: 0,
      lowStockCount: 0,
      recentOrders: [],
      recentCustomers: []
    };
  }
}

