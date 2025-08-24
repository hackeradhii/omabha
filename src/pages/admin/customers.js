import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useCustomer } from '@/context/CustomerContext';
import { getCustomers, getCustomerOrders, updateCustomer } from '@/lib/shopify';
import { formatCurrency } from '@/lib/payment';
import SEO from '@/components/SEO';

function CustomerDetailsModal({ customer, isOpen, onClose, onUpdate }) {
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    tags: '',
    note: ''
  });

  useEffect(() => {
    if (customer && isOpen) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        tags: customer.tags?.join(', ') || '',
        note: customer.note || ''
      });
      fetchCustomerOrders();
    }
  }, [customer, isOpen]);

  const fetchCustomerOrders = async () => {
    if (!customer) return;
    setLoading(true);
    try {
      const orders = await getCustomerOrders(customer.id);
      setCustomerOrders(orders || []);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateCustomer = async () => {
    try {
      const updateData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };
      await updateCustomer(customer.id, updateData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer. Please try again.');
    }
  };

  if (!isOpen || !customer) return null;

  const totalSpent = customerOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice?.amount || 0), 0);
  const avgOrderValue = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {customer.firstName} {customer.lastName}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Customer Details</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="Separate tags with commas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
                    />
                  </div>
                  <button
                    onClick={handleUpdateCustomer}
                    className="w-full px-4 py-2 bg-burgundy text-white rounded-md hover:bg-gold hover:text-charcoal transition-colors"
                  >
                    Update Customer
                  </button>
                </div>
              </div>

              {/* Customer Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Customer Stats</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-burgundy">{customerOrders.length}</p>
                    <p className="text-gray-600">Total Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-burgundy">{formatCurrency(totalSpent)}</p>
                    <p className="text-gray-600">Total Spent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-700">{formatCurrency(avgOrderValue)}</p>
                    <p className="text-gray-600">Avg Order Value</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-700">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">Member Since</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Orders */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Order History</h3>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : customerOrders.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {customerOrders.map((order) => (
                      <div key={order.id} className="bg-white rounded p-3 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">#{order.orderNumber || order.id.slice(-6)}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-600">
                              {order.lineItems?.edges?.length || 0} items
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">
                              {order.totalPrice?.amount ? formatCurrency(parseFloat(order.totalPrice.amount)) : 'N/A'}
                            </p>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              order.fulfillmentStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.fulfillmentStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.fulfillmentStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.fulfillmentStatus || order.status || 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No orders found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCustomers() {
  const router = useRouter();
  const { customer, isLoggedIn } = useCustomer();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_desc');

  useEffect(() => {
    if (!isLoggedIn || !customer) {
      router.push('/');
      return;
    }
    fetchCustomers();
  }, [isLoggedIn, customer, router]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const result = await getCustomers({ first: 100 });
      setCustomers(result.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  const handleUpdateCustomer = async () => {
    await fetchCustomers();
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.firstName?.toLowerCase().includes(searchLower) ||
      customer.lastName?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(searchTerm)
    );
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case 'name_asc':
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case 'name_desc':
        return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
      case 'email_asc':
        return a.email.localeCompare(b.email);
      case 'email_desc':
        return b.email.localeCompare(a.email);
      case 'orders_desc':
        return (b.numberOfOrders || 0) - (a.numberOfOrders || 0);
      case 'orders_asc':
        return (a.numberOfOrders || 0) - (b.numberOfOrders || 0);
      case 'created_asc':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'created_desc':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const stats = {
    total: customers.length,
    newThisMonth: customers.filter(c => {
      const createdDate = new Date(c.createdAt);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return createdDate > monthAgo;
    }).length,
    withOrders: customers.filter(c => (c.numberOfOrders || 0) > 0).length,
    totalSpent: customers.reduce((sum, c) => sum + parseFloat(c.totalSpent?.amount || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-6 h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Customer Management - Admin Dashboard" description="Manage your store customers" noIndex={true} />
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
              <p className="text-gray-600 mt-2">{customers.length} total customers</p>
            </div>
            <Link href="/admin" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Customers</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.newThisMonth}</p>
              <p className="text-sm text-gray-600">New This Month</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.withOrders}</p>
              <p className="text-sm text-gray-600">With Orders</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-lg font-bold text-burgundy">{formatCurrency(stats.totalSpent)}</p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-burgundy focus:border-burgundy"
              >
                <option value="created_desc">Newest First</option>
                <option value="created_asc">Oldest First</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="email_asc">Email A-Z</option>
                <option value="email_desc">Email Z-A</option>
                <option value="orders_desc">Most Orders</option>
                <option value="orders_asc">Least Orders</option>
              </select>
              <button
                onClick={() => { setSearchTerm(''); setSortBy('created_desc'); }}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-burgundy rounded-full flex items-center justify-center text-white font-medium">
                            {customer.firstName?.[0]}{customer.lastName?.[0]}
                          </div>
                          <div className="ml-4">
                            <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                            {customer.phone && <p className="text-gray-500 text-xs">{customer.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{customer.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{customer.numberOfOrders || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {customer.totalSpent?.amount ? formatCurrency(parseFloat(customer.totalSpent.amount)) : '₹0.00'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(customer)}
                          className="text-burgundy hover:text-gold"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedCustomers.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Customers Found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'No customers have registered yet.'}
                </p>
              </div>
            )}
          </div>
        </div>

        <CustomerDetailsModal
          customer={selectedCustomer}
          isOpen={showCustomerDetails}
          onClose={() => setShowCustomerDetails(false)}
          onUpdate={handleUpdateCustomer}
        />
      </div>
    </>
  );
}