// import { useState } from 'react';
// import Head from 'next/head';

// export default function Home() {
//   const [formData, setFormData] = useState({
//     amount: '',
//     customerName: '',
//     customerEmail: '',
//     customerPhone: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handlePayment = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       // Create order
//       const response = await fetch('/api/create-order', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData)
//       });

//       const orderData = await response.json();

//       if (!response.ok) {
//         throw new Error(orderData.error || 'Order creation failed');
//       }

//       // Initialize Cashfree payment
//       const cashfree = window.Cashfree({
//         mode: process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT || 'sandbox'
//       });

//       const checkoutOptions = {
//         paymentSessionId: orderData.payment_session_id,
//         redirectTarget: '_self' // Ensures redirect happens in same window
//       };

//       // Open payment modal
//       cashfree.checkout(checkoutOptions).then((result) => {
//         if (result.error) {
//           console.error('Payment error:', result.error);
//           setError('Payment failed. Please try again.');
//         }
//         // Note: Success case will be handled by redirect to return_url
//       });

//     } catch (err) {
//       console.error('Payment initiation error:', err);
//       setError(err.message || 'Something went wrong');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <Head>
//         <title>Cashfree Payment Integration</title>
//         <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
//       </Head>

//       <div style={{ 
//         maxWidth: '500px', 
//         margin: '50px auto', 
//         padding: '20px',
//         fontFamily: 'Arial, sans-serif'
//       }}>
//         <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
//           Cashfree Payment Demo
//         </h1>

//         <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
//           <div>
//             <label style={{ display: 'block', marginBottom: '5px' }}>Amount (₹)</label>
//             <input
//               type="number"
//               name="amount"
//               value={formData.amount}
//               onChange={handleInputChange}
//               required
//               min="1"
//               style={{
//                 width: '100%',
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             />
//           </div>

//           <div>
//             <label style={{ display: 'block', marginBottom: '5px' }}>Customer Name</label>
//             <input
//               type="text"
//               name="customerName"
//               value={formData.customerName}
//               onChange={handleInputChange}
//               required
//               style={{
//                 width: '100%',
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             />
//           </div>

//           <div>
//             <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
//             <input
//               type="email"
//               name="customerEmail"
//               value={formData.customerEmail}
//               onChange={handleInputChange}
//               required
//               style={{
//                 width: '100%',
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             />
//           </div>

//           <div>
//             <label style={{ display: 'block', marginBottom: '5px' }}>Phone</label>
//             <input
//               type="tel"
//               name="customerPhone"
//               value={formData.customerPhone}
//               onChange={handleInputChange}
//               required
//               pattern="[0-9]{10}"
//               style={{
//                 width: '100%',
//                 padding: '10px',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px'
//               }}
//             />
//           </div>

//           {error && (
//             <div style={{ 
//               color: 'red', 
//               padding: '10px', 
//               backgroundColor: '#ffe6e6',
//               borderRadius: '4px'
//             }}>
//               {error}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             style={{
//               backgroundColor: loading ? '#ccc' : '#007bff',
//               color: 'white',
//               padding: '12px',
//               border: 'none',
//               borderRadius: '4px',
//               fontSize: '16px',
//               cursor: loading ? 'not-allowed' : 'pointer'
//             }}
//           >
//             {loading ? 'Processing...' : 'Pay Now'}
//           </button>
//         </form>
//       </div>
//     </>
//   );
// }





import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Stack,
  InputAdornment,
  Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import PaymentIcon from '@mui/icons-material/Payment';

export default function StudentPaymentForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    studentName: '',
    studentEmail: '',
    studentPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Backend API endpoint - Update this URL according to your backend server
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.studentId.trim()) {
      setError('Student ID is required');
      return false;
    }
    if (!formData.studentName.trim()) {
      setError('Full Name is required');
      return false;
    }
    if (!formData.studentEmail.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.studentPhone.trim() || formData.studentPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.studentEmail)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validate form before submission
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Prepare data for backend
      const studentData = {
        customerId: formData.studentId,
        customerName: formData.studentName,
        customerEmail: formData.studentEmail,
        customerPhone: formData.studentPhone,
        orderAmount: parseFloat(formData.amount)
      };

      console.log('Sending data to backend:', studentData);

      // Make API call to Spring Boot backend
      const response = await fetch(`${API_BASE_URL}/orders/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Parse response
      const result = await response.json();
      console.log('Backend response:', result);

      // Show success message
      setSuccess(true);

      // Store data in localStorage as backup
      localStorage.setItem('studentPaymentData', JSON.stringify({
        studentId: formData.studentId,
        studentName: formData.studentName,
        studentEmail: formData.studentEmail,
        studentPhone: formData.studentPhone,
        amount: formData.amount
      }));

      // Redirect to payment details page after a short delay
      setTimeout(() => {
        router.push({
          pathname: '/payment-details',
          query: {
            studentId: formData.studentId,
            studentName: formData.studentName,
            studentEmail: formData.studentEmail,
            studentPhone: formData.studentPhone,
            amount: formData.amount
          }
        });
      }, 1500);

    } catch (err) {
      console.error('Form submission error:', err);
      setError(err.message || 'Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          marginTop: 4,
          marginBottom: 4,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          maxWidth: 500,
          margin: '0 auto',
        }}
      >
        {/* Form Header */}
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
            Student Payment Form
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please fill in all the required information
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 1.5 }}>
            Student data saved successfully! Redirecting to payment details...
          </Alert>
        )}

        {/* Form Fields */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Student ID"
            name="studentId"
            value={formData.studentId}
            onChange={handleInputChange}
            required
            variant="outlined"
            placeholder="Enter your student ID"
            sx={{
              marginBottom: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
              '& .MuiInputLabel-root': {
                fontWeight: 500,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Full Name"
            name="studentName"
            value={formData.studentName}
            onChange={handleInputChange}
            required
            variant="outlined"
            placeholder="Enter your full name"
            sx={{
              marginBottom: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
              '& .MuiInputLabel-root': {
                fontWeight: 500,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Email Address"
            name="studentEmail"
            type="email"
            value={formData.studentEmail}
            onChange={handleInputChange}
            required
            variant="outlined"
            placeholder="Enter your email address"
            sx={{
              marginBottom: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
              '& .MuiInputLabel-root': {
                fontWeight: 500,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Phone Number"
            name="studentPhone"
            type="tel"
            value={formData.studentPhone}
            onChange={handleInputChange}
            required
            variant="outlined"
            placeholder="Enter 10-digit phone number"
            inputProps={{
              pattern: "[0-9]{10}",
              maxLength: 10
            }}
            sx={{
              marginBottom: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
              '& .MuiInputLabel-root': {
                fontWeight: 500,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Amount (₹)"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleInputChange}
            required
            inputProps={{ min: "1", step: "0.01" }}
            variant="outlined"
            placeholder="Enter amount to pay"
            sx={{
              marginBottom: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
              '& .MuiInputLabel-root': {
                fontWeight: 500,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CurrencyRupeeIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>
              {error}
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || success}
            color="primary"
            sx={{
              padding: '12px 32px',
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              marginTop: 2,
            }}
          >
            {loading ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={20} color="inherit" />
                <span>Processing...</span>
              </Stack>
            ) : success ? (
              'Success! Redirecting...'
            ) : (
              'Submit & Continue to Payment'
            )}
          </Button>

          {/* Form Footer */}
          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              All fields are required • Your information is secure
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}