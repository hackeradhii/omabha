const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://omabha.com';

export default function handler(req, res) {
  const robotsTxt = `User-agent: *
Allow: /

# Important pages
Allow: /products/
Allow: /search
Allow: /collections/

# Disallow admin and private pages
Disallow: /account/
Disallow: /api/
Disallow: /admin/
Disallow: /checkout
Disallow: /orders
Disallow: /_next/
Disallow: /static/

# Disallow search result pages with parameters
Disallow: /search?*

# Allow images and CSS
Allow: /images/
Allow: /*.css$
Allow: /*.js$

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl delay for courtesy
Crawl-delay: 1`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(robotsTxt);
}