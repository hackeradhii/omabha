import { useState, useEffect } from 'react';
import { privacyManager, auditLogger } from '@/lib/security';

// Cookie Consent Banner
export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    // Check if user has already consented
    if (!privacyManager.hasConsent()) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    setPreferences(allConsent);
    privacyManager.setConsent(true);
    auditLogger.log('cookie_consent_all_accepted', allConsent);
    
    // Update Google Analytics consent
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted'
      });
    }
    
    setShowBanner(false);
  };

  const handleAcceptSelected = () => {
    privacyManager.setConsent(true);
    auditLogger.log('cookie_consent_selected', preferences);
    
    // Update Google Analytics consent based on preferences
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': preferences.analytics ? 'granted' : 'denied',
        'ad_storage': preferences.marketing ? 'granted' : 'denied'
      });
    }
    
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    setPreferences(minimalConsent);
    privacyManager.setConsent(false);
    auditLogger.log('cookie_consent_rejected', minimalConsent);
    
    // Update Google Analytics consent
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied'
      });
    }
    
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-burgundy shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              We Value Your Privacy
            </h3>
            <p className="text-sm text-gray-600 max-w-2xl">
              We use cookies to enhance your shopping experience, provide personalized recommendations, 
              and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>
            
            {showDetails && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Necessary Cookies</label>
                    <p className="text-xs text-gray-500">Required for basic site functionality</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.necessary}
                    disabled
                    className="rounded border-gray-300 text-burgundy focus:ring-burgundy"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Analytics Cookies</label>
                    <p className="text-xs text-gray-500">Help us understand how you use our site</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                    className="rounded border-gray-300 text-burgundy focus:ring-burgundy"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Marketing Cookies</label>
                    <p className="text-xs text-gray-500">Used to show relevant advertisements</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                    className="rounded border-gray-300 text-burgundy focus:ring-burgundy"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Functional Cookies</label>
                    <p className="text-xs text-gray-500">Enable enhanced features and personalization</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) => setPreferences(prev => ({ ...prev, functional: e.target.checked }))}
                    className="rounded border-gray-300 text-burgundy focus:ring-burgundy"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            {!showDetails && (
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Customize
              </button>
            )}
            
            {showDetails && (
              <>
                <button
                  onClick={handleAcceptSelected}
                  className="px-4 py-2 text-sm bg-burgundy text-white rounded-md hover:bg-gold hover:text-charcoal transition-colors"
                >
                  Accept Selected
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Reject All
                </button>
              </>
            )}
            
            <button
              onClick={handleAcceptAll}
              className="px-6 py-2 text-sm bg-burgundy text-white rounded-md hover:bg-gold hover:text-charcoal transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Privacy Settings Modal
