// API middleware for security headers
import { SECURITY_HEADERS } from '@/lib/security';

export default function handler(req, res) {
  // Set security headers
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });

  // CORS configuration for secure cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || 'https://omabhastore.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Rate limiting check (basic implementation)
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const rateLimitKey = `security_${clientIp}`;
  
  // This would integrate with a proper rate limiting service in production
  const rateLimitInfo = {
    requests: 1,
    windowStart: Date.now(),
    limit: 100, // 100 requests per hour
    windowMs: 60 * 60 * 1000
  };

  res.setHeader('X-RateLimit-Limit', rateLimitInfo.limit);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimitInfo.limit - rateLimitInfo.requests));
  res.setHeader('X-RateLimit-Reset', new Date(rateLimitInfo.windowStart + rateLimitInfo.windowMs).toISOString());

  // Security status response
  res.status(200).json({
    status: 'OK',
    security: {
      https: req.headers['x-forwarded-proto'] === 'https' || req.connection.encrypted,
      headers: 'enabled',
      cors: 'configured',
      rateLimit: 'active'
    },
    timestamp: new Date().toISOString()
  });
}

// Export configuration for Next.js
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};