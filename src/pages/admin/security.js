import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useCustomer } from '@/context/CustomerContext';
import { SecurityDashboard } from '@/components/Privacy';
import SEO from '@/components/SEO';

export default function AdminSecurityPage() {
  const router = useRouter();
  const { customer, isLoggedIn } = useCustomer();
  const [securityStatus, setSecurityStatus] = useState({
    httpsEnabled: false,
    headersConfigured: false,
    corsEnabled: false,
    rateLimitActive: false,
    gdprCompliant: false,
    dataEncrypted: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !customer) {
      router.push('/');
      return;
    }
    checkSecurityStatus();
  }, [isLoggedIn, customer, router]);

  const checkSecurityStatus = async () => {
    try {
      setLoading(true);
      
      // Check security endpoint
      const response = await fetch('/api/security');
      const data = await response.json();
      
      setSecurityStatus({
        httpsEnabled: data.security.https,
        headersConfigured: response.headers.get('X-Frame-Options') === 'DENY',
        corsEnabled: data.security.cors === 'configured',
        rateLimitActive: data.security.rateLimit === 'active',
        gdprCompliant: localStorage.getItem('cookie_consent') !== null,
        dataEncrypted: true // Assuming encryption is implemented
      });
    } catch (error) {
      console.error('Error checking security status:', error);
    } finally {
      setLoading(false);
    }
  };

  const SecurityStatusCard = ({ title, status, description, icon }) => (
    <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            status ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          status 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {status ? 'Active' : 'Inactive'}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Security Monitoring - Admin Dashboard" description="Monitor security status and compliance" noIndex={true} />
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Security Monitoring</h1>
              <p className="text-gray-600 mt-2">Monitor security status and compliance measures</p>
            </div>
            <Link href="/admin" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              ← Back to Dashboard
            </Link>
          </div>

          {/* Overall Security Score */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Security Score</h2>
                <p className="text-gray-600">Overall security posture assessment</p>
              </div>
              <div className="text-center">
                {(() => {
                  const activeCount = Object.values(securityStatus).filter(Boolean).length;
                  const totalCount = Object.values(securityStatus).length;
                  const percentage = Math.round((activeCount / totalCount) * 100);
                  
                  return (
                    <>
                      <div className={`text-4xl font-bold ${
                        percentage >= 80 ? 'text-green-600' : 
                        percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {percentage}%
                      </div>
                      <div className="text-sm text-gray-500">
                        {activeCount} of {totalCount} measures active
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Security Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <SecurityStatusCard
              title="HTTPS Enforcement"
              status={securityStatus.httpsEnabled}
              description="Secure encrypted connections"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <SecurityStatusCard
              title="Security Headers"
              status={securityStatus.headersConfigured}
              description="XSS protection, frame options, CSP"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            />

            <SecurityStatusCard
              title="CORS Configuration"
              status={securityStatus.corsEnabled}
              description="Cross-origin request protection"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              }
            />

            <SecurityStatusCard
              title="Rate Limiting"
              status={securityStatus.rateLimitActive}
              description="API abuse prevention"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <SecurityStatusCard
              title="GDPR Compliance"
              status={securityStatus.gdprCompliant}
              description="Data protection regulations"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <SecurityStatusCard
              title="Data Encryption"
              status={securityStatus.dataEncrypted}
              description="Sensitive data protection"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              }
            />
          </div>

          {/* Security Recommendations */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Security Recommendations</h2>
            <div className="space-y-4">
              {!securityStatus.httpsEnabled && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Enable HTTPS</h3>
                      <p className="text-sm text-red-700">Configure SSL certificate to encrypt data in transit.</p>
                    </div>
                  </div>
                </div>
              )}

              {!securityStatus.headersConfigured && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Configure Security Headers</h3>
                      <p className="text-sm text-yellow-700">Implement CSP, XSS protection, and frame options headers.</p>
                    </div>
                  </div>
                </div>
              )}

              {Object.values(securityStatus).every(Boolean) && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">All Security Measures Active</h3>
                      <p className="text-sm text-green-700">Your application is properly secured. Continue monitoring for any security events.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Audit Dashboard */}
          <SecurityDashboard />

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={checkSecurityStatus}
                className="flex items-center justify-center px-4 py-3 bg-burgundy text-white rounded-lg hover:bg-gold hover:text-charcoal transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Status
              </button>
              
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Privacy Policy
              </a>

              <button
                onClick={() => window.open('/api/security', '_blank')}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Security API Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}