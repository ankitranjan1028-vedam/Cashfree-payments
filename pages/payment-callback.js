// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import {
//   Container,
//   Paper,
//   Typography,
//   Box,
//   Button,
//   CircularProgress,
//   Alert,
//   Card,
//   CardContent,
//   Stack,
//   Chip
// } from '@mui/material';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import ErrorIcon from '@mui/icons-material/Error';
// import InfoIcon from '@mui/icons-material/Info';
// import HomeIcon from '@mui/icons-material/Home';
// import ReceiptIcon from '@mui/icons-material/Receipt';

// export default function PaymentCallback() {
//   const router = useRouter();
//   const [paymentStatus, setPaymentStatus] = useState('processing');
//   const [paymentData, setPaymentData] = useState(null);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);

//   // Backend API endpoint
//   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

//   useEffect(() => {
//     const verifyPayment = async () => {
//       try {
//         // Get payment details from URL parameters
//         const urlParams = new URLSearchParams(window.location.search);
//         const orderId = urlParams.get('order_id');
//         const orderToken = urlParams.get('order_token');
//         const cfPaymentId = urlParams.get('cf_payment_id');
        
//         console.log('Payment callback received:', {
//           orderId,
//           orderToken,
//           cfPaymentId,
//           allParams: Object.fromEntries(urlParams)
//         });

//         if (!orderId) {
//           throw new Error('Missing order information in callback');
//         }

//         // Verify payment status with your backend
//         const response = await fetch(`${API_BASE_URL}/payment/verify`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//           },
//           body: JSON.stringify({
//             orderId: orderId,
//             orderToken: orderToken,
//             cfPaymentId: cfPaymentId,
//           }),
//         });

//         if (!response.ok) {
//           throw new Error(`Verification failed: ${response.status}`);
//         }

//         const verificationResult = await response.json();
//         console.log('Payment verification result:', verificationResult);

//         // Update state based on verification result
//         setPaymentData(verificationResult);
        
//         // Determine payment status
//         if (verificationResult.paymentStatus === 'SUCCESS' || verificationResult.status === 'SUCCESS') {
//           setPaymentStatus('success');
//         } else if (verificationResult.paymentStatus === 'FAILED' || verificationResult.status === 'FAILED') {
//           setPaymentStatus('failed');
//           setError(verificationResult.errorMessage || 'Payment failed');
//         } else if (verificationResult.paymentStatus === 'PENDING' || verificationResult.status === 'PENDING') {
//           setPaymentStatus('pending');
//         } else {
//           setPaymentStatus('unknown');
//           setError('Unknown payment status received');
//         }

//       } catch (err) {
//         console.error('Payment verification error:', err);
//         setPaymentStatus('error');
//         setError(err.message || 'Failed to verify payment status');
//       } finally {
//         setLoading(false);
//       }
//     };

//     // Only verify if we have router query parameters
//     if (router.isReady) {
//       verifyPayment();
//     }
//   }, [router.isReady, API_BASE_URL]);

//   const handleGoHome = () => {
//     router.push('/');
//   };

//   const handleDownloadReceipt = () => {
//     // Implement receipt download functionality
//     if (paymentData?.receiptUrl) {
//       window.open(paymentData.receiptUrl, '_blank');
//     } else {
//       // Generate receipt or redirect to receipt page
//       router.push(`/receipt?orderId=${paymentData?.orderId}`);
//     }
//   };

//   const getStatusIcon = () => {
//     switch (paymentStatus) {
//       case 'success':
//         return <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main' }} />;
//       case 'failed':
//         return <ErrorIcon sx={{ fontSize: 64, color: 'error.main' }} />;
//       case 'pending':
//         return <InfoIcon sx={{ fontSize: 64, color: 'warning.main' }} />;
//       case 'processing':
//         return <CircularProgress size={64} />;
//       default:
//         return <ErrorIcon sx={{ fontSize: 64, color: 'error.main' }} />;
//     }
//   };

//   const getStatusMessage = () => {
//     switch (paymentStatus) {
//       case 'success':
//         return {
//           title: 'Payment Successful!',
//           message: 'Your payment has been processed successfully.',
//           severity: 'success'
//         };
//       case 'failed':
//         return {
//           title: 'Payment Failed',
//           message: 'We were unable to process your payment. Please try again.',
//           severity: 'error'
//         };
//       case 'pending':
//         return {
//           title: 'Payment Pending',
//           message: 'Your payment is being processed. We will notify you once it is complete.',
//           severity: 'warning'
//         };
//       case 'processing':
//         return {
//           title: 'Processing Payment',
//           message: 'Please wait while we verify your payment...',
//           severity: 'info'
//         };
//       default:
//         return {
//           title: 'Payment Status Unknown',
//           message: 'We could not determine the status of your payment.',
//           severity: 'error'
//         };
//     }
//   };

