import { getProducts } from '@/lib/shopify';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://omabha.com';

// Generate sitemap XML
const generateSitemap = (products = []) => {
  const staticPages = [
    {
      url: '',
      lastMod: new Date().toISOString(),
      priority: '1.0',
      changeFreq: 'daily'
    },
    {
      url: '/search',
      lastMod: new Date().toISOString(),
      priority: '0.8',
      changeFreq: 'daily'
    },
    {
      url: '/account',
      lastMod: new Date().toISOString(),
      priority: '0.6',
      changeFreq: 'monthly'
    },
    {
      url: '/wishlist',
      lastMod: new Date().toISOString(),
      priority: '0.6',
      changeFreq: 'weekly'
    },
    {
      url: '/orders',
      lastMod: new Date().toISOString(),
      priority: '0.6',
      changeFreq: 'weekly'
    }
  ];

  const productPages = products.map(product => ({
    url: `/products/${product.handle}`,
    lastMod: product.updatedAt || new Date().toISOString(),
    priority: '0.7',
    changeFreq: 'weekly'
  }));

  const allPages = [...staticPages, ...productPages];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${allPages.map(page => `
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${page.lastMod}</lastmod>
    <changefreq>${page.changeFreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
</urlset>`;
};

export default async function handler(req, res) {
  try {
    // Get products for dynamic URLs
    const result = await getProducts();
    const products = result.products || [];

    // Generate sitemap
    const sitemap = generateSitemap(products);

    // Set appropriate headers
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
    
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}