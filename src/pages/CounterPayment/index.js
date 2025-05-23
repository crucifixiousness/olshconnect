import { useState } from 'react';
import { 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  Typography, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  Box
} from '@mui/material';
import { FaSearch, FaPrint, FaHistory } from 'react-icons/fa';
import axios from 'axios';

const CounterPayment = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const token = localStorage.getItem('token');

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };

  const handleSearch = async () => {
    try {
      if (!searchQuery) {
        alert('Please enter a search term');
        return;
      }

      const response = await axios.get(`/api/search-student?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Log the search response for debugging
      console.log('Search Response:', response.data);

      if (!response.data.enrollmentId) {  // Changed from enrollment_id to enrollmentId
        alert('No active enrollment found for this student');
        return;
      }

      setStudentInfo({
        ...response.data,
        enrollment_id: response.data.enrollmentId  // Add this mapping
      });
    } catch (error) {
      console.error('Search Error:', error);
      alert(error.response?.data?.error || 'Error searching student');
    }
  };

  const handlePayment = async () => {
    try {
      // Add validation checks
      if (!studentInfo) {
        alert('Please search for a student first');
        return;
      }

      if (!paymentAmount || paymentAmount <= 0) {
        alert('Please enter a valid payment amount');
        return;
      }

      if (!paymentMethod) {
        alert('Please select a payment method');
        return;
      }

      // Log the request data for debugging
      console.log('Payment Request:', {
        enrollment_id: studentInfo.enrollment_id,
        amount_paid: paymentAmount,
        payment_method: paymentMethod
      });

      const response = await axios.post('/api/counter-payment', {
        enrollment_id: studentInfo.enrollment_id,
        amount_paid: paymentAmount,
        payment_method: paymentMethod,
        reference_number: null
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        alert('Payment processed successfully');
        setPaymentAmount('');
        setPaymentMethod('');
        handleSearch(); // Refresh student info
      }
    } catch (error) {
      console.error('Payment Error Details:', error);
      alert(error.response?.data?.error || 'Error processing payment');
    }
  };

  const handleViewHistory = async () => {
    try {
      const response = await axios.get(`/api/get-verified-enrollments?studentId=${studentInfo.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaymentHistory(response.data);
      setShowHistory(true);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3">
        <Typography variant="h5" className="mb-4">Counter Payment</Typography>

        {/* Search Student Section */}
        <Paper elevation={3} className="p-3 mb-4">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={8}>
              <TextField
                fullWidth
                label="Search Student (ID or Name)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <Button 
                variant="contained" 
                startIcon={<FaSearch />}
                onClick={handleSearch}
                fullWidth
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Student Information */}
        {studentInfo && (
          <Paper elevation={3} className="p-3 mb-4">
            <Typography variant="h6" className="mb-3">Student Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography>Name: {studentInfo.fullName}</Typography>
                <Typography>Student ID: {studentInfo.studentId}</Typography>
                <Typography>Program: {studentInfo.program}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Total Fee: ₱{studentInfo.totalFee?.toLocaleString()}</Typography>
                <Typography>Amount Paid: ₱{studentInfo.amountPaid?.toLocaleString()}</Typography>
                <Typography>Balance: ₱{studentInfo.balance?.toLocaleString()}</Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Payment Form */}
        {studentInfo && (
          <Paper elevation={3} className="p-3 mb-4">
            <Typography variant="h6" className="mb-3">Payment Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Check">Check</MenuItem>
                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} className="mt-3">
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handlePayment}
                  className="me-2"
                >
                  Process Payment
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<FaPrint />}
                >
                  Print Receipt
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<FaHistory />}
                  onClick={handleViewHistory}
                  className="ms-2"
                >
                  View History
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Payment History Modal */}
        <Modal
          open={showHistory}
          onClose={() => setShowHistory(false)}
        >
          <Box sx={modalStyle}>
            <Typography variant="h6" className="mb-3">Payment History</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Receipt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell>₱{payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>{payment.status}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small"
                          startIcon={<FaPrint />}
                        >
                          Print
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default CounterPayment;
