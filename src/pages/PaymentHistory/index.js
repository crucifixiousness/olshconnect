import { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Grid
} from '@mui/material';
import { FaPrint } from 'react-icons/fa';
import axios from 'axios';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [filterProgram, setFilterProgram] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/api/all-payment-history', {
        params: {
          program: filterProgram,
          date: filterDate
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3">
        <Typography variant="h5" className="mb-4">Payment History</Typography>

        {/* Filters */}
        <Paper elevation={3} className="p-3 mb-4">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <Select
                  value={filterProgram}
                  onChange={(e) => setFilterProgram(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">All Programs</MenuItem>
                  <MenuItem value="BSIT">BSIT</MenuItem>
                  <MenuItem value="BSED">BSED</MenuItem>
                  <MenuItem value="BSCRIM">BSCRIM</MenuItem>
                  <MenuItem value="BSHM">BSHM</MenuItem>
                  <MenuItem value="BSOAD">BSOAD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <Button 
                variant="contained"
                onClick={fetchPayments}
                fullWidth
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Payments Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Program</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Reference No.</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Processed By</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.transaction_id}>
                  <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                  <TableCell>{payment.student_name}</TableCell>
                  <TableCell>{payment.program_name}</TableCell>
                  <TableCell>₱{payment.amount_paid.toLocaleString()}</TableCell>
                  <TableCell>{payment.payment_method}</TableCell>
                  <TableCell>{payment.reference_number || '-'}</TableCell>
                  <TableCell>{payment.payment_status}</TableCell>
                  <TableCell>{payment.processed_by_name}</TableCell>
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
      </div>
    </div>
  );
};

export default PaymentHistory;