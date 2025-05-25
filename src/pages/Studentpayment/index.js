import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Button,
  Chip,
  CircularProgress,
  Tab,
  Tabs,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import axios from 'axios';
import { PhotoCamera } from '@mui/icons-material';
import { FaPrint } from 'react-icons/fa';
import officialolshcologo from '../../asset/images/officialolshcologo.png';

const StudentPayment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const [breakdown, setBreakdown] = useState({
    tuition: 0,
    misc: 0,
    lab: 0,
    other: 0
  });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
  const [receiptData, setReceiptData] = useState({
    receipt_number: '',
    amount_paid: '',
    payment_date: '',
    payment_method: '',
    remarks: ''
  });
  
  const [openVerifyDialog, setOpenVerifyDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);

  const handleReceiptSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('receipt_image', receiptImage);
      formData.append('payment_id', selectedPayment.id);
      
      const token = localStorage.getItem('token');
      await axios.post('/api/enrollment-payment', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setOpenVerifyDialog(false);
      setReceiptImage(null);
      fetchPayments();
    } catch (error) {
      console.error('Error submitting receipt:', error);
      setError('Failed to submit receipt.');
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/payment-history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setPaymentHistory(response.data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check cache first
      const cachedData = localStorage.getItem('paymentData');
      const cacheTimestamp = localStorage.getItem('paymentDataTimestamp');
      const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : null;
      
      // Use cache if it's less than 5 minutes old
      if (cachedData && cacheAge && cacheAge < 300000) {
        const parsedData = JSON.parse(cachedData);
        setPayments([parsedData]);
        setTotalBalance(parsedData.remaining_balance || 0); // Changed from amount to remaining_balance
        setBreakdown(parsedData.breakdown);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.get('/api/student-payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data && response.data.length > 0) {
        const paymentData = response.data[0];
        const formattedPayment = {
          ...paymentData,
          remaining_balance: paymentData.remaining_balance || 0 // Ensure remaining_balance exists
        };
        
        // Cache the formatted payment data
        localStorage.setItem('paymentData', JSON.stringify(formattedPayment));
        localStorage.setItem('paymentDataTimestamp', Date.now().toString());
        
        setPayments([formattedPayment]);
        setTotalBalance(formattedPayment.remaining_balance || 0); // Changed from amount to remaining_balance
        setBreakdown(formattedPayment.breakdown);
      }
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message);
      setError('Failed to fetch payment information.');
    } finally {
      setLoading(false);
    }
  };

  // Add this after the loading check


  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const handlePrintReceipt = (transaction) => {
      const receiptContent = `
        <div style="font-family: Arial; padding: 20px; max-width: 500px; margin: 0 auto; border: 2px solid #ccc; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${officialolshcologo}" alt="OLSHCO Logo" style="width: 100px; height: 100px; margin-bottom: 10px; object-fit: contain;"/>
            <h2 style="color: #003366; margin: 5px 0;">Our Lady of the Sacred Heart College of Guimba Inc.</h2>
          <p style="color: #666; margin: 5px 0;">Guimba, Nueva Ecija</p>
          <h3 style="color: #003366; margin: 15px 0;">Official Receipt</h3>
        </div>
        <div style="border-top: 2px solid #003366; border-bottom: 2px solid #003366; padding: 15px 0; margin: 15px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 0;"><strong>Receipt No:</strong></td>
              <td>${transaction.reference_number}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Date:</strong></td>
              <td>${new Date(transaction.payment_date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Amount Paid:</strong></td>
              <td>₱${parseFloat(transaction.amount_paid).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Payment Method:</strong></td>
              <td>${transaction.payment_method}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Description:</strong></td>
              <td>${transaction.remarks}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Status:</strong></td>
              <td>${transaction.payment_status}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Processed By:</strong></td>
              <td>${transaction.processed_by_name}</td>
            </tr>
          </table>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; font-size: 12px; margin: 5px 0;">This is your official receipt. Please keep this for your records.</p>
          <p style="color: #666; font-size: 12px; margin: 5px 0;">Thank you for your payment!</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt</title>
        </head>
        <body style="margin: 0; padding: 20px;">
          ${receiptContent}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="right-content w-100">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
          <CircularProgress style={{ color: '#c70202' }} />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="right-content w-100" data-testid="student-payment">
        <div className="card shadow border-0 p-3 mt-1">
          <h3 className="hd mt-2 pb-0">Payment Information</h3>
        </div>
        <div className="card shadow border-0 p-3 mt-3">
          <div className="alert alert-info" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="right-content w-100" data-testid="student-payment">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0">
          Payment Information
        </h3>
      </div>

      <div className="card shadow border-0 p-3 mt-3">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Current Balance" />
            <Tab label="Payment History" />
          </Tabs>
        </Box>

        {activeTab === 0 ? (
          <>
            {/* Existing Payment Summary and Current Balance Table */}
            <div className="mb-3">
              <h4 className="hd">Payment Summary</h4>
              <Paper elevation={0} className="p-3 bg-light" data-testid="payment-summary">
                <div className="row">
                  <div className="col-md-6">
                    <h5>Remaining Balance: ₱{totalBalance.toFixed(2)}</h5>
                  </div>
                  <div className="col-md-6">
                    <h5>Breakdown:</h5>
                    {payments[0]?.breakdown && (
                      <div className="ms-3">
                        <p>Tuition Fee: ₱{parseFloat(payments[0].breakdown.tuition).toFixed(2)}</p>
                        <p>Miscellaneous: ₱{parseFloat(payments[0].breakdown.misc).toFixed(2)}</p>
                        <p>Laboratory: ₱{parseFloat(payments[0].breakdown.lab).toFixed(2)}</p>
                        <p>Other Fees: ₱{parseFloat(payments[0].breakdown.other).toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Paper>
            </div>

            <div className="table-responsive mt-3">
              <table className="table table-bordered v-align" data-testid="payment-table">
                <thead className="thead-dark">
                  <tr>
                    <th data-testid="header-description">Description</th>
                    <th data-testid="header-due-date">Due Date</th>
                    <th data-testid="header-amount">Amount</th>
                    <th data-testid="header-status">Status</th>
                    <th data-testid="header-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.description}</td>
                      <td>{payment.dueDate}</td>
                      <td>₱{payment.amount.toFixed(2)}</td>
                      <td>
                        <Chip 
                          label={payment.status}
                          color={getStatusColor(payment.status)}
                          size="small"
                        />
                      </td>
                      <td>
                        <Button
                          variant="contained"
                          className="success"
                          size="small"
                          disabled={payment.status.toLowerCase() === 'paid'}
                          onClick={() => {
                            setSelectedPayment(payment);
                            setOpenVerifyDialog(true);
                          }}
                          sx={{
                            bgcolor: '#c70202',
                            '&:hover': {
                              bgcolor: '#a00000',
                            }
                          }}
                        >
                          Verify Enrollment
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered v-align">
              <thead className="thead-dark">
                <tr>
                  <th>Receipt No.</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount Paid</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((transaction) => (
                  <tr key={transaction.transaction_id}>
                    <td>{transaction.reference_number}</td>
                    <td>{new Date(transaction.payment_date).toLocaleDateString()}</td>
                    <td>{transaction.remarks}</td>
                    <td>₱{parseFloat(transaction.amount_paid).toFixed(2)}</td>
                    <td>{transaction.payment_method}</td>
                    <td>
                      <Chip 
                        label={transaction.payment_status}
                        color={getStatusColor(transaction.payment_status)}
                        size="small"
                      />
                    </td>
                    <td>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handlePrintReceipt(transaction)}
                        startIcon={<FaPrint />}
                      >
                        Print
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Dialog open={openVerifyDialog} onClose={() => setOpenVerifyDialog(false)}>
          <DialogTitle>Upload Payment Receipt</DialogTitle>
          <DialogContent>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="receipt-image-upload"
              type="file"
              onChange={(e) => setReceiptImage(e.target.files[0])}
            />
            <label htmlFor="receipt-image-upload">
              <Button
                component="span"
                variant="outlined"
                startIcon={<PhotoCamera />}
                sx={{ mt: 2, mb: 1 }}
                fullWidth
              >
                Upload Receipt Image
              </Button>
            </label>
            {receiptImage && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {receiptImage.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenVerifyDialog(false);
              setReceiptImage(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleReceiptSubmit}
              disabled={!receiptImage}
              sx={{
                bgcolor: '#c70202',
                color: 'white',
                '&:hover': { bgcolor: '#a00000' }
              }}
            >
              Submit for Verification
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default StudentPayment;
