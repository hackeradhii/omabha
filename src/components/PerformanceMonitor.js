import { useEffect } from 'react';

// Web Vitals tracking
export const trackWebVitals = (metric) => {
  // Send to analytics service (Google Analytics, etc.)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }

  // Also log for debugging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }
};

// Performance observer component
export const PerformanceMonitor = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track Largest Contentful Paint (LCP)
    const observeLCP = () => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            trackWebVitals({
              name: 'LCP',
              value: lastEntry.startTime,
              id: `lcp-${Date.now()}`,
            });
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP tracking not supported');
      }
    };

    // Track First Input Delay (FID)
    const observeFID = () => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            trackWebVitals({
              name: 'FID',
              value: entry.processingStart - entry.startTime,
              id: `fid-${Date.now()}`,
            });
          });
        });
        observer.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID tracking not supported');
      }
    };

    // Track Cumulative Layout Shift (CLS)
    const observeCLS = () => {
      try {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          
          trackWebVitals({
            name: 'CLS',
            value: clsValue,
            id: `cls-${Date.now()}`,
          });
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS tracking not supported');
      }
    };

    // Track Time to First Byte (TTFB)
    const observeTTFB = () => {
      try {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          const ttfb = navigation.responseStart - navigation.requestStart;
          trackWebVitals({
            name: 'TTFB',
            value: ttfb,
            id: `ttfb-${Date.now()}`,
          });
        }
      } catch (e) {
        console.warn('TTFB tracking not supported');
      }
    };

    // Initialize observers
    observeLCP();
    observeFID();
    observeCLS();
    observeTTFB();

    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      trackWebVitals({
        name: 'PageLoad',
        value: loadTime,
        id: `load-${Date.now()}`,
      });
    });

  }, []);

  return null; // This component doesn't render anything
};

// Resource hints component for preloading critical resources
export const ResourceHints = ({ preloadImages = [], preloadFonts = [] }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Preload critical images
    preloadImages.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    // Preload critical fonts
    preloadFonts.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

  }, [preloadImages, preloadFonts]);

  return null;
};

// Lazy loading hook for components
export const useLazyLoading = (ref, options = {}) => {
  useEffect(() => {
    if (!ref.current || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Element is visible, trigger loading
            const element = entry.target;
            element.classList.add('loaded');
            
            // Load images
            const images = element.querySelectorAll('img[data-src]');
            images.forEach((img) => {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            });

            observer.unobserve(element);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);
};

// Service Worker registration for caching
export const registerServiceWorker = () => {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);
};

// Critical CSS inlining utility
export const CriticalCSS = ({ css }) => {
  if (typeof window !== 'undefined') return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: css,
      }}
    />
  );
};

// Performance optimization utilities
export const performanceUtils = {
  // Prefetch route
  prefetchRoute: (router, href) => {
    if (typeof window !== 'undefined') {
      router.prefetch(href);
    }
  },

  // Preload component
  preloadComponent: (componentImport) => {
    if (typeof window !== 'undefined') {
      componentImport();
    }
  },

  // Debounce function for search inputs
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Image optimization helper
  optimizeImage: (url, width, height, quality = 80) => {
    if (!url) return '';
    
    // For Shopify images
    if (url.includes('cdn.shopify.com')) {
      const baseUrl = url.split('?')[0];
      return `${baseUrl}?width=${width}&height=${height}&quality=${quality}&format=webp`;
    }
    
    return url;
  },

  // Memory management for large lists
  virtualizeList: (items, viewportHeight, itemHeight) => {
    const visibleCount = Math.ceil(viewportHeight / itemHeight);
    const bufferCount = 5;
    return {
      totalHeight: items.length * itemHeight,
      visibleItems: visibleCount + bufferCount * 2,
    };
  },
};

export default PerformanceMonitor;