//   const statusInfo = getStatusMessage();

//   if (loading) {
//     return (
//       <Container maxWidth="sm">
//         <Box textAlign="center" mt={8}>
//           <CircularProgress size={60} />
//           <Typography variant="h6" mt={2}>
//             Verifying your payment...
//           </Typography>
//           <Typography variant="body2" color="text.secondary" mt={1}>
//             Please do not close this window
//           </Typography>
//         </Box>
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="md">
//       <Paper
//         elevation={3}
//         sx={{
//           padding: 4,
//           marginTop: 4,
//           marginBottom: 4,
//           borderRadius: 2,
//           boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
//         }}
//       >
//         {/* Status Header */}
//         <Box textAlign="center" mb={4}>
//           {getStatusIcon()}
//           <Typography variant="h4" component="h1" gutterBottom fontWeight={700} mt={2}>
//             {statusInfo.title}
//           </Typography>
//           <Typography variant="body1" color="text.secondary">
//             {statusInfo.message}
//           </Typography>
//         </Box>

//         {/* Error Message */}
//         {error && (
//           <Alert severity="error" sx={{ mb: 4, borderRadius: 1.5 }}>
//             {error}
//           </Alert>
//         )}

//         {/* Payment Details */}
//         {paymentData && (
//           <Card sx={{ mb: 4, borderRadius: 2 }}>
//             <CardContent sx={{ p: 3 }}>
//               <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
//                 Payment Details
//               </Typography>
              
//               <Stack spacing={2}>
//                 {paymentData.orderId && (
//                   <Box display="flex" justifyContent="space-between" alignItems="center">
//                     <Typography variant="body2" color="text.secondary">
//                       Order ID:
//                     </Typography>
//                     <Typography variant="body1" fontWeight={500}>
//                       {paymentData.orderId}
//                     </Typography>
//                   </Box>
//                 )}

//                 {paymentData.cfPaymentId && (
//                   <Box display="flex" justifyContent="space-between" alignItems="center">
//                     <Typography variant="body2" color="text.secondary">
//                       Payment ID:
//                     </Typography>
//                     <Typography variant="body1" fontWeight={500}>
//                       {paymentData.cfPaymentId}
//                     </Typography>
//                   </Box>
//                 )}

//                 {paymentData.orderAmount && (
//                   <Box display="flex" justifyContent="space-between" alignItems="center">
//                     <Typography variant="body2" color="text.secondary">
//                       Amount:
//                     </Typography>
//                     <Typography variant="h6" color="primary" fontWeight={600}>
//                       ₹{parseFloat(paymentData.orderAmount).toLocaleString('en-IN')}
//                     </Typography>
//                   </Box>
//                 )}

//                 {paymentData.paymentMethod && (
//                   <Box display="flex" justifyContent="space-between" alignItems="center">
//                     <Typography variant="body2" color="text.secondary">
//                       Payment Method:
//                     </Typography>
//                     <Chip 
//                       label={paymentData.paymentMethod} 
//                       size="small" 
//                       variant="outlined"
//                     />
//                   </Box>
//                 )}

//                 {paymentData.transactionTime && (
//                   <Box display="flex" justifyContent="space-between" alignItems="center">
//                     <Typography variant="body2" color="text.secondary">
//                       Transaction Time:
//                     </Typography>
//                     <Typography variant="body2">
//                       {new Date(paymentData.transactionTime).toLocaleString()}
//                     </Typography>
//                   </Box>
//                 )}
//               </Stack>
//             </CardContent>
//           </Card>
//         )}

//         {/* Action Buttons */}
//         <Stack 
//           direction={{ xs: 'column', sm: 'row' }} 
//           spacing={2} 
//           justifyContent="center"
//           alignItems="center"
//         >
//           <Button
//             variant="outlined"
//             size="large"
//             startIcon={<HomeIcon />}
//             onClick={handleGoHome}
//             sx={{
//               padding: '12px 32px',
//               borderRadius: 1.5,
//               textTransform: 'none',
//               fontSize: '1rem',
//               fontWeight: 500,
//             }}
//           >
//             Go to Home
//           </Button>

//           {paymentStatus === 'success' && (
//             <Button
//               variant="contained"
//               size="large"
//               startIcon={<ReceiptIcon />}
//               onClick={handleDownloadReceipt}
//               sx={{
//                 padding: '12px 32px',
//                 borderRadius: 1.5,
//                 textTransform: 'none',
//                 fontSize: '1rem',
//                 fontWeight: 500,
//               }}
//             >
//               Download Receipt
//             </Button>
//           )}

