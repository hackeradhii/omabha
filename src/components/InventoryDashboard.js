import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getLowStockProducts, 
  getInventoryLevels, 
  updateInventoryLevel,
  getProducts 
} from '@/lib/shopify';
import { 
  InventoryStatus, 
  InventoryAdjustment, 
  StockNotifications 
} from './InventoryManagement';
import { ProductImage } from './OptimizedImage';

// Main inventory dashboard
export default function InventoryDashboard() {
  const [products, setProducts] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filter, setFilter] = useState('all'); // all, low_stock, out_of_stock
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        
        // Fetch all products
        const productsResult = await getProducts();
        const allProducts = productsResult.products || [];
        
        // Fetch low stock items
        const lowStock = await getLowStockProducts(5);
        
        // Enhance products with inventory data
        const productsWithInventory = await Promise.all(
          allProducts.map(async (product) => {
            const variants = product.variants?.edges || product.variants?.nodes || [];
            const variantsWithInventory = await Promise.all(
              variants.map(async (variant) => {
                const variantNode = variant.node || variant;
                const inventory = await getInventoryLevels(variantNode.id);
                return {
                  ...variantNode,
                  inventory
                };
              })
            );
            
            return {
              ...product,
              variants: variantsWithInventory
            };
          })
        );
        
        setProducts(productsWithInventory);
        setLowStockItems(lowStock);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchTerm && !product.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Stock filter
    if (filter === 'low_stock') {
      return product.variants.some(variant => 
        variant.inventory && variant.inventory.available <= 5 && variant.inventory.available > 0
      );
    }
    
    if (filter === 'out_of_stock') {
      return product.variants.some(variant => 
        variant.inventory && variant.inventory.available <= 0
      );
    }
    
    return true;
  });

  const handleInventoryUpdate = async (variantId, newStock) => {
    // Update local state
    setProducts(prev => prev.map(product => ({
      ...product,
      variants: product.variants.map(variant => 
        variant.id === variantId 
          ? { ...variant, inventory: { ...variant.inventory, available: newStock }}
          : variant
      )
    })));
    
    // Refresh low stock items
    const lowStock = await getLowStockProducts(5);
    setLowStockItems(lowStock);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage your product inventory</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                <p className="text-2xl font-semibold text-gray-900">{lowStockItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.variants.some(v => v.inventory?.available <= 0)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Stock</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.variants.some(v => v.inventory?.available > 5)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-orange-800">Low Stock Alert</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.slice(0, 6).map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <ProductImage
                        product={item.product}
                        priority={false}
                        sizes="48px"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.product.title}</p>
                      <p className="text-sm text-gray-600 truncate">{item.variant.title}</p>
                      <p className="text-sm font-semibold text-orange-600">
                        {item.inventory.available} left
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-burgundy text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Products
              </button>
              <button
                onClick={() => setFilter('low_stock')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'low_stock'
                    ? 'bg-burgundy text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Low Stock
              </button>
              <button
                onClick={() => setFilter('out_of_stock')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'out_of_stock'
                    ? 'bg-burgundy text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Out of Stock
              </button>
            </div>
            
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
              />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <ProductImage
                      product={product}
                      priority={false}
                      sizes="64px"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{product.title}</h3>
                    <p className="text-sm text-gray-600">{product.productType}</p>
                    <Link 
                      href={`/products/${product.handle}`}
                      className="text-sm text-burgundy hover:text-gold"
                    >
                      View Product →
                    </Link>
                  </div>
                </div>

                {/* Variants */}
                <div className="space-y-3">
                  {product.variants.map((variant) => (
                    <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {variant.title === 'Default Title' ? 'Standard' : variant.title}
                        </h4>
                        <InventoryStatus 
                          product={product} 
                          variant={variant} 
                          showDetails={true}
                        />
                      </div>
                      
                      {variant.inventory && (
                        <InventoryAdjustment
                          variantId={variant.id}
                          currentStock={variant.inventory.available}
                          onUpdate={(newStock) => handleInventoryUpdate(variant.id, newStock)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Stock Notifications */}
      <StockNotifications />
    </div>
  );
}