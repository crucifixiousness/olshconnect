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
  Grid,
  Pagination,
  CircularProgress
} from '@mui/material';
import { FaPrint } from 'react-icons/fa';
import axios from 'axios';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [filterProgram, setFilterProgram] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedPayments = payments.slice(startIndex, endIndex);
  const pageCount = Math.ceil(payments.length / rowsPerPage);

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0">Payment History</h3>
      </div>
      <div className="card shadow border-0 p-3">
        {/* Filters */}
        <Paper elevation={3} className="p-3 mb-4">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <Select
                  value={filterProgram}
                  onChange={(e) => setFilterProgram(e.target.value)}
                  displayEmpty
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#c70202',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#c70202',
                      },
                    },
                  }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#c70202',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#c70202',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <Button 
                variant="contained"
                onClick={fetchPayments}
                fullWidth
                sx={{
                  bgcolor: '#c70202',
                  '&:hover': {
                    bgcolor: '#a00000',
                  },
                }}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Student Name</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Program</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Amount Paid</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Payment Method</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Payment Date</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Reference Number</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="7" style={{ textAlign: "center", padding: "40px 0" }}>
                    <CircularProgress style={{ color: '#c70202' }} />
                  </TableCell>
                </TableRow>
              ) : paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment) => (
                  <TableRow key={payment.transaction_id}>
                    <TableCell>{payment.student_name}</TableCell>
                    <TableCell>{payment.program_name}</TableCell>
                    <TableCell>₱{parseFloat(payment.amount_paid).toLocaleString()}</TableCell>
                    <TableCell>{payment.payment_method}</TableCell>
                    <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell>{payment.reference_number}</TableCell>
                    <TableCell>
                      <span className={`badge ${payment.payment_status === 'Fully Paid' ? 'bg-success' : 'bg-warning'}`}>
                        {payment.payment_status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="7" style={{ textAlign: "center" }}>
                    No payment records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {payments.length > 0 && (
          <div className="d-flex justify-content-center mt-4">
            <Pagination 
              count={pageCount}
              page={page}
              onChange={handlePageChange}
              color="primary" 
              className="pagination"
              showFirstButton 
              showLastButton 
              sx={{
                '& .MuiPaginationItem-root': {
                  '&.Mui-selected': {
                    bgcolor: '#c70202',
                    '&:hover': {
                      bgcolor: '#a00000',
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
