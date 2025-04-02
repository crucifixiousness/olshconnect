import { FormControl, Select, MenuItem, Button, Pagination, Typography, Modal, Box } from '@mui/material';
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

  // Wrap fetchPayments in useCallback
  const fetchPayments = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:4000/payments/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  }, [token]); // Add token as dependency since it's used inside

  // Update the useEffect to include fetchPayments in dependencies
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleVerify = async (paymentId) => {
    try {
      await axios.put(`http://localhost:4000/payments/verify/${paymentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPayments();
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  const handleReject = async (paymentId) => {
    try {
      await axios.put(`http://localhost:4000/payments/reject/${paymentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPayments();
    } catch (error) {
      console.error('Error rejecting payment:', error);
    }
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setOpen(true);
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0">Payment Verification</h3>      
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
                  <th>AMOUNT</th>
                  <th>PAYMENT METHOD</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.studentName}</td>
                    <td>₱{payment.amount.toLocaleString()}</td>
                    <td>{payment.paymentMethod}</td>
                    <td>{payment.status}</td>
                    <td className='action'>
                      <div className='actions d-flex align-items-center'>
                        <Button 
                          className="secondary" 
                          color="secondary"
                          onClick={() => handleViewDetails(payment)}
                        >
                          <FaEye/>
                        </Button>
                        {payment.status === 'Pending' && (
                          <>
                            <Button 
                              className="success" 
                              color="success"
                              onClick={() => handleVerify(payment._id)}
                            >
                              <FaCheck/>
                            </Button>
                            <Button 
                              className="error" 
                              color="error"
                              onClick={() => handleReject(payment._id)}
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
          p: 0,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          {selectedPayment && (
            <div className="enrollment-details">
              <div className="enrollment-details-header">
                <Typography variant="h5" sx={{ 
                  fontWeight: 'bold',
                  color: '#c70202'
                }}>
                  Payment Details
                </Typography>
              </div>

              <div className="enrollment-info-item">
                <Typography variant="subtitle2" sx={{ color: '#666' }}>Student Name</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedPayment.studentName}
                </Typography>
              </div>

              <div className="enrollment-info-item">
                <Typography variant="subtitle2" sx={{ color: '#666' }}>Amount</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  ₱{selectedPayment.amount.toLocaleString()}
                </Typography>
              </div>

              <div className="enrollment-info-item">
                <Typography variant="subtitle2" sx={{ color: '#666' }}>Payment Method</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedPayment.paymentMethod}
                </Typography>
              </div>

              <div className="enrollment-info-item">
                <Typography variant="subtitle2" sx={{ color: '#666' }}>Reference Number</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedPayment.referenceNumber}
                </Typography>
              </div>

              <div className="enrollment-docs-section">
                <Typography variant="h6" sx={{ 
                  mb: 2,
                  color: '#c70202',
                  fontWeight: 'bold'
                }}>
                  Payment Proof
                </Typography>
                
                <div className="document-preview">
                  {selectedPayment.proofOfPayment ? (
                    <img 
                      src={`data:image/jpeg;base64,${selectedPayment.proofOfPayment}`} 
                      alt="Payment Proof" 
                      style={{ width: '100%', borderRadius: '8px' }}
                    />
                  ) : (
                    <div className="no-doc-message">No payment proof uploaded</div>
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
    </div>
  );
};

export default PaymentVerification;