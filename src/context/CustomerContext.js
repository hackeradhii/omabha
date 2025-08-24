import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createCustomer,
  customerLogin,
  customerLogout,
  getCustomer,
  customerPasswordRecover
} from '@/lib/shopify';

const CustomerContext = createContext();

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Initialize customer from localStorage on mount
  useEffect(() => {
    const initializeCustomer = async () => {
      const storedToken = localStorage.getItem('customerAccessToken');
      const storedExpiry = localStorage.getItem('customerTokenExpiry');
      
      if (storedToken && storedExpiry) {
        const expiryDate = new Date(storedExpiry);
        const now = new Date();
        
        if (expiryDate > now) {
          // Token is still valid
          try {
            const customerData = await getCustomer(storedToken);
            if (customerData) {
              setCustomer(customerData);
              setAccessToken(storedToken);
              setIsLoggedIn(true);
            } else {
              // Token invalid, clear storage
              clearLocalStorage();
            }
          } catch (error) {
            console.error('Error fetching customer:', error);
            clearLocalStorage();
          }
        } else {
          // Token expired, clear storage
          clearLocalStorage();
        }
      }
      
      setIsLoading(false);
    };

    initializeCustomer();
  }, []);

  const clearLocalStorage = () => {
    localStorage.removeItem('customerAccessToken');
    localStorage.removeItem('customerTokenExpiry');
    setCustomer(null);
    setAccessToken(null);
    setIsLoggedIn(false);
  };

  const register = async (customerData) => {
    setIsLoading(true);
    try {
      const result = await createCustomer(customerData);
      
      if (result.customer && !result.errors.length) {
        // After successful registration, automatically log them in
        const loginResult = await login(customerData.email, customerData.password);
        setIsLoading(false);
        return { success: true, customer: result.customer, errors: [] };
      } else {
        setIsLoading(false);
        return { success: false, customer: null, errors: result.errors };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, customer: null, errors: [{ message: 'Registration failed' }] };
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await customerLogin(email, password);
      
      if (result.accessToken && !result.errors.length) {
        const token = result.accessToken.accessToken;
        const expiry = result.accessToken.expiresAt;
        
        // Store token and expiry in localStorage
        localStorage.setItem('customerAccessToken', token);
        localStorage.setItem('customerTokenExpiry', expiry);
        
        // Fetch customer data
        const customerData = await getCustomer(token);
        
        setAccessToken(token);
        setCustomer(customerData);
        setIsLoggedIn(true);
        setIsLoading(false);
        
        return { success: true, customer: customerData, errors: [] };
      } else {
        setIsLoading(false);
        return { success: false, customer: null, errors: result.errors };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, customer: null, errors: [{ message: 'Login failed' }] };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (accessToken) {
        await customerLogout(accessToken);
      }
      
      clearLocalStorage();
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      clearLocalStorage();
      setIsLoading(false);
      return { success: false, errors: [{ message: 'Logout failed' }] };
    }
  };

  const recoverPassword = async (email) => {
    try {
      const result = await customerPasswordRecover(email);
      return result;
    } catch (error) {
      return { success: false, errors: [{ message: 'Password recovery failed' }] };
    }
  };

  const refreshCustomer = async () => {
    if (accessToken) {
      try {
        const customerData = await getCustomer(accessToken);
        setCustomer(customerData);
        return customerData;
      } catch (error) {
        console.error('Error refreshing customer:', error);
        return null;
      }
    }
    return null;
  };

  const value = {
    customer,
    accessToken,
    isLoading,
    isLoggedIn,
    register,
    login,
    logout,
    recoverPassword,
    refreshCustomer,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}