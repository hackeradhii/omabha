import { useState, useEffect, useCallback } from 'react';
import { getInventoryLevels, updateInventoryLevel, getProductVariants } from '@/lib/shopify';

// Inventory status component
export function InventoryStatus({ product, variant, className = '', showDetails = false }) {
  const [inventoryLevel, setInventoryLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventoryLevel = async () => {
      if (!variant?.id) return;
      
      try {
        setLoading(true);
        const level = await getInventoryLevels(variant.id);
        setInventoryLevel(level);
      } catch (error) {
        console.error('Error fetching inventory level:', error);
        setInventoryLevel(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryLevel();
  }, [variant?.id]);

  if (loading) {
    return <div className={`animate-pulse bg-gray-200 h-4 w-16 rounded ${className}`}></div>;
  }

  if (!inventoryLevel) {
    return null;
  }

  const { available, onHand, policy } = inventoryLevel;
  const isLowStock = available <= 5 && available > 0;
  const isOutOfStock = available <= 0;

  const getStatusColor = () => {
    if (isOutOfStock) return 'text-red-600 bg-red-50 border-red-200';
    if (isLowStock) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusText = () => {
    if (isOutOfStock) return 'Out of Stock';
    if (isLowStock) return `Only ${available} left`;
    if (available <= 20) return `${available} in stock`;
    return 'In Stock';
  };

  return (
    <div className={`${className}`}>
      <div className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor()}`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${
          isOutOfStock ? 'bg-red-400' : isLowStock ? 'bg-orange-400' : 'bg-green-400'
        }`}></div>
        {getStatusText()}
      </div>
      
      {showDetails && !isOutOfStock && (
        <div className="mt-2 text-xs text-gray-600">
          <p>Available: {available}</p>
          {policy === 'DENY' && onHand !== available && (
            <p>On Hand: {onHand}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Low stock alert component
export function LowStockAlert({ products = [], threshold = 5 }) {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLowStock = async () => {
      if (!products.length) return;
      
      try {
        setLoading(true);
        const lowStock = [];
        
        for (const product of products) {
          for (const variant of product.variants?.nodes || []) {
            const inventory = await getInventoryLevels(variant.id);
            if (inventory && inventory.available <= threshold && inventory.available > 0) {
              lowStock.push({
                product,
                variant,
                inventory
              });
            }
          }
        }
        
        setLowStockProducts(lowStock);
      } catch (error) {
        console.error('Error checking low stock:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLowStock();
  }, [products, threshold]);

  if (loading || lowStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-3">
        <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="text-lg font-semibold text-orange-800">Low Stock Alert</h3>
      </div>
      
      <div className="space-y-2">
        {lowStockProducts.map((item, index) => (
          <div key={index} className="flex items-center justify-between bg-white rounded p-3 border border-orange-200">
            <div>
              <p className="font-medium text-gray-900">{item.product.title}</p>
              {item.variant.title !== 'Default Title' && (
                <p className="text-sm text-gray-600">{item.variant.title}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-orange-600 font-semibold">{item.inventory.available} left</p>
              <p className="text-xs text-gray-500">Threshold: {threshold}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Real-time inventory tracker
export function InventoryTracker({ productId, variantId, onStockChange }) {
  const [currentStock, setCurrentStock] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const updateStock = useCallback(async () => {
    if (!variantId) return;
    
    try {
      const inventory = await getInventoryLevels(variantId);
      if (inventory) {
        const oldStock = currentStock;
        setCurrentStock(inventory.available);
        setLastUpdate(new Date());
        
        // Notify parent component of stock changes
        if (onStockChange && oldStock !== null && oldStock !== inventory.available) {
          onStockChange({
            productId,
            variantId,
            oldStock,
            newStock: inventory.available,
            change: inventory.available - oldStock
          });
        }
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  }, [variantId, currentStock, productId, onStockChange]);

  useEffect(() => {
    // Initial stock fetch
    updateStock();

    // Set up real-time polling (in production, this would use webhooks)
    const interval = setInterval(updateStock, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [updateStock]);

  // Real-time updates using WebSocket (if available)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'WebSocket' in window) {
      const wsUrl = process.env.NEXT_PUBLIC_INVENTORY_WS_URL;
      if (wsUrl && variantId) {
        const ws = new WebSocket(`${wsUrl}?variant=${variantId}`);
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'inventory_update' && data.variantId === variantId) {
              setCurrentStock(data.available);
              setLastUpdate(new Date());
              
              if (onStockChange) {
                onStockChange({
                  productId,
                  variantId,
                  oldStock: currentStock,
                  newStock: data.available,
                  change: data.available - (currentStock || 0)
                });
              }
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        return () => ws.close();
      }
    }
  }, [variantId, productId, currentStock, onStockChange]);

  return (
    <div className="text-xs text-gray-500">
      {currentStock !== null && (
        <p>Stock: {currentStock}</p>
      )}
      {lastUpdate && (
        <p>Updated: {lastUpdate.toLocaleTimeString()}</p>
      )}
    </div>
  );
}

// Inventory adjustment component (for admin use)
export function InventoryAdjustment({ variantId, currentStock, onUpdate }) {
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdjustment = async (e) => {
    e.preventDefault();
    if (adjustment === 0) return;

    try {
      setLoading(true);
      const newStock = currentStock + adjustment;
      
      const result = await updateInventoryLevel(variantId, {
        available: newStock,
        reason: reason || 'Manual adjustment'
      });

      if (result.success) {
        onUpdate?.(newStock);
        setAdjustment(0);
        setReason('');
        
        // Show success message
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('inventory-updated', {
            detail: {
              variantId,
              oldStock: currentStock,
              newStock,
              adjustment,
              reason
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error adjusting inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAdjustment} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-3">Adjust Inventory</h4>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Stock
          </label>
          <input
            type="number"
            value={currentStock}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adjustment
          </label>
          <input
            type="number"
            value={adjustment}
            onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
            placeholder="±0"
          />
        </div>
      </div>
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
          placeholder="Optional reason for adjustment"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          New Stock: <span className="font-medium">{currentStock + adjustment}</span>
        </div>
        
        <button
          type="submit"
          disabled={adjustment === 0 || loading}
          className="px-4 py-2 bg-burgundy text-white rounded-md hover:bg-gold hover:text-charcoal transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update Stock'}
        </button>
      </div>
    </form>
  );
}

// Stock notification component
export function StockNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleInventoryUpdate = (event) => {
      const { detail } = event;
      const notification = {
        id: Date.now(),
        type: detail.adjustment > 0 ? 'increase' : 'decrease',
        message: `Stock ${detail.adjustment > 0 ? 'increased' : 'decreased'} by ${Math.abs(detail.adjustment)}`,
        timestamp: new Date(),
        ...detail
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 notifications
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    };

    window.addEventListener('inventory-updated', handleInventoryUpdate);
    return () => window.removeEventListener('inventory-updated', handleInventoryUpdate);
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-3 rounded-lg shadow-lg border max-w-sm ${
            notification.type === 'increase'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-orange-50 border-orange-200 text-orange-800'
          }`}
        >
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              notification.type === 'increase' ? 'bg-green-400' : 'bg-orange-400'
            }`}></div>
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          {notification.reason && (
            <p className="text-xs mt-1 opacity-75">{notification.reason}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default InventoryStatus;