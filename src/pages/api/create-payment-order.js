import Razorpay from 'razorpay';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR', customerInfo, cartItems } = req.body;

    // Validate required fields
    if (!amount || !customerInfo) {
      return res.status(400).json({ error: 'Amount and customer information are required' });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise (smallest currency unit)
      currency,
      receipt: `order_${Date.now()}`,
      notes: {
        customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customer_email: customerInfo.email,
        cart_items: JSON.stringify(cartItems?.map(item => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.price
        })) || [])
      }
    });

    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create payment order',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}