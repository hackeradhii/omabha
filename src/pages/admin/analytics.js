import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useCustomer } from '@/context/CustomerContext';
import { 
  getStoreAnalytics, 
  getSearchAnalytics, 
  getCartAnalytics,
  generateAnalyticsReport
} from '@/lib/shopify';
import { formatCurrency } from '@/lib/payment';
import SEO from '@/components/SEO';

function MetricCard({ title, value, change, icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${
              change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {change} from last period
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ChartPlaceholder({ title, description }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const router = useRouter();
  const { customer, isLoggedIn } = useCustomer();
  const [analytics, setAnalytics] = useState(null);
  const [searchAnalytics, setSearchAnalytics] = useState(null);
  const [cartAnalytics, setCartAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isLoggedIn || !customer) {
      router.push('/');
      return;
    }
    fetchAnalytics();
  }, [isLoggedIn, customer, router, selectedTimeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [storeData, searchData, cartData] = await Promise.all([
        getStoreAnalytics(selectedTimeRange),
        getSearchAnalytics(selectedTimeRange),
        getCartAnalytics(selectedTimeRange)
      ]);
      
      setAnalytics(storeData);
      setSearchAnalytics(searchData);
      setCartAnalytics(cartData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (reportType) => {
    try {
      const report = await generateAnalyticsReport(reportType, selectedTimeRange);
      if (report) {
        // Create and download JSON report
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportType}_report_${selectedTimeRange}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'traffic', label: 'Traffic' },
    { id: 'products', label: 'Products' },
    { id: 'customers', label: 'Customers' },
    { id: 'search', label: 'Search' },
    { id: 'conversion', label: 'Conversion' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Analytics Dashboard - Admin" description="Store analytics and performance metrics" noIndex={true} />
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Store performance and customer insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <Link href="/admin" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                ← Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-burgundy text-white border-b-2 border-burgundy'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && analytics && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Revenue"
                  value={formatCurrency(parseFloat(analytics.overview.totalRevenue))}
                  change="+12.5%"
                  color="green"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  }
                />
                <MetricCard
                  title="Total Orders"
                  value={analytics.overview.totalOrders.toLocaleString()}
                  change="+8.3%"
                  color="blue"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  }
                />
                <MetricCard
                  title="Conversion Rate"
                  value={`${analytics.overview.conversionRate}%`}
                  change="+2.1%"
                  color="purple"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  }
                />
                <MetricCard
                  title="Avg Order Value"
                  value={formatCurrency(parseFloat(analytics.overview.averageOrderValue))}
                  change="+5.7%"
                  color="orange"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartPlaceholder 
                  title="Revenue Trend" 
                  description="Daily revenue over time"
                />
                <ChartPlaceholder 
                  title="Traffic Sources" 
                  description="Breakdown of visitor sources"
                />
              </div>

              {/* Top Products & Locations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
                  <div className="space-y-3">
                    {analytics.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sales} sales</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatCurrency(product.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h3>
                  <div className="space-y-3">
                    {analytics.topLocations.map((location, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{location.city}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-burgundy h-2 rounded-full"
                              style={{ width: `${location.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{location.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Traffic Tab */}
          {activeTab === 'traffic' && analytics && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                  title="Sessions"
                  value={analytics.traffic.sessions.toLocaleString()}
                  change="+15.2%"
                  color="blue"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  }
                />
                <MetricCard
                  title="Page Views"
                  value={analytics.traffic.pageViews.toLocaleString()}
                  change="+10.8%"
                  color="green"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                />
                <MetricCard
                  title="Bounce Rate"
                  value={`${analytics.traffic.bounceRate}%`}
                  change="-3.2%"
                  color="orange"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  }
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartPlaceholder 
                  title="Traffic Over Time" 
                  description="Sessions and page views trend"
                />
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-burgundy rounded-full"></div>
                        <span className="text-sm">Mobile</span>
                      </div>
                      <span className="text-sm font-medium">{analytics.deviceBreakdown.mobile}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gold rounded-full"></div>
                        <span className="text-sm">Desktop</span>
                      </div>
                      <span className="text-sm font-medium">{analytics.deviceBreakdown.desktop}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-sm">Tablet</span>
                      </div>
                      <span className="text-sm font-medium">{analytics.deviceBreakdown.tablet}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && searchAnalytics && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Searches"
                  value={searchAnalytics.totalSearches.toLocaleString()}
                  color="blue"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
                <MetricCard
                  title="Unique Terms"
                  value={searchAnalytics.uniqueTerms.toLocaleString()}
                  color="green"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  }
                />
                <MetricCard
                  title="Avg Results"
                  value={searchAnalytics.avgResultsPerSearch}
                  color="purple"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                />
                <MetricCard
                  title="No Results"
                  value={searchAnalytics.noResultsCount.toLocaleString()}
                  color="red"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Search Terms</h3>
                  <div className="space-y-3">
                    {searchAnalytics.topSearchTerms.slice(0, 10).map((term, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{term.term}</span>
                        <span className="text-sm font-medium">{term.count} searches</span>
                      </div>
                    ))}
                  </div>
                </div>

                <ChartPlaceholder 
                  title="Search Trends" 
                  description="Search volume over time"
                />
              </div>
            </div>
          )}

          {/* Conversion Tab */}
          {activeTab === 'conversion' && cartAnalytics && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                  title="Add to Carts"
                  value={cartAnalytics.totalAddToCarts.toLocaleString()}
                  color="blue"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5m6 1.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6-3a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    </svg>
                  }
                />
                <MetricCard
                  title="Checkouts"
                  value={cartAnalytics.totalCheckouts.toLocaleString()}
                  color="green"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <MetricCard
                  title="Abandon Rate"
                  value={`${cartAnalytics.cartAbandonmentRate}%`}
                  color="red"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  }
                />
                <MetricCard
                  title="Avg Cart Value"
                  value={formatCurrency(cartAnalytics.avgCartValue)}
                  color="purple"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  }
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartPlaceholder 
                  title="Conversion Funnel" 
                  description="Step-by-step conversion rates"
                />
                <ChartPlaceholder 
                  title="Cart Abandonment Timeline" 
                  description="When customers abandon carts"
                />
              </div>
            </div>
          )}

          {/* Export Actions */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleExportReport('overview')}
                className="px-4 py-2 bg-burgundy text-white rounded-md hover:bg-gold hover:text-charcoal transition-colors"
              >
                Export Overview
              </button>
              <button
                onClick={() => handleExportReport('products')}
                className="px-4 py-2 bg-burgundy text-white rounded-md hover:bg-gold hover:text-charcoal transition-colors"
              >
                Export Product Analytics
              </button>
              <button
                onClick={() => handleExportReport('customers')}
                className="px-4 py-2 bg-burgundy text-white rounded-md hover:bg-gold hover:text-charcoal transition-colors"
              >
                Export Customer Analytics
              </button>
              <button
                onClick={() => handleExportReport('search')}
                className="px-4 py-2 bg-burgundy text-white rounded-md hover:bg-gold hover:text-charcoal transition-colors"
              >
                Export Search Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}