// Security utilities for data protection and compliance

import CryptoJS from 'crypto-js';

// Data Encryption
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key-change-in-production';

export const encrypt = (text) => {
  try {
    if (typeof text !== 'string') {
      text = JSON.stringify(text);
    }
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

export const decrypt = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    
    // Try to parse as JSON, if it fails return as string
    try {
      return JSON.parse(decryptedText);
    } catch {
      return decryptedText;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Secure Storage Utilities
export const secureStorage = {
  setItem: (key, value) => {
    if (typeof window !== 'undefined') {
      const encrypted = encrypt(value);
      if (encrypted) {
        localStorage.setItem(key, encrypted);
        return true;
      }
    }
    return false;
  },
  
  getItem: (key) => {
    if (typeof window !== 'undefined') {
      const encrypted = localStorage.getItem(key);
      if (encrypted) {
        return decrypt(encrypted);
      }
    }
    return null;
  },
  
  removeItem: (key) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
  
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  }
};

// Session Management
export const sessionManager = {
  createSession: (customerId, additionalData = {}) => {
    const sessionData = {
      customerId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...additionalData
    };
    
    secureStorage.setItem('user_session', sessionData);
    return sessionData;
  },
  
  getSession: () => {
    const session = secureStorage.getItem('user_session');
    if (session) {
      const now = new Date().getTime();
      const expiresAt = new Date(session.expiresAt).getTime();
      
      if (now < expiresAt) {
        return session;
      } else {
        // Session expired
        sessionManager.clearSession();
      }
    }
    return null;
  },
  
  updateSession: (updates) => {
    const session = sessionManager.getSession();
    if (session) {
      const updatedSession = { ...session, ...updates };
      secureStorage.setItem('user_session', updatedSession);
      return updatedSession;
    }
    return null;
  },
  
  clearSession: () => {
    secureStorage.removeItem('user_session');
    secureStorage.removeItem('cart_data');
    secureStorage.removeItem('wishlist_data');
  }
};

// Input Sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const sanitizeEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitizeInput(email.toLowerCase());
  return emailRegex.test(sanitized) ? sanitized : null;
};

export const sanitizePhone = (phone) => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Indian phone number validation (10 digits starting with 6, 7, 8, or 9)
  const indianPhoneRegex = /^[6-9]\d{9}$/;
  return indianPhoneRegex.test(cleaned) ? cleaned : null;
};

// CSRF Protection
export const generateCSRFToken = () => {
  if (typeof window !== 'undefined') {
    const token = Math.random().toString(36).substr(2) + Date.now().toString(36);
    sessionStorage.setItem('csrf_token', token);
    return token;
  }
  return null;
};

export const validateCSRFToken = (token) => {
  if (typeof window !== 'undefined') {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token;
  }
  return false;
};

// Rate Limiting (simple client-side implementation)
export const rateLimiter = {
  attempts: new Map(),
  
  isAllowed: (key, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
    const now = Date.now();
    const attempts = rateLimiter.attempts.get(key) || [];
    
    // Filter out old attempts
    const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Add current attempt
    recentAttempts.push(now);
    rateLimiter.attempts.set(key, recentAttempts);
    
    return true;
  },
  
  reset: (key) => {
    rateLimiter.attempts.delete(key);
  }
};

// Content Security Policy helpers
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Next.js
    "'unsafe-eval'", // Required for development
    "https://checkout.razorpay.com",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com"
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind CSS
    "https://fonts.googleapis.com"
  ],
  'img-src': [
    "'self'",
    "data:",
    "https:",
    "https://cdn.shopify.com",
    "https://www.google-analytics.com"
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com"
  ],
  'connect-src': [
    "'self'",
    "https://api.razorpay.com",
    "https://checkout.razorpay.com",
    "https://*.shopify.com",
    "https://www.google-analytics.com"
  ],
  'frame-src': [
    "'self'",
    "https://api.razorpay.com",
    "https://checkout.razorpay.com"
  ]
};

export const generateCSPHeader = () => {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};

// Security Headers
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': generateCSPHeader(),
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

// HTTPS Enforcement
export const enforceHTTPS = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    if (window.location.protocol !== 'https:') {
      window.location.replace(`https:${window.location.href.substring(window.location.protocol.length)}`);
    }
  }
};

// Privacy and Data Protection
export const privacyManager = {
  // Check if user has consented to cookies
  hasConsent: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cookie_consent') === 'true';
    }
    return false;
  },
  
  // Set user consent
  setConsent: (consent) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookie_consent', consent.toString());
      localStorage.setItem('consent_timestamp', new Date().toISOString());
    }
  },
  
  // Clear all user data (GDPR right to be forgotten)
  clearAllUserData: () => {
    if (typeof window !== 'undefined') {
      // Clear all localStorage items related to user
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('user_') ||
          key.includes('customer_') ||
          key.includes('cart_') ||
          key.includes('wishlist_') ||
          key.includes('search_') ||
          key.includes('analytics_')
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear session storage
      sessionStorage.clear();
      
      // Clear any analytics tracking
      if (window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'denied',
          'ad_storage': 'denied'
        });
      }
    }
  },
  
  // Export user data (GDPR right to data portability)
  exportUserData: () => {
    if (typeof window !== 'undefined') {
      const userData = {};
      
      // Collect user-related data from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('user_') ||
          key.includes('customer_') ||
          key.includes('cart_') ||
          key.includes('wishlist_')
        )) {
          try {
            userData[key] = JSON.parse(localStorage.getItem(key));
          } catch {
            userData[key] = localStorage.getItem(key);
          }
        }
      }
      
      // Create downloadable file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
};

// Audit Logging
export const auditLogger = {
  log: (action, details = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      sessionId: sessionStorage?.getItem('session_id') || 'anonymous',
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // In production, this would be sent to a secure logging service
    console.log('Audit Log:', logEntry);
    
    // Store locally for demonstration
    if (typeof window !== 'undefined') {
      const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('audit_logs', JSON.stringify(logs));
    }
  }
};

// Password Security
export const passwordUtils = {
  validate: (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  calculateStrength: (password) => {
    let score = 0;
    
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?\":{}|<>]/.test(password)) score += 1;
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }
};

export default {
  encrypt,
  decrypt,
  secureStorage,
  sessionManager,
  sanitizeInput,
  sanitizeEmail,
  sanitizePhone,
  generateCSRFToken,
  validateCSRFToken,
  rateLimiter,
  SECURITY_HEADERS,
  enforceHTTPS,
  privacyManager,
  auditLogger,
  passwordUtils
};