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
import jsPDF from 'jspdf';

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
  const [receiptImage, setReceiptImage] = useState(null);

  const handleReceiptSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('receipt_image', receiptImage);
      formData.append('receipt_data', JSON.stringify(receiptData));
      
      const token = localStorage.getItem('token');
      await axios.post('/api/enrollment-payment', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setOpenReceiptDialog(false);
      fetchPaymentHistory(); // Refresh payment history
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
    // Create new PDF document in A5 size (148x210mm)
    const doc = new jsPDF({
      format: 'a5',
      unit: 'mm'
    });

    // Add logo
    const logoWidth = 30;
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(officialolshcologo, 'PNG', logoX, 10, logoWidth, logoWidth);

    // Add header text
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102); // #003366
    doc.text('Our Lady of the Sacred Heart College of Guimba Inc.', pageWidth/2, 50, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(102, 102, 102); // #666
    doc.text('Guimba, Nueva Ecija', pageWidth/2, 57, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text('Official Receipt', pageWidth/2, 67, { align: 'center' });

    // Add receipt details
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const startY = 80;
    const lineHeight = 7;
    
    doc.text(`Receipt No: ${transaction.reference_number}`, 20, startY);
    doc.text(`Date: ${new Date(transaction.payment_date).toLocaleDateString()}`, 20, startY + lineHeight);
    doc.text(`Amount Paid: ₱${parseFloat(transaction.amount_paid).toFixed(2)}`, 20, startY + lineHeight * 2);
    doc.text(`Payment Method: ${transaction.payment_method}`, 20, startY + lineHeight * 3);
    doc.text(`Description: ${transaction.remarks}`, 20, startY + lineHeight * 4);
    doc.text(`Status: ${transaction.payment_status}`, 20, startY + lineHeight * 5);
    doc.text(`Processed By: ${transaction.processed_by_name}`, 20, startY + lineHeight * 6);

    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(102, 102, 102);
    doc.text('This is your official receipt. Please keep this for your records.', pageWidth/2, 180, { align: 'center' });
    doc.text('Thank you for your payment!', pageWidth/2, 185, { align: 'center' });

    // Save the PDF
    doc.save(`Receipt-${transaction.reference_number}.pdf`);
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
                          sx={{
                            bgcolor: '#c70202',
                            '&:hover': {
                              bgcolor: '#a00000',
                            }
                          }}
                        >
                          Pay Now
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
        <Dialog open={openReceiptDialog} onClose={() => setOpenReceiptDialog(false)}>
        <DialogTitle>Submit Payment Receipt</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Receipt Number"
            value={receiptData.receipt_number}
            onChange={(e) => setReceiptData({
              ...receiptData,
              receipt_number: e.target.value
            })}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Amount Paid"
            type="number"
            value={receiptData.amount_paid}
            onChange={(e) => setReceiptData({
              ...receiptData,
              amount_paid: e.target.value
            })}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Payment Date"
            type="date"
            value={receiptData.payment_date}
            onChange={(e) => setReceiptData({
              ...receiptData,
              payment_date: e.target.value
            })}
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={receiptData.payment_method}
              onChange={(e) => setReceiptData({
                ...receiptData,
                payment_method: e.target.value
              })}
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="check">Check</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Remarks"
            multiline
            rows={2}
            value={receiptData.remarks}
            onChange={(e) => setReceiptData({
              ...receiptData,
              remarks: e.target.value
            })}
            margin="normal"
          />

          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="receipt-image-upload"
            type="file"
            onChange={(e) => setReceiptImage(e.target.files[0])}
          />
          <label htmlFor="receipt-image-upload">
            <IconButton color="primary" component="span">
              <PhotoCamera />
            </IconButton>
            {receiptImage?.name || 'Upload Receipt Image'}
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReceiptDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleReceiptSubmit}
            disabled={!receiptData.receipt_number || !receiptData.amount_paid}
            sx={{
              bgcolor: '#c70202',
              color: 'white',
              '&:hover': { bgcolor: '#a00000' }
            }}
          >
            Submit Receipt
          </Button>
        </DialogActions>
      </Dialog>
      </div>
    </div>
  );
};

export default StudentPayment;
