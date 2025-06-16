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
    Divider,
    Card,
    CardContent,
    Grid,
    Chip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import PaymentIcon from '@mui/icons-material/Payment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SecurityIcon from '@mui/icons-material/Security';

export default function PaymentDetails() {
    const router = useRouter();
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Backend API endpoint
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

    // Cashfree configuration
    const CASHFREE_APP_ID = process.env.NEXT_PUBLIC_CASHFREE_APP_ID;
    const CASHFREE_ENVIRONMENT = process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT || 'sandbox'; // 'sandbox' or 'production'

    useEffect(() => {
        // Get data from router query or localStorage
        const data = router.query;

        if (data && Object.keys(data).length > 0) {
            setPaymentData({
                studentId: data.studentId || '',
                studentName: data.studentName || '',
                studentEmail: data.studentEmail || '',
                studentPhone: data.studentPhone || '',
                amount: data.amount || ''
            });
        } else {
            // Try to get from localStorage as fallback
            const savedData = localStorage.getItem('studentPaymentData');
            if (savedData) {
                setPaymentData(JSON.parse(savedData));
            } else {
                // Redirect back to form if no data found
                router.push('/');
            }
        }
    }, [router]);

    // Load Cashfree SDK dynamically
    useEffect(() => {
        const loadCashfreeSDK = () => {
            return new Promise((resolve, reject) => {
                // Check if SDK is already loaded
                if (typeof window !== 'undefined' && window.Cashfree) {
                    console.log('Cashfree SDK already loaded');
                    resolve(window.Cashfree);
                    return;
                }

                // Check if script is already being loaded
                const existingScript = document.querySelector('script[src*="cashfree"]');
                if (existingScript) {
                    console.log('Cashfree SDK script already exists, waiting for load...');
                    existingScript.onload = () => {
                        if (window.Cashfree) {
                            resolve(window.Cashfree);
                        } else {
                            reject(new Error('Cashfree SDK loaded but not available'));
                        }
                    };
                    return;
                }

                console.log('Loading Cashfree SDK for environment:', CASHFREE_ENVIRONMENT);

                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.async = true;

                // Use the correct Cashfree SDK URLs
                if (CASHFREE_ENVIRONMENT === 'production') {
                    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
                } else {
                    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'; // Same URL for both
                }

                script.onload = () => {
                    console.log('Cashfree SDK script loaded');
                    // Give it a moment to initialize
                    setTimeout(() => {
                        if (typeof window !== 'undefined' && window.Cashfree) {
                            console.log('Cashfree SDK available');
                            resolve(window.Cashfree);
                        } else {
                            console.error('Cashfree SDK not available after load');
                            reject(new Error('Cashfree SDK not available after loading'));
                        }
                    }, 100);
                };

                script.onerror = (error) => {
                    console.error('Failed to load Cashfree SDK script:', error);
                    reject(new Error('Network error: Failed to load Cashfree SDK'));
                };

                // Add to document head
                document.head.appendChild(script);
                console.log('Cashfree SDK script added to document');
            });
        };

        // Only load SDK in browser environment
        if (typeof window !== 'undefined') {
            loadCashfreeSDK()
                .then(() => {
                    console.log('Cashfree SDK loaded successfully');
                })
                .catch(err => {
                    console.error('Error loading Cashfree SDK:', err);
                    setError(`Failed to load payment system: ${err.message}. Please refresh the page.`);
                });
        }
    }, [CASHFREE_ENVIRONMENT]);

    const createOrder = async () => {
        try {
            const orderPayload = {
                customerId: paymentData.studentId,
                customerName: paymentData.studentName,
                customerEmail: paymentData.studentEmail,
                customerPhone: paymentData.studentPhone,
                orderAmount: parseFloat(paymentData.amount),
                // Add any additional fields your backend expects
                returnUrl: `${window.location.origin}/payment-callback`,
                notifyUrl: `${API_BASE_URL}/payment/webhook` // Your backend webhook URL
            };

            console.log('Creating order with payload:', orderPayload);

            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(orderPayload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const orderData = await response.json();
            console.log('Order created successfully:', orderData);

            // Return the session_id and order details
            return {
                sessionId: orderData.session_id || orderData.sessionId,
                // orderId: orderData.order_id || orderData.orderId,
                ...orderData
            };

        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    };

    const initiateCashfreePayment = async (sessionId) => {
        try {
            console.log('Initiating Cashfree payment...');

            // Check if SDK is loaded
            if (typeof window === 'undefined' || !window.Cashfree) {
                throw new Error('Cashfree SDK not loaded. Please refresh the page and try again.');
            }

            console.log('Creating Cashfree instance...');

            // Initialize Cashfree
            const cashfree = window.Cashfree({
                mode: CASHFREE_ENVIRONMENT === 'production' ? 'production' : 'sandbox'
            });

            // Configure checkout options
            const checkoutOptions = {
                paymentSessionId: sessionId,
                redirectTarget: '_self', // '_self' or '_blank'
            };

            console.log('Checkout options:', checkoutOptions);
            console.log('Starting Cashfree checkout...');

            // Open Cashfree checkout
            const result = await cashfree.checkout(checkoutOptions);

            console.log('Cashfree checkout completed:', result);

            // Note: If we reach here, it means the checkout process completed
            // The actual payment verification will happen in the callback page

        } catch (error) {
            console.error('Cashfree payment initiation error:', error);
            throw error;
        }
    };

    const handlePayment = async () => {
        setLoading(true);
        setError('');

        try {
            // Step 1: Create order with your backend
            const orderResult = await createOrder();

            const sessionId = orderResult.payment_session_id;
            if (!sessionId) {
                throw new Error('Session ID not received from backend');
            }

            console.log('Order created, session ID:', orderResult.payment_session_id);

            // Step 2: Initiate Cashfree payment
            await initiateCashfreePayment(orderResult.payment_session_id);

            // Note: After successful payment, user will be redirected to returnUrl
            // The loading state will continue until redirect happens

        } catch (err) {
            console.error('Payment process error:', err);
            setError(err.message || 'Failed to initiate payment. Please try again.');
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        router.back();
    };

    if (!paymentData) {
        return (
            <Container maxWidth="sm">
                <Box textAlign="center" mt={8}>
                    <CircularProgress />
                    <Typography variant="body1" mt={2}>
                        Loading payment details...
                    </Typography>
                </Box>
            </Container>
        );
    }

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
                {/* Header */}
                <Box textAlign="center" mb={4}>
                    <PaymentIcon
                        sx={{
                            fontSize: 48,
                            color: 'primary.main',
                            mb: 2,
                            p: 1,
                            borderRadius: '50%',
                            backgroundColor: 'primary.light',
                            color: 'white'
                        }}
                    />
                    <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                        Payment Details
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Please review your information before proceeding with payment
                    </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Student Information Card */}
                <Card sx={{ mb: 4, borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
                            Student Information
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <BadgeIcon color="action" sx={{ mr: 2 }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Student ID
                                        </Typography>
                                        <Typography variant="body1" fontWeight={500}>
                                            {paymentData.studentId}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <PersonIcon color="action" sx={{ mr: 2 }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Full Name
                                        </Typography>
                                        <Typography variant="body1" fontWeight={500}>
                                            {paymentData.studentName}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <EmailIcon color="action" sx={{ mr: 2 }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Email Address
                                        </Typography>
                                        <Typography variant="body1" fontWeight={500}>
                                            {paymentData.studentEmail}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <PhoneIcon color="action" sx={{ mr: 2 }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Phone Number
                                        </Typography>
                                        <Typography variant="body1" fontWeight={500}>
                                            {paymentData.studentPhone}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Payment Amount Card */}
                <Card sx={{ mb: 4, borderRadius: 2, border: '2px solid', borderColor: 'primary.light' }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
                            Payment Amount
                        </Typography>
                        <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
                            <CurrencyRupeeIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                            <Typography variant="h3" color="primary" fontWeight={700}>
                                {parseFloat(paymentData.amount).toLocaleString('en-IN')}
                            </Typography>
                        </Box>
                        <Chip
                            label="Amount to be paid"
                            color="primary"
                            variant="outlined"
                            size="small"
                        />
                    </CardContent>
                </Card>

                {/* Security Notice */}
                <Alert
                    severity="info"
                    icon={<SecurityIcon />}
                    sx={{ mb: 4, borderRadius: 1.5 }}
                >
                    Your payment is processed through Cashfree's secure payment gateway. All transactions are encrypted and protected.
                </Alert>

                {/* Error Message */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>
                        {error}
                    </Alert>
                )}

                {/* Action Buttons */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                    <Button
                        variant="outlined"
                        size="large"
                        startIcon={<ArrowBackIcon />}
                        onClick={handleGoBack}
                        disabled={loading}
                        sx={{
                            padding: '12px 32px',
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 500,
                        }}
                    >
                        Go Back
                    </Button>

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={loading ? null : <PaymentIcon />}
                        onClick={handlePayment}
                        disabled={loading}
                        color="primary"
                        sx={{
                            padding: '12px 32px',
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            minWidth: '200px',
                        }}
                    >
                        {loading ? (
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <CircularProgress size={20} color="inherit" />
                                <span>Initiating Payment...</span>
                            </Stack>
                        ) : (
                            'Pay with Cashfree'
                        )}
                    </Button>
                </Stack>

                {/* Footer */}
                <Box textAlign="center" mt={4}>
                    <Typography variant="body2" color="text.secondary">
                        By proceeding, you agree to our terms and conditions
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}