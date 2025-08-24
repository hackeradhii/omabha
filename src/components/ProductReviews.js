import { useState, useEffect } from 'react';
import { useCustomer } from '@/context/CustomerContext';
import { 
  getProductReviews, 
  addProductReview, 
  updateProductReview, 
  deleteProductReview 
} from '@/lib/shopify';

function StarRating({ rating, size = 'md', interactive = false, onRatingChange = null }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const handleStarClick = (starRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleStarClick(star)}
          disabled={!interactive}
          className={`${sizeClasses[size]} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <svg
            fill={star <= rating ? '#f59e0b' : '#e5e7eb'}
            stroke={star <= rating ? '#f59e0b' : '#d1d5db'}
            strokeWidth={1}
            viewBox="0 0 24 24"
            className="transition-colors duration-200"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

function RatingDistribution({ ratingDistribution, totalReviews }) {
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = ratingDistribution[rating] || 0;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        
        return (
          <div key={rating} className="flex items-center space-x-3 text-sm">
            <span className="w-2 font-medium text-charcoal">{rating}</span>
            <StarRating rating={1} size="sm" />
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-gold h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <span className="w-8 text-xs text-charcoal/70">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function ReviewForm({ productId, onReviewSubmitted, existingReview = null, onCancel = null }) {
  const { customerAccessToken, isLoggedIn } = useCustomer();
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 5,
    title: existingReview?.title || '',
    content: existingReview?.content || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    if (!isLoggedIn) {
      setErrors(['Please log in to submit a review']);
      setIsSubmitting(false);
      return;
    }

    try {
      let result;
      if (existingReview) {
        result = await updateProductReview(customerAccessToken, existingReview.id, productId, formData);
      } else {
        result = await addProductReview(customerAccessToken, productId, formData);
      }

      if (result.success) {
        onReviewSubmitted(result.review);
        if (!existingReview) {
          setFormData({ rating: 5, title: '', content: '' });
        }
      } else {
        setErrors(result.errors.map(error => error.message));
      }
    } catch (error) {
      setErrors(['Failed to submit review. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-charcoal/70 mb-4">Please log in to write a review</p>
        <button className="px-6 py-2 bg-burgundy text-white rounded-lg hover:bg-gold hover:text-charcoal transition-colors">
          Log In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gold/20 shadow-sm">
      <h3 className="text-lg font-semibold text-charcoal mb-4">
        {existingReview ? 'Edit Review' : 'Write a Review'}
      </h3>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-charcoal mb-2">Rating</label>
        <StarRating
          rating={formData.rating}
          size="lg"
          interactive={true}
          onRatingChange={(rating) => setFormData({ ...formData, rating })}
        />
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-charcoal mb-2">Review Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
          placeholder="Summary of your review"
          required
          maxLength={100}
        />
      </div>

      {/* Content */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-charcoal mb-2">Review</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy resize-none"
          placeholder="Share your experience with this product..."
          required
          maxLength={500}
        />
        <div className="text-xs text-charcoal/50 mt-1">
          {formData.content.length}/500 characters
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          {errors.map((error, index) => (
            <p key={index} className="text-red-700 text-sm">{error}</p>
          ))}
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-burgundy text-white rounded-lg hover:bg-gold hover:text-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
        </button>
        {existingReview && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-charcoal rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function ReviewCard({ review, isOwner = false, onEdit = null, onDelete = null }) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    setIsDeleting(true);
    try {
      await onDelete(review.id);
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (showEditForm) {
    return (
      <ReviewForm
        productId={review.productId}
        existingReview={review}
        onReviewSubmitted={(updatedReview) => {
          setShowEditForm(false);
          onEdit(updatedReview);
        }}
        onCancel={() => setShowEditForm(false)}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gold/20 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-burgundy to-gold rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {review.customerName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-charcoal">{review.customerName}</h4>
              {review.verified && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  Verified Purchase
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-xs text-charcoal/50">{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>
        
        {isOwner && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowEditForm(true)}
              className="text-xs text-burgundy hover:text-gold transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-xs text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      <h5 className="font-medium text-charcoal mb-2">{review.title}</h5>
      <p className="text-charcoal/80 leading-relaxed">{review.content}</p>
      
      {review.updatedAt && (
        <p className="text-xs text-charcoal/50 mt-3">
          Last updated: {formatDate(review.updatedAt)}
        </p>
      )}
    </div>
  );
}

export default function ProductReviews({ productId }) {
  const { customer, isLoggedIn } = useCustomer();
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await getProductReviews(productId);
      setReviewsData(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmitted = (newReview) => {
    setReviewsData(prev => ({
      ...prev,
      reviews: [newReview, ...prev.reviews],
      totalReviews: prev.totalReviews + 1
    }));
    setShowReviewForm(false);
    loadReviews(); // Reload to get updated statistics
  };

  const handleReviewUpdated = (updatedReview) => {
    setReviewsData(prev => ({
      ...prev,
      reviews: prev.reviews.map(review => 
        review.id === updatedReview.id ? updatedReview : review
      )
    }));
    loadReviews(); // Reload to get updated statistics
  };

  const handleReviewDeleted = async (reviewId) => {
    try {
      await deleteProductReview(customer?.accessToken, reviewId, productId);
      setReviewsData(prev => ({
        ...prev,
        reviews: prev.reviews.filter(review => review.id !== reviewId),
        totalReviews: prev.totalReviews - 1
      }));
      loadReviews(); // Reload to get updated statistics
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const customerReview = reviewsData.reviews.find(review => 
    isLoggedIn && customer && review.customerId === customer.id
  );
  const otherReviews = reviewsData.reviews.filter(review => 
    !isLoggedIn || !customer || review.customerId !== customer.id
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gold/20 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="bg-white rounded-xl p-6 border border-gold/20 shadow-sm">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-charcoal mb-2">
              {reviewsData.averageRating || 0}
            </div>
            <StarRating rating={Math.round(reviewsData.averageRating)} size="lg" />
            <p className="text-sm text-charcoal/70 mt-2">
              Based on {reviewsData.totalReviews} {reviewsData.totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div>
            <h3 className="font-medium text-charcoal mb-4">Rating Distribution</h3>
            <RatingDistribution 
              ratingDistribution={reviewsData.ratingDistribution} 
              totalReviews={reviewsData.totalReviews} 
            />
          </div>
        </div>
      </div>

      {/* Write Review Section */}
      {isLoggedIn && !customerReview && (
        <div className="space-y-4">
          {!showReviewForm ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="w-full py-3 bg-burgundy text-white rounded-xl hover:bg-gold hover:text-charcoal transition-colors font-medium"
            >
              Write a Review
            </button>
          ) : (
            <ReviewForm
              productId={productId}
              onReviewSubmitted={handleReviewSubmitted}
              onCancel={() => setShowReviewForm(false)}
            />
          )}
        </div>
      )}

      {/* Customer's Review */}
      {customerReview && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-charcoal">Your Review</h3>
          <ReviewCard
            review={customerReview}
            isOwner={true}
            onEdit={handleReviewUpdated}
            onDelete={handleReviewDeleted}
          />
        </div>
      )}

      {/* Other Reviews */}
      {otherReviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-charcoal">
            Customer Reviews ({otherReviews.length})
          </h3>
          <div className="space-y-4">
            {otherReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}

      {/* No Reviews State */}
      {reviewsData.totalReviews === 0 && (
        <div className="bg-white rounded-xl p-8 border border-gold/20 shadow-sm text-center">
          <svg className="w-16 h-16 text-charcoal/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-xl font-semibold text-charcoal mb-2">No reviews yet</h3>
          <p className="text-charcoal/70 mb-6">Be the first to share your experience with this product</p>
          {isLoggedIn ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-6 py-3 bg-burgundy text-white rounded-xl hover:bg-gold hover:text-charcoal transition-colors"
            >
              Write First Review
            </button>
          ) : (
            <p className="text-charcoal/50">Log in to write a review</p>
          )}
        </div>
      )}
    </div>
  );
}