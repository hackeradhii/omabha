import { useState } from 'react';
import { useCustomer } from '@/context/CustomerContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login', 'register', 'forgot'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptsMarketing: false,
  });
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { login, register, recoverPassword } = useCustomer();

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) setErrors([]);
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.email) {
      newErrors.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push({ field: 'email', message: 'Please enter a valid email' });
    }
    
    if (mode !== 'forgot' && !formData.password) {
      newErrors.push({ field: 'password', message: 'Password is required' });
    }
    
    if (mode === 'register') {
      if (!formData.firstName) {
        newErrors.push({ field: 'firstName', message: 'First name is required' });
      }
      if (!formData.lastName) {
        newErrors.push({ field: 'lastName', message: 'Last name is required' });
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
      }
      if (formData.password && formData.password.length < 6) {
        newErrors.push({ field: 'password', message: 'Password must be at least 6 characters' });
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);
    setSuccessMessage('');
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      let result;
      
      if (mode === 'login') {
        result = await login(formData.email, formData.password);
      } else if (mode === 'register') {
        result = await register(formData);
      } else if (mode === 'forgot') {
        result = await recoverPassword(formData.email);
        if (result.success) {
          setSuccessMessage('Password recovery email sent! Please check your inbox.');
          setTimeout(() => setMode('login'), 3000);
        }
      }
      
      if (result && result.success && (mode === 'login' || mode === 'register')) {
        onClose(); // Close modal on successful login/register
      } else if (result && result.errors) {
        setErrors(result.errors);
      }
    } catch (error) {
      setErrors([{ message: 'Something went wrong. Please try again.' }]);
    }
    
    setIsSubmitting(false);
  };

  const getFieldError = (fieldName) => {
    return errors.find(error => error.field === fieldName);
  };

  const hasFieldError = (fieldName) => {
    return !!getFieldError(fieldName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-ivory via-ivory to-gold/5 rounded-3xl shadow-2xl border border-gold/20 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300"
        >
          <svg className="w-5 h-5 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-burgundy to-gold rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold font-serif text-charcoal mb-2">
            {mode === 'login' && 'Welcome Back!'}
            {mode === 'register' && 'Join Omabha Family'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          
          <p className="text-charcoal/70 text-sm">
            {mode === 'login' && 'Sign in to access your account'}
            {mode === 'register' && 'Create an account to start shopping'}
            {mode === 'forgot' && 'Enter your email to receive reset instructions'}
          </p>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mx-8 mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-700 text-sm text-center">{successMessage}</p>
          </div>
        )}
        
        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mx-8 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            {errors.map((error, index) => (
              <p key={index} className="text-red-700 text-sm">
                {error.message}
              </p>
            ))}
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          {/* Name Fields - Register Only */}
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy ${
                    hasFieldError('firstName') ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/70'
                  }`}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy ${
                    hasFieldError('lastName') ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/70'
                  }`}
                  placeholder="Last name"
                />
              </div>
            </div>
          )}
          
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy ${
                hasFieldError('email') ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/70'
              }`}
              placeholder="your@email.com"
            />
          </div>
          
          {/* Phone Field - Register Only */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Phone (Optional)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
                placeholder="+91 9876543210"
              />
            </div>
          )}
          
          {/* Password Fields */}
          {mode !== 'forgot' && (
            <>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy ${
                      hasFieldError('password') ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/70'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal/50 hover:text-charcoal transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L12 12m7.02-7.02L21 3" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Confirm Password - Register Only */}
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy ${
                      hasFieldError('confirmPassword') ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/70'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
              )}
            </>
          )}
          
          {/* Marketing Consent - Register Only */}
          {mode === 'register' && (
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="acceptsMarketing"
                checked={formData.acceptsMarketing}
                onChange={handleInputChange}
                className="mt-1 w-4 h-4 text-burgundy border-gray-300 rounded focus:ring-burgundy"
              />
              <label className="text-sm text-charcoal/80">
                I would like to receive emails about new products and special offers
              </label>
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform ${
              isSubmitting 
                ? 'bg-charcoal/20 text-charcoal/50 cursor-not-allowed' 
                : 'bg-gradient-to-r from-burgundy to-burgundy/90 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mode === 'login' && 'Signing In...'}
                {mode === 'register' && 'Creating Account...'}
                {mode === 'forgot' && 'Sending Email...'}
              </div>
            ) : (
              <>
                {mode === 'login' && 'Sign In'}
                {mode === 'register' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Email'}
              </>
            )}
          </button>
        </form>
        
        {/* Footer Links */}
        <div className="px-8 pb-8 text-center space-y-3">
          {mode === 'login' && (
            <>
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-sm text-burgundy hover:text-gold transition-colors font-medium"
              >
                Forgot your password?
              </button>
              <p className="text-sm text-charcoal/70">
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-burgundy hover:text-gold transition-colors font-medium"
                >
                  Sign up
                </button>
              </p>
            </>
          )}
          
          {mode === 'register' && (
            <p className="text-sm text-charcoal/70">
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-burgundy hover:text-gold transition-colors font-medium"
              >
                Sign in
              </button>
            </p>
          )}
          
          {mode === 'forgot' && (
            <p className="text-sm text-charcoal/70">
              Remember your password?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-burgundy hover:text-gold transition-colors font-medium"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}