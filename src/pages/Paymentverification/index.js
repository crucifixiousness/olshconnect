// Update imports
import { FormControl, Select, MenuItem, Button, Pagination, Typography, Modal, Box, Snackbar, Alert } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { FaEye } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import Searchbar from '../../components/Searchbar';
import axios from 'axios';

const PaymentVerification = () => {
  const [showBy, setshowBy] = useState('');
  const [showProgramBy, setProgramBy] = useState('');
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem('token');

  // Add snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleViewDetails = (payment) => {
  setSelectedPayment(payment);
  setOpen(true);
  };

  // Update fetchPayments to fetch enrollment payments
  const fetchPayments = useCallback(async () => {
    try {
      const response = await axios.get('/api/enrollment-for-verification', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Fetched payments:', response.data); // Debug log
      setPayments(response.data);
    } catch (error) {
      console.error('Full error:', error.response || error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to fetch enrollment payments',
        severity: 'error'
      });
    }
  }, [token]);

  // Update verification handler
  const handleVerify = async (paymentId) => {
    try {
      await axios.put(`/api/verify-enrollment-payment/${paymentId}`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setSnackbar({
        open: true,
        message: 'Student officially enrolled successfully',
        severity: 'success'
      });
      fetchPayments();
    } catch (error) {
      console.error('Error verifying enrollment:', error);
      setSnackbar({
        open: true,
        message: 'Failed to verify enrollment',
        severity: 'error'
      });
    }
  };

  // Update rejection handler
  const handleReject = async (paymentId) => {
    try {
      await axios.put(`/api/reject-enrollment-payment/${paymentId}`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setSnackbar({
        open: true,
        message: 'Enrollment payment rejected',
        severity: 'warning'
      });
      fetchPayments();
    } catch (error) {
      console.error('Error rejecting enrollment:', error);
      setSnackbar({
        open: true,
        message: 'Failed to reject enrollment',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0">Enrollment Payment Verification</h3>      
      </div>

      <div className="card shadow border-0 p-3 mt-1">
        <div className="card shadow border-0 p-3 mt-1">
          <Searchbar/>
          <h3 className="hd">List</h3>

          <div className="row cardFilters mt-3">
            <div className="col-md-3">
              <h4>SHOW BY</h4>
              <FormControl size='small' className='w-100'>
                <Select
                  value={showBy}
                  onChange={(e)=>setshowBy(e.target.value)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  <MenuItem value=""><em>Default</em></MenuItem>
                  <MenuItem value="asc">A - Z</MenuItem>
                  <MenuItem value="desc">Z - A</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="col-md-3">
              <h4>PROGRAM</h4>
              <FormControl size='small' className='w-100'>
                <Select
                  value={showProgramBy}
                  onChange={(e)=>setProgramBy(e.target.value)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  <MenuItem value=""><em>Program</em></MenuItem>
                  <MenuItem value="BSED">BSeD</MenuItem>
                  <MenuItem value="BSIT">BSIT</MenuItem>
                  <MenuItem value="BSHM">BSHM</MenuItem>
                  <MenuItem value="BSOAD">BSOAd</MenuItem>
                  <MenuItem value="BSCRIM">BSCRIM</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          <div className='table-responsive mt-3'>
            <table className='table table-bordered v-align'>
              <thead className='thead-dark'>
                <tr>
                  <th>STUDENT NAME</th>
                  <th>PROGRAM</th>
                  <th>YEAR LEVEL</th>
                  <th>ENROLLMENT STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.studentName}</td>
                    <td>{payment.program}</td>
                    <td>{payment.yearLevel}</td>
                    <td>{payment.enrollmentStatus}</td>
                    <td className='action'>
                      <div className='actions d-flex align-items-center'>
                        <Button 
                          className="secondary" 
                          color="secondary"
                          onClick={() => handleViewDetails(payment)}
                          title="View Enrollment Receipt"
                        >
                          <FaEye/>
                        </Button>
                        {payment.enrollmentStatus === 'Pending' && (
                          <>
                            <Button 
                              className="success" 
                              color="success"
                              onClick={() => handleVerify(payment._id)}
                              title="Mark as Officially Enrolled"
                            >
                              <FaCheck/>
                            </Button>
                            <Button 
                              className="error" 
                              color="error"
                              onClick={() => handleReject(payment._id)}
                              title="Reject Enrollment"
                            >
                              <IoClose/>
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className='d-flex tableFooter'>
              <Pagination count={10} color="primary" className='pagination' showFirstButton showLastButton />
            </div>
          </div>          
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 4,
          p: 4,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          {selectedPayment && (
            <div className="enrollment-details">
              <div className="enrollment-docs-section">
                <Typography variant="h6" sx={{ 
                  mb: 2,
                  color: '#c70202',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  Enrollment Payment Receipt
                </Typography>
                
                <div className="document-preview">
                  {selectedPayment.proofOfPayment ? (
                    <img 
                      src={`data:image/jpeg;base64,${selectedPayment.proofOfPayment}`} 
                      alt="Payment Receipt" 
                      style={{ 
                        width: '100%', 
                        borderRadius: '8px',
                        maxHeight: '70vh',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <div className="no-doc-message">No payment receipt uploaded</div>
                  )}
                </div>
              </div>

              <Button 
                variant="contained" 
                fullWidth 
                sx={{ 
                  mt: 3,
                  bgcolor: '#c70202',
                  '&:hover': {
                    bgcolor: '#a00000',
                  },
                  height: '45px',
                  fontWeight: 'bold'
                }}
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </div>
          )}
        </Box>
      </Modal>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          variant='filled'
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PaymentVerification;
