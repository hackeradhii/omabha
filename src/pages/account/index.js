import { useEffect, useState } from 'react';
import { useCustomer } from '@/context/CustomerContext';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AccountPage() {
  const { customer, isLoading, logout } = useCustomer();
  const [activeTab, setActiveTab] = useState('profile');
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !customer) {
      router.push('/');
    }
  }, [customer, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy mx-auto mb-4"></div>
          <p className="text-charcoal/70">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: 'user' },
    { id: 'orders', name: 'Orders', icon: 'shopping-bag' },
    { id: 'addresses', name: 'Addresses', icon: 'location' },
    { id: 'wishlist', name: 'Wishlist', icon: 'heart' },
  ];

  const getIconSVG = (iconName) => {
    const icons = {
      user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
      'shopping-bag': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
      location: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />,
      heart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
    };
    return icons[iconName];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-ivory to-gold/5 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-burgundy to-gold rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {customer.firstName?.[0]?.toUpperCase()}{customer.lastName?.[0]?.toUpperCase()}
            </span>
          </div>
          <h1 className="text-4xl font-bold font-serif text-charcoal mb-2">
            Welcome back, {customer.firstName}!
          </h1>
          <p className="text-charcoal/70">
            Manage your account, orders, and preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 mb-8 shadow-lg border border-gold/20">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-burgundy to-burgundy/90 text-white shadow-lg'
                    : 'text-charcoal hover:bg-gold/10 hover:text-gold'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {getIconSVG(tab.icon)}
                </svg>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gold/20">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold font-serif text-charcoal mb-6">Profile Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">First Name</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-xl border">
                      {customer.firstName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Last Name</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-xl border">
                      {customer.lastName}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Email</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-xl border">
                      {customer.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Phone</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-xl border">
                      {customer.phone || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-serif text-charcoal">Order History</h2>
                <Link 
                  href="/orders"
                  className="px-4 py-2 bg-burgundy text-white rounded-xl hover:bg-gold hover:text-charcoal transition-colors text-sm"
                >
                  View All Orders
                </Link>
              </div>
              
              {customer.orders?.edges?.length > 0 ? (
                <div className="space-y-4">
                  {customer.orders.edges.slice(0, 3).map(({ node: order }) => (
                    <div key={order.id} className="bg-white rounded-xl p-6 border border-gold/20 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-charcoal">Order #{order.orderNumber}</h3>
                          <p className="text-sm text-charcoal/70">
                            {new Date(order.processedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-burgundy text-lg">
                            ₹{parseFloat(order.totalPrice.amount).toFixed(2)}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.fulfillmentStatus === 'FULFILLED' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.fulfillmentStatus || 'Processing'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {customer.orders.edges.length > 3 && (
                    <div className="text-center pt-4">
                      <Link 
                        href="/orders"
                        className="text-burgundy hover:text-gold transition-colors text-sm font-medium"
                      >
                        View {customer.orders.edges.length - 3} more orders
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-charcoal/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <h3 className="text-lg font-medium text-charcoal mb-2">No orders yet</h3>
                  <p className="text-charcoal/70 mb-6">Start shopping to see your orders here</p>
                  <div className="space-y-3">
                    <Link href="/" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-burgundy to-burgundy/90 text-white rounded-xl hover:shadow-lg transition-all duration-300">
                      Start Shopping
                    </Link>
                    <div>
                      <Link 
                        href="/orders"
                        className="text-sm text-burgundy hover:text-gold transition-colors"
                      >
                        View Order History
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h2 className="text-2xl font-bold font-serif text-charcoal mb-6">Saved Addresses</h2>
              {customer.addresses?.edges?.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {customer.addresses.edges.map(({ node: address }) => (
                    <div key={address.id} className="bg-white rounded-xl p-6 border border-gold/20 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-charcoal">
                          {address.firstName} {address.lastName}
                        </h3>
                        {customer.defaultAddress?.id === address.id && (
                          <span className="px-3 py-1 bg-burgundy text-white text-xs font-medium rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-charcoal/70 space-y-1">
                        <p>{address.address1}</p>
                        {address.address2 && <p>{address.address2}</p>}
                        <p>{address.city}, {address.province} {address.zip}</p>
                        <p>{address.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-charcoal/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-charcoal mb-2">No addresses saved</h3>
                  <p className="text-charcoal/70">Add an address during checkout or contact support</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-serif text-charcoal">My Wishlist</h2>
                <Link 
                  href="/wishlist"
                  className="px-4 py-2 bg-burgundy text-white rounded-xl hover:bg-gold hover:text-charcoal transition-colors text-sm"
                >
                  View Full Wishlist
                </Link>
              </div>
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-charcoal/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h3 className="text-lg font-medium text-charcoal mb-2">Manage Your Wishlist</h3>
                <p className="text-charcoal/70 mb-6">Save items you love for later and never lose track of your favorites</p>
                <Link 
                  href="/wishlist"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-burgundy to-burgundy/90 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  Go to Wishlist
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Logout Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-charcoal/10 text-charcoal hover:bg-charcoal hover:text-white rounded-xl transition-all duration-300"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}