export function PrivacySettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const handleExportData = () => {
    setLoading(true);
    auditLogger.log('data_export_requested');
    privacyManager.exportUserData();
    setTimeout(() => setLoading(false), 2000);
  };

  const handleDeleteData = () => {
    if (window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      auditLogger.log('data_deletion_requested');
      privacyManager.clearAllUserData();
      alert('Your data has been deleted. You will be redirected to the home page.');
      window.location.href = '/';
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'cookies', label: 'Cookie Settings' },
    { id: 'rights', label: 'Your Rights' },
    { id: 'policy', label: 'Privacy Policy' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Privacy Center</h2>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-burgundy text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Your Privacy Matters</h4>
                    <p className="text-sm text-blue-800">
                      We are committed to protecting your privacy and ensuring transparency about how we collect, 
                      use, and share your personal information.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Data We Collect</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Account information (name, email)</li>
                        <li>• Shopping preferences</li>
                        <li>• Order history</li>
                        <li>• Website usage data</li>
                      </ul>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">How We Use It</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Personalize your experience</li>
                        <li>• Process your orders</li>
                        <li>• Improve our services</li>
                        <li>• Send relevant updates</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Cookie Settings Tab */}
              {activeTab === 'cookies' && (
                <div className="space-y-6">
                  <p className="text-gray-600">
                    Manage your cookie preferences below. Changes will take effect immediately.
                  </p>
                  
                  <CookieConsentBanner />
                </div>
              )}

              {/* Your Rights Tab */}
              {activeTab === 'rights' && (
                <div className="space-y-6">
                  <p className="text-gray-600">
                    Under GDPR and other privacy regulations, you have several rights regarding your personal data:
                  </p>

                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Right to Access</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Request a copy of the personal data we hold about you.
                      </p>
                      <button
                        onClick={handleExportData}
                        disabled={loading}
                        className="px-4 py-2 bg-burgundy text-white rounded-md hover:bg-gold hover:text-charcoal transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Preparing...' : 'Export My Data'}
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Right to Erasure</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Request deletion of your personal data (right to be forgotten).
                      </p>
                      <button
                        onClick={handleDeleteData}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        Delete My Data
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Right to Rectification</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Update or correct your personal information.
                      </p>
                      <a
                        href="/account"
                        className="inline-block px-4 py-2 bg-burgundy text-white rounded-md hover:bg-gold hover:text-charcoal transition-colors"
                      >
                        Edit Profile
                      </a>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Right to Object</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Object to processing of your data for marketing purposes.
                      </p>
                      <a
                        href="/support"
                        className="inline-block px-4 py-2 bg-burgundy text-white rounded-md hover:bg-gold hover:text-charcoal transition-colors"
                      >
                        Contact Support
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Policy Tab */}
              {activeTab === 'policy' && (
                <div className="space-y-6 max-h-96 overflow-y-auto">
                  <div className="prose prose-sm">
                    <h4>Privacy Policy for Omabha Store</h4>
                    <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
                    
                    <h5>1. Information We Collect</h5>
                    <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>
                    
                    <h5>2. How We Use Your Information</h5>
                    <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
                    
                    <h5>3. Information Sharing</h5>
                    <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
                    
                    <h5>4. Data Security</h5>
                    <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                    
                    <h5>5. Your Rights</h5>
                    <p>You have the right to access, update, or delete your personal information. You may also opt-out of certain communications from us.</p>
                    
                    <h5>6. Contact Us</h5>
                    <p>If you have any questions about this Privacy Policy, please contact us at privacy@omabhastore.com.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Security Dashboard for Admin
export function SecurityDashboard() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [securityMetrics, setSecurityMetrics] = useState({
    totalSessions: 0,
    failedLogins: 0,
    dataExports: 0,
    gdprRequests: 0
  });

  useEffect(() => {
    // Load audit logs
    if (typeof window !== 'undefined') {
      const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      setAuditLogs(logs.slice(-50)); // Show last 50 logs
      
      // Calculate metrics
      const metrics = {
        totalSessions: logs.filter(log => log.action === 'session_created').length,
        failedLogins: logs.filter(log => log.action === 'login_failed').length,
        dataExports: logs.filter(log => log.action === 'data_export_requested').length,
        gdprRequests: logs.filter(log => log.action === 'data_deletion_requested').length
      };
      setSecurityMetrics(metrics);
    }
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Security Dashboard</h2>
      
      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
          <p className="text-2xl font-bold text-gray-900">{securityMetrics.totalSessions}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Failed Logins</h3>
          <p className="text-2xl font-bold text-red-600">{securityMetrics.failedLogins}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Data Exports</h3>
          <p className="text-2xl font-bold text-blue-600">{securityMetrics.dataExports}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">GDPR Requests</h3>
          <p className="text-2xl font-bold text-purple-600">{securityMetrics.gdprRequests}</p>
        </div>
      </div>

      {/* Recent Audit Logs */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {log.action.replace(/_/g, ' ').toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {log.sessionId.slice(-8)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {JSON.stringify(log.details).slice(0, 50)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CookieConsentBanner;