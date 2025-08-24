import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useCustomer } from '@/context/CustomerContext';
import { 
  getProducts, 
  getOrders, 
  getCustomers,
  getInventoryLevels,
  getLowStockProducts 
} from '@/lib/shopify';
import SEO from '@/components/SEO';

// Dashboard Stats Card Component
function StatsCard({ title, value, change, changeType, icon, link }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
            changeType === 'positive' ? 'bg-green-500' : 
            changeType === 'negative' ? 'bg-red-500' : 'bg-blue-500'
          }`}>
            {icon}
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
      {change && (
        <div className="mt-4">
          <div className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${
            changeType === 'positive' ? 'bg-green-100 text-green-800' :
            changeType === 'negative' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {changeType === 'positive' && (
              <svg className="flex-shrink-0 self-center h-4 w-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {changeType === 'negative' && (
              <svg className="flex-shrink-0 self-center h-4 w-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <span>{change}</span>
          </div>
        </div>
      )}
      {link && (
        <div className="mt-4">
          <Link href={link} className="text-sm text-burgundy hover:text-gold font-medium">
            View details →
          </Link>
        </div>
      )}
    </div>
  );
}

// Quick Actions Component
function QuickActions() {
  const actions = [
    {
      title: 'Add New Product',
      description: 'Create a new product listing',
      href: '/admin/products/new',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'bg-green-500'
    },
    {
      title: 'Process Orders',
      description: 'View and manage pending orders',
      href: '/admin/orders',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      color: 'bg-blue-500'
    },
    {
      title: 'Inventory Check',
      description: 'Monitor stock levels and alerts',
      href: '/admin/inventory',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'bg-orange-500'
    },
    {
      title: 'Customer Support',
      description: 'Handle customer inquiries',
      href: '/admin/customers',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="group relative rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className={`flex-shrink-0 w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-burgundy">
                  {action.title}
                </h4>
                <p className="text-sm text-gray-500">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Recent Activity Component
function RecentActivity({ orders, customers }) {
  const activities = [
    ...orders.slice(0, 3).map(order => ({
      type: 'order',
      title: `New order #${order.orderNumber || order.id.slice(-6)}`,
      description: `${order.totalPrice?.amount ? '₹' + order.totalPrice.amount : 'Processing'} • ${order.lineItems?.edges?.length || 0} items`,
      time: new Date(order.createdAt).toLocaleDateString(),
      icon: (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    })),
    ...customers.slice(0, 2).map(customer => ({
      type: 'customer',
      title: `New customer registration`,
      description: `${customer.firstName} ${customer.lastName}`,
      time: new Date(customer.createdAt).toLocaleDateString(),
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }))
  ].slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.description}</p>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { customer, isLoggedIn } = useCustomer();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    products: [],
    orders: [],
    customers: [],
    lowStockItems: [],
    stats: {
      totalProducts: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalRevenue: 0,
      lowStockCount: 0
    }
  });

  useEffect(() => {
    // Check if user is admin (in a real app, this would be a proper role check)
    if (!isLoggedIn || !customer) {
      router.push('/');
      return;
    }

    // For demo purposes, we'll allow all logged-in users to access admin
    // In production, you'd check for admin role
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data
        const [productsResult, ordersResult, customersResult, lowStockResult] = await Promise.all([
          getProducts({ first: 50 }),
          getOrders({ first: 20 }),
          getCustomers({ first: 50 }),
          getLowStockProducts(10)
        ]);

        const products = productsResult.products || [];
        const orders = ordersResult.orders || [];
        const customers = customersResult.customers || [];
        const lowStockItems = lowStockResult || [];

        // Calculate stats
        const totalRevenue = orders.reduce((sum, order) => {
          return sum + (parseFloat(order.totalPrice?.amount || 0));
        }, 0);

        setDashboardData({
          products,
          orders,
          customers,
          lowStockItems,
          stats: {
            totalProducts: products.length,
            totalOrders: orders.length,
            totalCustomers: customers.length,
            totalRevenue,
            lowStockCount: lowStockItems.length
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isLoggedIn, customer, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Admin Dashboard - Omabha Store"
        description="Manage your store products, orders, customers and analytics"
        noIndex={true}
      />
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {customer?.firstName || 'Admin'}</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Products"
              value={dashboardData.stats.totalProducts}
              change="+12% from last month"
              changeType="positive"
              link="/admin/products"
              icon={
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
            />
            <StatsCard
              title="Total Orders"
              value={dashboardData.stats.totalOrders}
              change="+5% from last month"
              changeType="positive"
              link="/admin/orders"
              icon={
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }
            />
            <StatsCard
              title="Total Revenue"
              value={`₹${dashboardData.stats.totalRevenue.toFixed(2)}`}
              change="+8% from last month"
              changeType="positive"
              icon={
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
            />
            <StatsCard
              title="Low Stock Items"
              value={dashboardData.stats.lowStockCount}
              change={dashboardData.stats.lowStockCount > 0 ? "Needs attention" : "All good"}
              changeType={dashboardData.stats.lowStockCount > 0 ? "negative" : "positive"}
              link="/admin/inventory"
              icon={
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              }
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Quick Actions */}
            <div className="lg:col-span-1">
              <QuickActions />
            </div>

            {/* Right Column - Recent Activity */}
            <div className="lg:col-span-2">
              <RecentActivity 
                orders={dashboardData.orders} 
                customers={dashboardData.customers} 
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Link
              href="/admin/products"
              className="group bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-burgundy rounded-lg flex items-center justify-center text-white group-hover:bg-gold group-hover:text-charcoal transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-burgundy">
                    Product Management
                  </h3>
                  <p className="text-sm text-gray-500">Add, edit, and manage products</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/orders"
              className="group bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-burgundy rounded-lg flex items-center justify-center text-white group-hover:bg-gold group-hover:text-charcoal transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-burgundy">
                    Order Management
                  </h3>
                  <p className="text-sm text-gray-500">Process and track orders</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/customers"
              className="group bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-burgundy rounded-lg flex items-center justify-center text-white group-hover:bg-gold group-hover:text-charcoal transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-burgundy">
                    Customer Management
                  </h3>
                  <p className="text-sm text-gray-500">Manage customer accounts</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/analytics"
              className="group bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-burgundy rounded-lg flex items-center justify-center text-white group-hover:bg-gold group-hover:text-charcoal transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-burgundy">
                    Analytics Dashboard
                  </h3>
                  <p className="text-sm text-gray-500">View performance metrics</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/security"
              className="group bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-burgundy rounded-lg flex items-center justify-center text-white group-hover:bg-gold group-hover:text-charcoal transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-burgundy">
                    Security Monitoring
                  </h3>
                  <p className="text-sm text-gray-500">Monitor security status</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}