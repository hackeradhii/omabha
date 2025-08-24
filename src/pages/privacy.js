import { useState } from 'react';
import { PrivacySettingsModal } from '@/components/Privacy';
import SEO from '@/components/SEO';

export default function PrivacyPolicyPage() {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <>
      <SEO
        title="Privacy Policy - Omabha Store"
        description="Learn how Omabha Store collects, uses, and protects your personal information. Read our comprehensive privacy policy and manage your privacy settings."
        keywords="privacy policy, data protection, GDPR, cookies, personal information"
      />
      
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-serif text-charcoal mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="px-6 py-3 bg-burgundy text-white rounded-lg hover:bg-gold hover:text-charcoal transition-colors"
              >
                Manage Privacy Settings
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-sm text-gray-500 mb-8">
                <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  Omabha Store ("we," "our," or "us") is committed to protecting your privacy and ensuring 
                  transparency about how we collect, use, and share your personal information. This Privacy 
                  Policy applies to our website and all related services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
                <p className="text-gray-700 mb-4">We collect information you provide directly to us, including:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Name, email address, and phone number</li>
                  <li>Shipping and billing addresses</li>
                  <li>Payment information (processed securely by our payment partners)</li>
                  <li>Account preferences and purchase history</li>
                  <li>Communications with our customer support team</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Automatically Collected Information</h3>
                <p className="text-gray-700 mb-4">We automatically collect certain information when you use our website:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Device information (browser type, operating system, IP address)</li>
                  <li>Usage data (pages visited, time spent, click patterns)</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Location information (if you enable location services)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-700 mb-4">We use your information for the following purposes:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li><strong>Service Provision:</strong> To process orders, provide customer support, and deliver our services</li>
                  <li><strong>Personalization:</strong> To recommend products and customize your shopping experience</li>
                  <li><strong>Communication:</strong> To send order updates, marketing communications, and important notices</li>
                  <li><strong>Analytics:</strong> To understand user behavior and improve our website and services</li>
                  <li><strong>Security:</strong> To protect against fraud and ensure platform security</li>
                  <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
                <p className="text-gray-700 mb-4">We do not sell your personal information. We may share your information in the following circumstances:</p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Service Providers</h3>
                <p className="text-gray-700 mb-4">We work with third-party service providers who help us operate our business:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li><strong>Shopify:</strong> E-commerce platform and hosting</li>
                  <li><strong>Razorpay:</strong> Payment processing</li>
                  <li><strong>Google Analytics:</strong> Website analytics</li>
                  <li><strong>Shipping Partners:</strong> Order fulfillment and delivery</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Legal Requirements</h3>
                <p className="text-gray-700 mb-4">We may disclose your information if required by law or in response to valid legal processes.</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
                <p className="text-gray-700 mb-4">We implement appropriate technical and organizational measures to protect your personal information:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure payment processing through PCI-compliant providers</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Access controls and employee training</li>
                  <li>HTTPS enforcement and security headers</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights and Choices</h2>
                <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">GDPR Rights (for EU residents)</h3>
                  <ul className="list-disc pl-6 text-blue-800">
                    <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                    <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                    <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                    <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                    <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
                    <li><strong>Right to Object:</strong> Object to certain processing activities</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Account Management</h3>
                <p className="text-gray-700 mb-4">You can access and update your account information at any time by logging into your account.</p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Marketing Communications</h3>
                <p className="text-gray-700 mb-4">You can opt out of marketing emails by clicking the unsubscribe link in any marketing email or by contacting us directly.</p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 Cookie Preferences</h3>
                <p className="text-gray-700 mb-4">You can manage your cookie preferences through our cookie consent banner or privacy settings.</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
                <p className="text-gray-700 mb-4">We use cookies and similar technologies to enhance your experience:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Necessary Cookies</h4>
                    <p className="text-sm text-gray-600">Required for basic site functionality, security, and user authentication.</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h4>
                    <p className="text-sm text-gray-600">Help us understand how visitors interact with our website.</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Marketing Cookies</h4>
                    <p className="text-sm text-gray-600">Used to deliver relevant advertisements and track campaign performance.</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Functional Cookies</h4>
                    <p className="text-sm text-gray-600">Enable enhanced features like personalized content and preferences.</p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
                <p className="text-gray-700 mb-4">We retain your personal information for as long as necessary to provide our services and comply with legal obligations:</p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li><strong>Account Data:</strong> Until you delete your account or request deletion</li>
                  <li><strong>Order History:</strong> 7 years for tax and legal compliance</li>
                  <li><strong>Analytics Data:</strong> 26 months (Google Analytics default)</li>
                  <li><strong>Marketing Data:</strong> Until you opt out or 2 years of inactivity</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
                <p className="text-gray-700 mb-4">
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure appropriate safeguards are in place when transferring personal data internationally, 
                  including using standard contractual clauses approved by the European Commission.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
                <p className="text-gray-700 mb-4">
                  Our services are not intended for children under 13 years of age. We do not knowingly 
                  collect personal information from children under 13. If you become aware that a child 
                  has provided us with personal information, please contact us immediately.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
                <p className="text-gray-700 mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any material 
                  changes by posting the new policy on this page and updating the "Last updated" date. 
                  We encourage you to review this policy periodically.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Omabha Store Privacy Team</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Email:</strong> privacy@omabhastore.com</p>
                    <p><strong>Phone:</strong> +91-1800-123-4567</p>
                    <p><strong>Address:</strong> 123 Traditional Fashion Street, Mumbai, Maharashtra 400001, India</p>
                  </div>
                </div>
              </section>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowPrivacyModal(true)}
                    className="px-8 py-3 bg-burgundy text-white rounded-lg hover:bg-gold hover:text-charcoal transition-colors"
                  >
                    Manage Your Privacy Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Settings Modal */}
        <PrivacySettingsModal
          isOpen={showPrivacyModal}
          onClose={() => setShowPrivacyModal(false)}
        />
      </div>
    </>
  );
}