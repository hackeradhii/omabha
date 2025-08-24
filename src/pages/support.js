import { useState } from 'react';
import { ContactForm, FAQ, LiveChatWidget } from '@/components/CustomerSupport';
import SEO from '@/components/SEO';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('contact');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleTicketSubmit = (ticket) => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  const tabs = [
    {
      id: 'contact',
      label: 'Contact Us',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'help',
      label: 'Help Center',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    }
  ];

  return (
    <>
      <SEO
        title="Customer Support - Omabha Store"
        description="Get help with your order, returns, sizing, and more. Contact our customer support team or browse our FAQ section."
        keywords="customer support, help, contact, FAQ, returns, sizing guide, order help"
      />
      
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-serif text-charcoal mb-4">
              How Can We Help You?
            </h1>
            <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">
              We're here to assist you with any questions about our traditional Indian clothing collection
            </p>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-800 font-medium">
                  Your support request has been submitted successfully! We'll get back to you within 24 hours.
                </p>
              </div>
            </div>
          )}

          {/* Quick Help Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-burgundy rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Your Order</h3>
              <p className="text-gray-600 mb-4">Check the status of your recent orders and shipping updates</p>
              <a
                href="/orders"
                className="inline-flex items-center text-burgundy hover:text-gold font-medium"
              >
                Track Orders
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-burgundy rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Returns & Exchanges</h3>
              <p className="text-gray-600 mb-4">Easy returns within 30 days for a perfect fit</p>
              <button
                onClick={() => setActiveTab('faq')}
                className="inline-flex items-center text-burgundy hover:text-gold font-medium"
              >
                Return Policy
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-burgundy rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v3M7 4H5a1 1 0 00-1 1v10a1 1 0 001 1h2M7 4h10M5 16h14" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Size Guide</h3>
              <p className="text-gray-600 mb-4">Find your perfect fit with our detailed size charts</p>
              <button
                onClick={() => setActiveTab('help')}
                className="inline-flex items-center text-burgundy hover:text-gold font-medium"
              >
                Size Guide
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-burgundy text-white border-b-2 border-burgundy'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'contact' && (
                <ContactForm onSubmit={handleTicketSubmit} />
              )}

              {activeTab === 'faq' && <FAQ />}

              {activeTab === 'help' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Help Center</h2>
                    
                    {/* Popular Help Topics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Size Guide</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>XS</span>
                            <span>32-34 inches</span>
                          </div>
                          <div className="flex justify-between">
                            <span>S</span>
                            <span>34-36 inches</span>
                          </div>
                          <div className="flex justify-between">
                            <span>M</span>
                            <span>36-38 inches</span>
                          </div>
                          <div className="flex justify-between">
                            <span>L</span>
                            <span>38-40 inches</span>
                          </div>
                          <div className="flex justify-between">
                            <span>XL</span>
                            <span>40-42 inches</span>
                          </div>
                          <div className="flex justify-between">
                            <span>XXL</span>
                            <span>42-44 inches</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Care Instructions</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Dry clean only for silk sarees</li>
                          <li>• Hand wash cotton items in cold water</li>
                          <li>• Iron on low heat settings</li>
                          <li>• Store in cool, dry place</li>
                          <li>• Avoid direct sunlight for storage</li>
                          <li>• Use padded hangers for delicate items</li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Free shipping on orders above ₹1999</li>
                          <li>• Standard delivery: 3-5 business days</li>
                          <li>• Express delivery: 1-2 business days</li>
                          <li>• Cash on delivery available</li>
                          <li>• Track your order in real-time</li>
                          <li>• Secure packaging for all items</li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Policy</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• 30-day return window</li>
                          <li>• Items must be unused and with tags</li>
                          <li>• Original packaging required</li>
                          <li>• Free returns for defective items</li>
                          <li>• Exchange available for size issues</li>
                          <li>• Refund processed within 5-7 days</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Chat Widget */}
        <LiveChatWidget />
      </div>
    </>
  );
}