//           {paymentStatus === 'failed' && (
//             <Button
//               variant="contained"
//               size="large"
//               color="primary"
//               onClick={() => router.push('/payment-details')}
//               sx={{
//                 padding: '12px 32px',
//                 borderRadius: 1.5,
//                 textTransform: 'none',
//                 fontSize: '1rem',
//                 fontWeight: 500,
//               }}
//             >
//               Try Again
//             </Button>
//           )}
//         </Stack>

//         {/* Additional Info */}
//         <Box textAlign="center" mt={4}>
//           <Typography variant="body2" color="text.secondary">
//             {paymentStatus === 'success' && 'A confirmation email has been sent to your registered email address.'}
//             {paymentStatus === 'pending' && 'You will receive an email once the payment is confirmed.'}
//             {paymentStatus === 'failed' && 'If you continue to face issues, please contact our support team.'}
//           </Typography>
//         </Box>
//       </Paper>
//     </Container>
//   );
// }


import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Alert,
    CircularProgress,
    Stack,
    Card,
    CardContent,
    Divider,
    Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function PaymentCallback() {
    const router = useRouter();
    const [paymentStatus, setPaymentStatus] = useState('loading'); // 'loading', 'success', 'failed', 'error'
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [error, setError] = useState('');
    const [verifying, setVerifying] = useState(true);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Get parameters from URL
                const { order_id, status } = router.query;
                
                console.log('Payment callback received:', { order_id, status });

                // Get stored order details
                const storedOrder = localStorage.getItem('currentPaymentOrder');
                let orderInfo = null;
                
                if (storedOrder) {
                    orderInfo = JSON.parse(storedOrder);
                    setOrderDetails(orderInfo);
                }

                if (!order_id) {
                    throw new Error('Order ID not found in callback');
                }

                // Verify payment status with backend
                const response = await fetch(`${API_BASE_URL}/orders/${order_id}/verify`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Verification failed: ${response.status}`);
                }

                const verificationResult = await response.json();
                console.log('Payment verification result:', verificationResult);

                setPaymentDetails(verificationResult);

                // Determine payment status
                if (verificationResult.payment_status === 'SUCCESS' || 
                    verificationResult.order_status === 'PAID' ||
                    verificationResult.status === 'SUCCESS') {
                    setPaymentStatus('success');
                } else if (verificationResult.payment_status === 'FAILED' || 
                          verificationResult.order_status === 'CANCELLED' ||
                          verificationResult.status === 'FAILED') {
                    setPaymentStatus('failed');
                } else {
                    setPaymentStatus('pending');
                }

                // Clear stored order data on successful verification
                if (verificationResult.payment_status === 'SUCCESS') {
                    localStorage.removeItem('currentPaymentOrder');
                    localStorage.removeItem('studentPaymentData');
                }

            } catch (err) {
                console.error('Payment verification error:', err);
                setError(err.message || 'Failed to verify payment status');
                setPaymentStatus('error');
            } finally {
                setVerifying(false);
            }
        };

        // Only verify if router is ready and we have query params
        if (router.isReady) {
            verifyPayment();
        }
    }, [router.isReady, router.query]);

    const handleGoHome = () => {
        router.push('/');
    };

    const handleRetryPayment = () => {
        if (orderDetails && orderDetails.studentData) {
            router.push({
                pathname: '/payment-details',
                query: orderDetails.studentData
            });
        } else {
            router.push('/');
        }
    };

    const handleRefresh = () => {
        router.reload();
    };

    if (verifying) {
        return (
            <Container maxWidth="md">
                <Box textAlign="center" mt={8}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" mt={3} gutterBottom>
                        Verifying Payment Status...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Please wait while we confirm your payment
                    </Typography>
                </Box>
            </Container>
        );
    }

    const renderStatusIcon = () => {
        switch (paymentStatus) {
            case 'success':
                return <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />;
            case 'failed':
            case 'error':
                return <ErrorIcon sx={{ fontSize: 80, color: 'error.main' }} />;
            default:
                return <CircularProgress size={60} />;
        }
    };

    const renderStatusMessage = () => {
        switch (paymentStatus) {
            case 'success':
                return {
                    title: 'Payment Successful!',
                    message: 'Your payment has been processed successfully. You will receive a confirmation email shortly.',
                    severity: 'success'
                };
            case 'failed':
                return {
                    title: 'Payment Failed',
                    message: 'Your payment could not be processed. Please try again or contact support if the issue persists.',
                    severity: 'error'
                };
            case 'error':
                return {
                    title: 'Verification Error',
                    message: error || 'Unable to verify payment status. Please contact support.',
                    severity: 'error'
                };
            case 'pending':
                return {
                    title: 'Payment Pending',
                    message: 'Your payment is being processed. Please wait for confirmation.',
                    severity: 'warning'
                };
            default:
                return {
                    title: 'Processing...',
                    message: 'Please wait while we process your payment.',
                    severity: 'info'
                };
        }
    };

    const statusInfo = renderStatusMessage();

    return (
        <Container maxWidth="md">
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    marginTop: 4,
                    marginBottom: 4,
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                }}
            >
                {/* Status Icon and Title */}
                <Box textAlign="center" mb={4}>
                    {renderStatusIcon()}
                    <Typography variant="h4" component="h1" gutterBottom fontWeight={700} mt={2}>
                        {statusInfo.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" maxWidth="600px" mx="auto">
                        {statusInfo.message}
                    </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Payment Details */}
                {paymentDetails && (
                    <Card sx={{ mb: 4, borderRadius: 2 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
                                Transaction Details
                            </Typography>
                            
                            <Stack spacing={2}>
                                {paymentDetails.order_id && (
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" color="text.secondary">
                                            Order ID:
                                        </Typography>
                                        <Typography variant="body1" fontWeight={500}>
                                            {paymentDetails.order_id}
                                        </Typography>
                                    </Box>
                                )}

                                {paymentDetails.cf_payment_id && (
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" color="text.secondary">
                                            Transaction ID:
                                        </Typography>
                                        <Typography variant="body1" fontWeight={500}>
                                            {paymentDetails.cf_payment_id}
                                        </Typography>
                                    </Box>
                                )}

                                {paymentDetails.order_amount && (
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" color="text.secondary">
                                            Amount:
                                        </Typography>
                                        <Typography variant="body1" fontWeight={500}>
                                            ₹{parseFloat(paymentDetails.order_amount).toLocaleString('en-IN')}
                                        </Typography>
                                    </Box>
                                )}

                                {paymentDetails.payment_method && (
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" color="text.secondary">
                                            Payment Method:
                                        </Typography>
                                        <Typography variant="body1" fontWeight={500}>
                                            {paymentDetails.payment_method}
                                        </Typography>
                                    </Box>
                                )}

                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Status:
                                    </Typography>
                                    <Chip
                                        label={paymentStatus.toUpperCase()}
                                        color={paymentStatus === 'success' ? 'success' : 
                                               paymentStatus === 'failed' ? 'error' : 'warning'}
                                        size="small"
                                    />
                                </Box>

                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Date & Time:
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {new Date().toLocaleString('en-IN')}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                {/* Student Information (if available) */}
                {orderDetails && orderDetails.studentData && (
                    <Card sx={{ mb: 4, borderRadius: 2 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
                                Student Information
                            </Typography>
                            
                            <Stack spacing={2}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Student ID:
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {orderDetails.studentData.studentId}
                                    </Typography>
                                </Box>
                                
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Name:
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {orderDetails.studentData.studentName}
                                    </Typography>
                                </Box>
                                
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Email:
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {orderDetails.studentData.studentEmail}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                {/* Status Alert */}
                <Alert severity={statusInfo.severity} sx={{ mb: 4, borderRadius: 1.5 }}>
                    {statusInfo.message}
                </Alert>

                {/* Action Buttons */}
                <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2} 
                    justifyContent="center"
                    alignItems="center"
                >
                    <Button
                        variant="outlined"
                        size="large"
                        startIcon={<HomeIcon />}
                        onClick={handleGoHome}
                        sx={{
                            padding: '12px 32px',
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 500,
                        }}
                    >
                        Go to Home
                    </Button>

                    {/* {paymentStatus === 'failed' && (
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<RefreshIcon />}
                            onClick={handleRetryPayment}
                            color="primary"
                            sx={{
                                padding: '12px 32px',
                                borderRadius: 1.5,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 500,
                            }}
                        >
                            Retry Payment
                        </Button>
                    )} */}

                    {paymentStatus === 'success' && (
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<ReceiptIcon />}
                            onClick={() => window.print()}
                            color="primary"
                            sx={{
                                padding: '12px 32px',
                                borderRadius: 1.5,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 500,
                            }}
                        >
                            Print Receipt
                        </Button>
                    )}

                    {paymentStatus === 'error' && (
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                            color="primary"
                            sx={{
                                padding: '12px 32px',
                                borderRadius: 1.5,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 500,
                            }}
                        >
                            Refresh Status
                        </Button>
                    )}
                </Stack>

                {/* Footer */}
                <Box textAlign="center" mt={4}>
                    <Typography variant="body2" color="text.secondary">
                        {paymentStatus === 'success' 
                            ? 'Thank you for your payment!' 
                            : 'Need help? Contact our support team.'
                        }
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}