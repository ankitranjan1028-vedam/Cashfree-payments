export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderId } = req.body;

  try {
    // Get the base URL based on environment
    const baseUrl = process.env.CASHFREE_ENVIRONMENT === 'PROD'
      ? 'https://api.cashfree.com'
      : 'https://sandbox.cashfree.com';

    // First, try to get payment details
    const response = await fetch(`${baseUrl}/pg/orders/${orderId}/payments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_CLIENT_ID,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
        'x-api-version': '2023-08-01'
      }
    });

    const result = await response.json();
    
    if (response.ok && result.length > 0) {
      const payment = result[0]; // Get the latest payment
      
      // Get receipt URL if payment is successful
      let receiptUrl = null;
      if (payment.payment_status === 'SUCCESS') {
        try {
          const receiptResponse = await fetch(`${baseUrl}/pg/orders/${orderId}/settlements`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-client-id': process.env.CASHFREE_CLIENT_ID,
              'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
              'x-api-version': '2023-08-01'
            }
          });
          
          if (receiptResponse.ok) {
            const receiptData = await receiptResponse.json();
            receiptUrl = receiptData.receipt_url || null;
          }
        } catch (receiptError) {
          console.log('Receipt fetch failed:', receiptError);
        }
      }

      res.status(200).json({
        orderId: orderId,
        paymentStatus: payment.payment_status,
        paymentMethod: payment.payment_method,
        cfPaymentId: payment.cf_payment_id,
        paymentAmount: payment.payment_amount,
        paymentTime: payment.payment_time,
        paymentMessage: payment.payment_message || payment.status_description,
        receiptUrl: receiptUrl,
        bankReference: payment.bank_reference || null,
        authIdCode: payment.auth_id || null
      });
    } else {
      // If no payments found, check order status
      const orderResponse = await fetch(`${baseUrl}/pg/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': process.env.CASHFREE_CLIENT_ID,
          'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
          'x-api-version': '2023-08-01'
        }
      });

      const orderResult = await orderResponse.json();
      
      if (orderResponse.ok) {
        res.status(200).json({
          orderId: orderId,
          paymentStatus: orderResult.order_status === 'PAID' ? 'SUCCESS' : 
                        orderResult.order_status === 'ACTIVE' ? 'PENDING' : 'FAILED',
          paymentAmount: orderResult.order_amount,
          paymentMessage: 'Order status: ' + orderResult.order_status,
          orderDetails: orderResult
        });
      } else {
        res.status(400).json({ 
          error: 'Payment verification failed',
          details: orderResult
        });
      }
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
