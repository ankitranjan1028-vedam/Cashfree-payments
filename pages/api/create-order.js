export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { amount, customerName, customerEmail, customerPhone } = req.body;

  try {
    // Generate unique order ID
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get the base URL based on environment
    const baseUrl = process.env.CASHFREE_ENVIRONMENT === 'PROD' 
      ? 'https://api.cashfree.com' 
      : 'https://sandbox.cashfree.com';

    // Create order with Cashfree
    const orderData = {
      order_id: orderId,
      order_amount: parseFloat(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id: `CUST_${Date.now()}`,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-result?order_id=${orderId}`,
        payment_methods: "cc,dc,nb,upi,paylater,emi,app"
      }
    };

    const response = await fetch(`${baseUrl}/pg/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_CLIENT_ID,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
        'x-api-version': '2023-08-01'
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (response.ok) {
      res.status(200).json({
        order_id: result.order_id,
        payment_session_id: result.payment_session_id,
        order_status: result.order_status
      });
    } else {
      console.error('Cashfree API Error:', result);
      res.status(400).json({ 
        error: result.message || 'Order creation failed',
        details: result
      });
    }
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
