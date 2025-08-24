import { useState, useEffect } from 'react';
import { getProductReviews } from '@/lib/shopify';

function StarRating({ rating, size = 'sm', showRating = false, className = '' }) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            fill={star <= rating ? '#f59e0b' : '#e5e7eb'}
            stroke={star <= rating ? '#f59e0b' : '#d1d5db'}
            strokeWidth={1}
            viewBox="0 0 24 24"
            className={`${sizeClasses[size]}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
      </div>
      {showRating && (
        <span className="text-xs text-charcoal/70 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default function ReviewSummary({ productId, showRating = true, size = 'sm', className = '' }) {
  const [reviewData, setReviewData] = useState({
    averageRating: 0,
    totalReviews: 0,
    isLoading: true
  });

  useEffect(() => {
    const loadReviewSummary = async () => {
      try {
        const data = await getProductReviews(productId);
        setReviewData({
          averageRating: data.averageRating || 0,
          totalReviews: data.totalReviews || 0,
          isLoading: false
        });
      } catch (error) {
        console.error('Error loading review summary:', error);
        setReviewData({
          averageRating: 0,
          totalReviews: 0,
          isLoading: false
        });
      }
    };

    if (productId) {
      loadReviewSummary();
    }
  }, [productId]);

  if (reviewData.isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="w-8 h-3 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (reviewData.totalReviews === 0) {
    return (
      <div className={`flex items-center space-x-2 text-charcoal/50 ${className}`}>
        <StarRating rating={0} size={size} />
        <span className="text-xs">No reviews</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <StarRating 
        rating={Math.round(reviewData.averageRating)} 
        size={size} 
        showRating={showRating && reviewData.averageRating > 0}
      />
      <span className="text-xs text-charcoal/70">
        ({reviewData.totalReviews})
      </span>
    </div>
  );
}