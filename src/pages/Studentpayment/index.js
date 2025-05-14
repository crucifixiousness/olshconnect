import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Button,
  Chip,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

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


  useEffect(() => {
    fetchPayments();
  }, []);

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
        setTotalBalance(parsedData.amount);
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
        };
        
        // Cache the formatted payment data
        localStorage.setItem('paymentData', JSON.stringify(formattedPayment));
        localStorage.setItem('paymentDataTimestamp', Date.now().toString());
        
        setPayments([formattedPayment]);
        setTotalBalance(formattedPayment.amount);
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
        <div className="mb-3">
          <h4 className="hd">Payment Summary</h4>
          <Paper elevation={0} className="p-3 bg-light" data-testid="payment-summary">
            <div className="row">
              <div className="col-md-6">
                <h5>Total Balance: ₱{totalBalance.toFixed(2)}</h5>
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
      </div>
    </div>
  );
};

export default StudentPayment;
