import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Button, 
  Pagination, 
  Snackbar, 
  Alert, 
  Paper, 
  Grid, 
  Typography, 
  TextField, 
  FormControl, 
  Select, 
  MenuItem, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Box,
  CircularProgress
} from '@mui/material';
import { FaCheck } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";

const DocumentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filterBy, setFilterBy] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add new state for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Update fetchRequests function
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/requests-all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch document requests',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Update handleStatusUpdate function
  const handleStatusUpdate = async (reqId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/update-request-status?req_id=${reqId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setSnackbar({
        open: true,
        message: `Request ${newStatus.toLowerCase()} successfully`,
        severity: 'success'
      });
      
      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update request status',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter requests based on document type and search term
  const filteredRequests = requests.filter(request => {
    const matchesSearch = !searchTerm || 
      request.doc_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${request.first_name} ${request.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !filterBy || request.doc_type === filterBy;
    
    return matchesSearch && matchesFilter;
  });

  // Pagination calculations
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);
  const pageCount = Math.ceil(filteredRequests.length / rowsPerPage);

  const formatStudentName = (firstName, middleName, lastName, suffix) => {
    const middleInitial = middleName ? ` ${middleName.charAt(0)}.` : '';
    const suffixText = suffix ? ` ${suffix}` : '';
    return `${lastName}, ${firstName}${middleInitial}${suffixText}`;
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
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

  return (
    <div className="right-content w-100" data-testid="document-requests-page">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0" data-testid="page-title" style={{ color: '#c70202', fontWeight: 'bold' }}>
          Document Requests Management
        </h3>
      </div>

      <div className="card shadow border-0 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="hd" data-testid="section-title" style={{ color: '#c70202', fontWeight: 'bold' }}>
            Requested Documents
          </h3>
        </div>

        {/* Filters */}
        <Paper elevation={3} className="p-3 mb-4">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={4}>
              <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>SEARCH</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by document type or student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>DOCUMENT TYPE</Typography>
              <FormControl fullWidth size="small">
                <Select
                  data-testid="document-filter"
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
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
                  <MenuItem value="">
                    <em>All Documents</em>
                  </MenuItem>
                  <MenuItem value="Certificate of Grades">Certificate of Grades</MenuItem>
                  <MenuItem value="Good Moral Certificate">Good Moral Certificate</MenuItem>
                  <MenuItem value="Diploma">Diploma</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>&nbsp;</Typography>
              <Button 
                variant="contained"
                onClick={fetchRequests}
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
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Student Name</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Document Type</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Request Date</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Status</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRequests.length > 0 ? (
                paginatedRequests.map((request) => (
                  <TableRow 
                    key={request.req_id} 
                    data-testid={`request-row-${request.req_id}`}
                    sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {formatStudentName(
                          request.first_name,
                          request.middle_name,
                          request.last_name,
                          request.suffix
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.doc_type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(request.req_date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: 
                            request.req_status === 'Approved' ? '#e8f5e8' :
                            request.req_status === 'Rejected' ? '#ffeaea' :
                            '#fff3e0',
                          color: 
                            request.req_status === 'Approved' ? '#2e7d32' :
                            request.req_status === 'Rejected' ? '#d32f2f' :
                            '#ed6c02',
                          fontWeight: 'medium',
                          fontSize: '0.875rem'
                        }}
                      >
                        {request.req_status}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="contained"
                          size="small"
                          data-testid={`approve-button-${request.req_id}`}
                          aria-label={`Approve request for ${request.first_name} ${request.last_name}`}
                          onClick={() => handleStatusUpdate(request.req_id, 'Approved')}
                          disabled={request.req_status !== 'Pending'}
                          sx={{
                            bgcolor: '#2e7d32',
                            '&:hover': {
                              bgcolor: '#1b5e20',
                            },
                            '&:disabled': {
                              bgcolor: '#ccc',
                            },
                            minWidth: 'auto',
                            px: 1
                          }}
                        >
                          <FaCheck size={14} />
                        </Button>
                        <Button 
                          variant="contained"
                          size="small"
                          data-testid={`reject-button-${request.req_id}`}
                          aria-label={`Reject request for ${request.first_name} ${request.last_name}`}
                          onClick={() => handleStatusUpdate(request.req_id, 'Rejected')}
                          disabled={request.req_status !== 'Pending'}
                          sx={{
                            bgcolor: '#d32f2f',
                            '&:hover': {
                              bgcolor: '#c62828',
                            },
                            '&:disabled': {
                              bgcolor: '#ccc',
                            },
                            minWidth: 'auto',
                            px: 1
                          }}
                        >
                          <FaXmark size={14} />
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="5" style={{ textAlign: "center" }} data-testid="no-data-message">
                    <Typography variant="body1" color="textSecondary" sx={{ py: 4 }}>
                      {searchTerm || filterBy ? 'No requests found matching your filters' : 'No document requests available'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {filteredRequests.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              data-testid="pagination"
              count={pageCount}
              page={page}
              onChange={handlePageChange}
              color="primary" 
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
          </Box>
        )}
      </div>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DocumentRequests;
