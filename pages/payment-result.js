import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function PaymentResult() {
  const router = useRouter();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const { order_id } = router.query;
    
    if (order_id) {
      verifyPayment(order_id);
    }
  }, [router.query]);

  const verifyPayment = async (orderId) => {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId })
      });

      const data = await response.json();

      if (response.ok) {
        setPaymentData(data);
      } else {
        setError(data.error || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setError('Unable to verify payment status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return '#28a745';
      case 'FAILED':
        return '#dc3545';
      case 'USER_DROPPED':
        return '#ffc107';
      case 'PENDING':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'SUCCESS':
        return '✓ Payment Successful!';
      case 'FAILED':
        return '✗ Payment Failed';
      case 'USER_DROPPED':
        return '⚠ Payment Cancelled';
      case 'PENDING':
        return '⏳ Payment Pending';
      default:
        return '❓ Payment Status Unknown';
    }
  };

  const formatPaymentMethod = (paymentMethod) => {
    if (!paymentMethod) return 'N/A';
    
    if (typeof paymentMethod === 'string') {
      return paymentMethod;
    }
    
    if (typeof paymentMethod === 'object') {
      if (paymentMethod.upi) return `UPI (${paymentMethod.upi})`;
      if (paymentMethod.card) return 'Card';
      if (paymentMethod.netbanking) return 'Net Banking';
      if (paymentMethod.wallet) return 'Wallet';
      
      const firstValue = Object.values(paymentMethod)[0];
      return firstValue || JSON.stringify(paymentMethod);
    }
    
    return String(paymentMethod);
  };

  const downloadReceipt = () => {
    if (paymentData?.receiptUrl) {
      window.open(paymentData.receiptUrl, '_blank');
    } else {
      // Generate PDF receipt using browser's print functionality
      const receiptWindow = window.open('', '_blank');
      receiptWindow.document.write(`
        <html>
          <head>
            <title>Payment Receipt - ${paymentData.orderId}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .details { margin: 20px 0; }
              .row { margin: 10px 0; display: flex; justify-content: space-between; }
              .status-success { color: #28a745; font-weight: bold; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Payment Receipt</h1>
              <p>Transaction Confirmation</p>
            </div>
            <div class="details">
              <div class="row"><span><strong>Order ID:</strong></span><span>${paymentData.orderId}</span></div>
              <div class="row"><span><strong>Transaction ID:</strong></span><span>${paymentData.cfPaymentId || 'N/A'}</span></div>
              <div class="row"><span><strong>Amount:</strong></span><span>₹${paymentData.paymentAmount}</span></div>
              <div class="row"><span><strong>Status:</strong></span><span class="status-success">${paymentData.paymentStatus}</span></div>
              <div class="row"><span><strong>Payment Method:</strong></span><span>${formatPaymentMethod(paymentData.paymentMethod)}</span></div>
              <div class="row"><span><strong>Date & Time:</strong></span><span>${paymentData.paymentTime ? new Date(paymentData.paymentTime).toLocaleString() : 'N/A'}</span></div>
              ${paymentData.bankReference ? `<div class="row"><span><strong>Bank Reference:</strong></span><span>${paymentData.bankReference}</span></div>` : ''}
              ${paymentData.authIdCode ? `<div class="row"><span><strong>Auth ID:</strong></span><span>${paymentData.authIdCode}</span></div>` : ''}
            </div>
            <div class="footer">
              <p>This is a computer generated receipt. No signature required.</p>
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
          </body>
        </html>
      `);
      receiptWindow.document.close();
      receiptWindow.print();
    }
  };

  if (loading) {
    return (
      <div style={{ 
        maxWidth: '500px', 
        margin: '50px auto', 
        padding: '20px',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>Verifying Payment...</h1>
        <div style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 2s linear infinite',
          margin: '20px auto'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        maxWidth: '500px', 
        margin: '50px auto', 
        padding: '20px',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{ color: '#dc3545' }}>⚠ Error</h1>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
        <button
          onClick={() => router.push('/')}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '50px auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: getStatusColor(paymentData?.paymentStatus) }}>
          {getStatusMessage(paymentData?.paymentStatus)}
        </h1>
      </div>
      
      {paymentData && (
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: getStatusColor(paymentData.paymentStatus),
            color: 'white',
            padding: '15px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: 0 }}>Payment Receipt</h3>
          </div>

          {/* Payment Details */}
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                paddingBottom: '8px',
                borderBottom: '1px solid #dee2e6'
              }}>
                <strong>Order ID:</strong> 
                <span style={{ fontFamily: 'monospace' }}>{paymentData.orderId}</span>
              </div>
              
              {paymentData.cfPaymentId && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #dee2e6'
                }}>
                  <strong>Transaction ID:</strong> 
                  <span style={{ fontFamily: 'monospace' }}>{paymentData.cfPaymentId}</span>
                </div>
              )}
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                paddingBottom: '8px',
                borderBottom: '1px solid #dee2e6'
              }}>
                <strong>Amount:</strong> 
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                  ₹{paymentData.paymentAmount}
                </span>
              </div>
              
              {paymentData.paymentMethod && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #dee2e6'
                }}>
                  <strong>Payment Method:</strong> 
                  <span>{formatPaymentMethod(paymentData.paymentMethod)}</span>
                </div>
              )}
              
              {paymentData.paymentTime && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #dee2e6'
                }}>
                  <strong>Date & Time:</strong> 
                  <span>{new Date(paymentData.paymentTime).toLocaleString()}</span>
                </div>
              )}
              
              {paymentData.bankReference && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #dee2e6'
                }}>
                  <strong>Bank Reference:</strong> 
                  <span style={{ fontFamily: 'monospace' }}>{paymentData.bankReference}</span>
                </div>
              )}

              {paymentData.authIdCode && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #dee2e6'
                }}>
                  <strong>Auth ID:</strong> 
                  <span style={{ fontFamily: 'monospace' }}>{paymentData.authIdCode}</span>
                </div>
              )}
              
              {paymentData.paymentMessage && (
                <div style={{ 
                  backgroundColor: '#e9ecef',
                  padding: '10px',
                  borderRadius: '4px',
                  marginTop: '10px'
                }}>
                  <strong>Message:</strong> {paymentData.paymentMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '15px', 
        marginTop: '30px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => router.push('/')}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Make Another Payment
        </button>
        
        {paymentData?.paymentStatus === 'SUCCESS' && (
          <button
            onClick={downloadReceipt}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            📄 Download Receipt
          </button>
        )}
        
        {paymentData?.paymentStatus === 'FAILED' && (
          <button
            onClick={() => router.push('/')}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Retry Payment
          </button>
        )}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        padding: '15px',
        fontSize: '12px',
        color: '#6c757d',
        borderTop: '1px solid #dee2e6'
      }}>
        <p>This is a computer generated receipt. No signature required.</p>
        <p>For any queries, please contact our support team.</p>
      </div>
    </div>
  );
}