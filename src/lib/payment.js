// Payment utilities for Razorpay integration

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createPaymentOrder = async (orderData) => {
  try {
    const response = await fetch('/api/create-payment-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create payment order');
    }

    return data;
  } catch (error) {
    console.error('Error creating payment order:', error);
    throw error;
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Payment verification failed');
    }

    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

export const initiateRazorpayPayment = async ({
  order,
  customerInfo,
  cartItems,
  shippingAddress,
  onSuccess,
  onFailure
}) => {
  try {
    const isScriptLoaded = await loadRazorpayScript();
    
    if (!isScriptLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Omabha Store',
      description: 'Payment for your order',
      image: '/logo.png', // Add your logo
      order_id: order.id,
      prefill: {
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        email: customerInfo.email,
        contact: customerInfo.phone || '',
      },
      notes: {
        address: shippingAddress ? JSON.stringify(shippingAddress) : '',
      },
      theme: {
        color: '#8C1F28', // Burgundy color matching your theme
      },
      modal: {
        ondismiss: () => {
          onFailure(new Error('Payment cancelled by user'));
        },
      },
      handler: async (response) => {
        try {
          const verificationData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            customerInfo,
            cartItems,
            shippingAddress,
          };

          const result = await verifyPayment(verificationData);
          onSuccess(result);
        } catch (error) {
          onFailure(error);
        }
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

  } catch (error) {
    onFailure(error);
  }
};

// Payment method configurations for Indian market
export const PAYMENT_METHODS = {
  card: {
    name: 'Credit/Debit Card',
    icon: '💳',
    description: 'Visa, Mastercard, RuPay',
    supported: true,
  },
  netbanking: {
    name: 'Net Banking',
    icon: '🏦',
    description: 'All major banks',
    supported: true,
  },
  upi: {
    name: 'UPI',
    icon: '📱',
    description: 'GPay, PhonePe, Paytm',
    supported: true,
  },
  wallet: {
    name: 'Wallets',
    icon: '👛',
    description: 'Paytm, Mobikwik, FreeCharge',
    supported: true,
  },
  emi: {
    name: 'EMI',
    icon: '📊',
    description: 'Easy monthly installments',
    supported: true,
  },
};

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const calculateOrderTotal = (cartItems, shipping = 0, tax = 0, discount = 0) => {
  const subtotal = cartItems.reduce((total, item) => {
    const itemPrice = parseFloat(item.price.amount || item.price);
    return total + (itemPrice * (item.quantity || 1));
  }, 0);

  const total = subtotal + shipping + tax - discount;
  
  return {
    subtotal: Math.max(0, subtotal),
    shipping: Math.max(0, shipping),
    tax: Math.max(0, tax),
    discount: Math.max(0, discount),
    total: Math.max(0, total),
  };
};