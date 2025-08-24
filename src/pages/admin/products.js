import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useCustomer } from '@/context/CustomerContext';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getProductById 
} from '@/lib/shopify';
import { ProductImage } from '@/components/OptimizedImage';
import { InventoryStatus } from '@/components/InventoryManagement';
import SEO from '@/components/SEO';

// Product Form Modal Component
function ProductFormModal({ product, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    productType: '',
    vendor: '',
    tags: '',
    price: '',
    compareAtPrice: '',
    inventory: '',
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        productType: product.productType || '',
        vendor: product.vendor || '',
        tags: product.tags?.join(', ') || '',
        price: product.priceRange?.minVariantPrice?.amount || '',
        compareAtPrice: product.compareAtPriceRange?.minVariantPrice?.amount || '',
        inventory: product.variants?.edges?.[0]?.node?.inventory || '',
        images: product.images?.edges || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        productType: '',
        vendor: '',
        tags: '',
        price: '',
        compareAtPrice: '',
        inventory: '',
        images: []
      });
    }
  }, [product, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const productData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null
      };

      if (product) {
        await updateProduct(product.id, productData);
      } else {
        await createProduct(productData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-burgundy focus:border-burgundy ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter product title"
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Type
                </label>
                <input
                  type="text"
                  name="productType"
                  value={formData.productType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
                  placeholder="e.g., Saree, Kurti, Lehenga"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor
                </label>
                <input
                  type="text"
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
                  placeholder="Brand or vendor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
                  placeholder="Separate tags with commas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-burgundy focus:border-burgundy ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compare at Price
                </label>
                <input
                  type="number"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:ring-burgundy focus:border-burgundy ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product description"
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-burgundy text-white rounded-md hover:bg-gold hover:text-charcoal transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Product Table Row Component
function ProductTableRow({ product, onEdit, onDelete, onToggleStatus }) {
  const [showDetails, setShowDetails] = useState(false);
  
  const price = product.priceRange?.minVariantPrice?.amount || 0;
  const comparePrice = product.compareAtPriceRange?.minVariantPrice?.amount;
  const discount = comparePrice && price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  return (
    <>
      <tr className="border-b border-gray-200 hover:bg-gray-50">
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <ProductImage
                product={product}
                priority={false}
                sizes="48px"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {product.title}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {product.productType || 'Uncategorized'}
              </p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          <div className="flex flex-col">
            <span className="font-medium">₹{parseFloat(price).toFixed(2)}</span>
            {comparePrice && (
              <span className="text-xs text-gray-500 line-through">
                ₹{parseFloat(comparePrice).toFixed(2)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-xs text-green-600 font-medium">
                {discount}% OFF
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          <InventoryStatus 
            product={product} 
            variant={product.variants?.edges?.[0]?.node || product.variants?.nodes?.[0]} 
            showDetails={true}
          />
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {product.status || 'ACTIVE'}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {new Date(product.createdAt).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 text-right text-sm font-medium">
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-400 hover:text-gray-600"
              title="View Details"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={() => onEdit(product)}
              className="text-burgundy hover:text-gold"
              title="Edit Product"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(product)}
              className="text-red-600 hover:text-red-800"
              title="Delete Product"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
      {showDetails && (
        <tr className="border-b border-gray-200 bg-gray-50">
          <td colSpan={6} className="px-6 py-4">
            <div className="text-sm text-gray-600">
              <p className="mb-2"><strong>Description:</strong> {product.description || 'No description'}</p>
              {product.vendor && <p className="mb-2"><strong>Vendor:</strong> {product.vendor}</p>}
              {product.tags && product.tags.length > 0 && (
                <p className="mb-2">
                  <strong>Tags:</strong> {product.tags.join(', ')}
                </p>
              )}
              <p>
                <strong>Handle:</strong> {product.handle}
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminProducts() {
  const router = useRouter();
  const { customer, isLoggedIn } = useCustomer();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');

  useEffect(() => {
    if (!isLoggedIn || !customer) {
      router.push('/');
      return;
    }

    fetchProducts();
  }, [isLoggedIn, customer, router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await getProducts({ first: 100 });
      setProducts(result.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (product) => {
    if (confirm(`Are you sure you want to delete "${product.title}"?`)) {
      try {
        await deleteProduct(product.id);
        await fetchProducts(); // Refresh the list
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowProductForm(true);
  };

  const handleSaveProduct = async () => {
    await fetchProducts(); // Refresh the list
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.productType && product.productType.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && product.status === 'ACTIVE') ||
                         (filterType === 'draft' && product.status === 'DRAFT') ||
                         (filterType === product.productType);
    
    return matchesSearch && matchesFilter;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'title_desc':
        return b.title.localeCompare(a.title);
      case 'price_asc':
        return parseFloat(a.priceRange?.minVariantPrice?.amount || 0) - parseFloat(b.priceRange?.minVariantPrice?.amount || 0);
      case 'price_desc':
        return parseFloat(b.priceRange?.minVariantPrice?.amount || 0) - parseFloat(a.priceRange?.minVariantPrice?.amount || 0);
      case 'created_desc':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Product Management - Admin Dashboard"
        description="Manage your store products"
        noIndex={true}
      />
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-2">{products.length} total products</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Back to Dashboard
              </Link>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-burgundy text-white rounded-md hover:bg-gold hover:text-charcoal transition-colors"
              >
                Add Product
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Products
                </label>
                <input
                  type="text"
                  placeholder="Search by title or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
                >
                  <option value="all">All Types</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="Saree">Sarees</option>
                  <option value="Kurti">Kurtis</option>
                  <option value="Lehenga">Lehengas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
                >
                  <option value="created_desc">Newest First</option>
                  <option value="title_asc">Title A-Z</option>
                  <option value="title_desc">Title Z-A</option>
                  <option value="price_asc">Price Low-High</option>
                  <option value="price_desc">Price High-Low</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setSortBy('created_desc');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inventory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedProducts.map((product) => (
                    <ProductTableRow
                      key={product.id}
                      product={product}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'Get started by adding your first product.'}
                </p>
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-burgundy text-white rounded-md hover:bg-gold hover:text-charcoal transition-colors"
                >
                  Add Your First Product
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Product Form Modal */}
        <ProductFormModal
          product={selectedProduct}
          isOpen={showProductForm}
          onClose={() => setShowProductForm(false)}
          onSave={handleSaveProduct}
        />
      </div>
    </>
  );
}