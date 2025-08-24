import { useState, useEffect, useCallback } from 'react';
import { searchProducts, getCollections, filterProducts } from '@/lib/shopify';
import { useRouter } from 'next/router';
import { useDebounce } from '@/hooks/useDebounce';

export default function SearchFilter({ onResults, initialQuery = '', className = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState({
    productType: '',
    vendor: '',
    tags: [],
    minPrice: '',
    maxPrice: '',
    available: null,
    sortKey: 'BEST_SELLING',
    reverse: false
  });
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  // Predefined filter options
  const productTypes = [
    'Saree', 'Kurti', 'Lehenga', 'Dress', 'Suit', 'Blouse', 'Dupatta'
  ];
  
  const vendors = [
    'Omabha Traditional', 'Silk Heritage', 'Royal Weavers', 'Designer Collection'
  ];
  
  const popularTags = [
    'silk', 'cotton', 'embroidered', 'printed', 'handwoven', 'designer', 
    'wedding', 'party', 'casual', 'formal', 'festive', 'traditional'
  ];

  const sortOptions = [
    { key: 'BEST_SELLING', label: 'Best Selling' },
    { key: 'CREATED_AT', label: 'Newest' },
    { key: 'PRICE', label: 'Price: Low to High', reverse: false },
    { key: 'PRICE', label: 'Price: High to Low', reverse: true },
    { key: 'TITLE', label: 'Alphabetical: A-Z' },
    { key: 'TITLE', label: 'Alphabetical: Z-A', reverse: true },
    { key: 'RELEVANCE', label: 'Relevance' }
  ];

  // Load collections on component mount
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const collectionsData = await getCollections(10);
        setCollections(collectionsData);
      } catch (error) {
        console.error('Failed to load collections:', error);
      }
    };
    loadCollections();
  }, []);

  // Search function with debouncing
  const performSearch = useCallback(async () => {
    if (!debouncedQuery.trim() && Object.values(filters).every(v => !v || (Array.isArray(v) && v.length === 0))) {
      onResults && onResults({ products: [], pageInfo: { hasNextPage: false } });
      return;
    }

    setIsLoading(true);
    try {
      let results;
      
      if (debouncedQuery.trim()) {
        // Use search API for text queries
        results = await searchProducts(debouncedQuery, {
          first: 20,
          sortKey: filters.sortKey,
          reverse: filters.reverse
        });
      } else {
        // Use filter API for filter-only queries
        results = await filterProducts({
          ...filters,
          minPrice: filters.minPrice ? parseFloat(filters.minPrice) : null,
          maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
          first: 20
        });
      }

      onResults && onResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      onResults && onResults({ products: [], pageInfo: { hasNextPage: false } });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, filters, onResults]);

  // Trigger search when query or filters change
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Handle search suggestions
  useEffect(() => {
    if (query.length > 2) {
      const mockSuggestions = [
        'silk saree',
        'cotton kurti',
        'designer lehenga',
        'embroidered dress',
        'wedding saree',
        'party wear'
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [query]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleTagToggle = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSortChange = (sortOption) => {
    setFilters(prev => ({
      ...prev,
      sortKey: sortOption.key,
      reverse: sortOption.reverse || false
    }));
  };

  const clearFilters = () => {
    setFilters({
      productType: '',
      vendor: '',
      tags: [],
      minPrice: '',
      maxPrice: '',
      available: null,
      sortKey: 'BEST_SELLING',
      reverse: false
    });
    setQuery('');
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gold/20 ${className}`}>
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for sarees, kurtis, lehengas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 pr-16 rounded-xl border border-gray-200 bg-white/70 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
          />
          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {isLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <svg className="animate-spin w-5 h-5 text-burgundy" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
        
        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
            {suggestions.slice(0, 5).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gold/10 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4 text-charcoal/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-charcoal">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-burgundy/10 text-burgundy rounded-lg hover:bg-burgundy/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
          </svg>
          <span>Filters</span>
          <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <button
          onClick={clearFilters}
          className="text-sm text-charcoal/60 hover:text-burgundy transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="space-y-6 pt-4 border-t border-gray-200">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Sort By</label>
            <select
              value={`${filters.sortKey}-${filters.reverse}`}
              onChange={(e) => {
                const [key, reverse] = e.target.value.split('-');
                handleSortChange({ key, reverse: reverse === 'true' });
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-burgundy/20"
            >
              {sortOptions.map((option, index) => (
                <option key={index} value={`${option.key}-${option.reverse || false}`}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Product Type */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Product Type</label>
            <select
              value={filters.productType}
              onChange={(e) => handleFilterChange('productType', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-burgundy/20"
            >
              <option value="">All Types</option>
              {productTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Price Range (₹)</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-burgundy/20"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-burgundy/20"
              />
            </div>
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Brand</label>
            <select
              value={filters.vendor}
              onChange={(e) => handleFilterChange('vendor', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-burgundy/20"
            >
              <option value="">All Brands</option>
              {vendors.map(vendor => (
                <option key={vendor} value={vendor}>{vendor}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Style Tags</label>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                    filters.tags.includes(tag)
                      ? 'bg-burgundy text-white'
                      : 'bg-gray-100 text-charcoal hover:bg-gold/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Availability</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="availability"
                  checked={filters.available === null}
                  onChange={() => handleFilterChange('available', null)}
                  className="mr-2 text-burgundy focus:ring-burgundy"
                />
                <span className="text-sm">All</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="availability"
                  checked={filters.available === true}
                  onChange={() => handleFilterChange('available', true)}
                  className="mr-2 text-burgundy focus:ring-burgundy"
                />
                <span className="text-sm">In Stock</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="availability"
                  checked={filters.available === false}
                  onChange={() => handleFilterChange('available', false)}
                  className="mr-2 text-burgundy focus:ring-burgundy"
                />
                <span className="text-sm">Out of Stock</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}