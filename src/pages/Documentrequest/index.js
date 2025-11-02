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
import { sendDocumentApprovalEmail, sendDocumentRejectionEmail } from '../../utils/documentEmailService';

const DocumentRequests = () => {
  const [filterBy, setFilterBy] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Check localStorage cache synchronously on mount (like Academic Records)
  const cachedData = localStorage.getItem('documentRequestsData');
  const cacheTimestamp = localStorage.getItem('documentRequestsTimestamp');
  const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : null;
  const hasValidCache = cachedData && cacheAge && cacheAge < 300000; // 5 minutes

  // Initialize state with cached data if available, otherwise empty
  const [requests, setRequests] = useState(hasValidCache ? (JSON.parse(cachedData) || []) : []);
  const [loading, setLoading] = useState(!hasValidCache); // Only show loading if no valid cache

  // Add new state for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Update fetchRequests function
  const fetchRequests = async (forceRefresh = false) => {
    try {
      // Check cache first (like Academic Records and Student Profile), unless forcing refresh
      if (!forceRefresh) {
        const cachedData = localStorage.getItem('documentRequestsData');
        const cacheTimestamp = localStorage.getItem('documentRequestsTimestamp');
        const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : null;

        // Use cache if it's less than 5 minutes old
        if (cachedData && cacheAge && cacheAge < 300000) {
          const parsedData = JSON.parse(cachedData);
          setRequests(parsedData);
          setLoading(false);
          
          // Always do background refresh to check for updates (new requests, status changes, etc.)
          fetchRequests(true).catch(err => {
            console.error("Background refresh error:", err);
            // Keep showing cached data if background refresh fails
          });
          return;
        }
      }

      // Only show loading if not forcing refresh (we already have data in background refresh)
      if (!forceRefresh) {
        setLoading(true);
      }

      const token = localStorage.getItem('token');
      const response = await axios.get('/api/requests-all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Cache the fetched data
      localStorage.setItem('documentRequestsData', JSON.stringify(response.data));
      localStorage.setItem('documentRequestsTimestamp', Date.now().toString());
      
      setRequests(response.data);
      
      // Only update loading if not forcing refresh
      if (!forceRefresh) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch document requests',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  // Update handleStatusUpdate function
  const handleStatusUpdate = async (reqId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      // First, get the request details before updating
      const request = requests.find(req => req.req_id === reqId);
      if (!request) {
        throw new Error('Request not found');
      }

      // Update the status in the database
      await axios.put(`/api/update-request-status?req_id=${reqId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Send email notification based on status
      if (newStatus === 'Approved') {
        console.log('📧 Sending approval email to:', request.email);
        console.log('📧 Request data:', {
          email: request.email,
          name: `${request.first_name} ${request.last_name}`,
          docType: request.doc_type,
          reqDate: request.req_date
        });
        
        if (!request.email) {
          console.error('❌ No email found for student:', request);
          setSnackbar({
            open: true,
            message: 'Request approved but no email found for student',
            severity: 'warning'
          });
        } else {
          const emailResult = await sendDocumentApprovalEmail(
            request.email,
            `${request.first_name} ${request.last_name}`,
            request.doc_type,
            request.req_date
          );
          
          if (emailResult.success) {
            // Email sent successfully
          } else {
            console.error('Failed to send approval email:', emailResult.message);
          }
        }
      } else if (newStatus === 'Rejected') {
        const emailResult = await sendDocumentRejectionEmail(
          request.email,
          `${request.first_name} ${request.last_name}`,
          request.doc_type,
          request.req_date,
          'Please contact the registrar office for more information.'
        );
        
        if (emailResult.success) {
          // Email sent successfully
        } else {
          console.error('Failed to send rejection email:', emailResult.message);
        }
      }
      
      setSnackbar({
        open: true,
        message: `Request ${newStatus.toLowerCase()} successfully and email notification sent`,
        severity: 'success'
      });
      
      // Invalidate cache and force refresh to show updated status
      localStorage.removeItem('documentRequestsData');
      localStorage.removeItem('documentRequestsTimestamp');
      fetchRequests(true);
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
      `${request.first_name} ${request.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const getRequestStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return {
          backgroundColor: '#28a745', // Green - Approved
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600'
        };
      case 'rejected':
        return {
          backgroundColor: '#dc3545', // Red - Rejected
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600'
        };
      case 'pending':
        return {
          backgroundColor: '#ffc107', // Yellow - Pending
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600'
        };
      default:
        return {
          backgroundColor: '#6c757d', // Gray - Unknown status
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600'
        };
    }
  };

  return (
    <div className="right-content w-100" data-testid="document-requests-page">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0" data-testid="page-title">Document Requests Management</h3>
      </div>

      <div className="card shadow border-0 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="hd" data-testid="section-title">Requested Documents</h3>
        </div>

        {/* Filters */}
        <Paper elevation={3} className="p-3 mb-4">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={3}>
              <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>SEARCH</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by document type, student name, or reason..."
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
            <Grid item xs={3}>
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
            <Grid item xs={3}>
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Student Name</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Document Type</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Reason/Description</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Request Date</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Status</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="6" style={{ textAlign: "center" }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                      <CircularProgress style={{ color: '#c70202' }} />
                      <Typography variant="body2" sx={{ ml: 2, color: '#666' }}>
                        Loading document requests...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginatedRequests.length > 0 ? (
                paginatedRequests.map((request, index) => (
                  <TableRow key={request.req_id} data-testid={`request-row-${index}`}>
                    <TableCell data-testid={`student-name-${index}`}>
                      {formatStudentName(
                        request.first_name,
                        request.middle_name,
                        request.last_name,
                        request.suffix
                      )}
                    </TableCell>
                    <TableCell data-testid={`doc-type-${index}`}>
                      {request.doc_type}
                    </TableCell>
                    <TableCell data-testid={`description-${index}`}>
                      {request.description || 'No reason provided'}
                    </TableCell>
                    <TableCell data-testid={`date-${index}`}>
                      {new Date(request.req_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell data-testid={`status-${index}`}>
                      <span style={getRequestStatusColor(request.req_status)}>
                        {request.req_status}
                      </span>
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
                  <TableCell colSpan="6" style={{ textAlign: "center" }} data-testid="no-data-message">
                    {searchTerm || filterBy ? 'No requests found matching your filters' : 'No document requests available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {filteredRequests.length > 0 && (
          <div className="d-flex justify-content-center mt-4">
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
          </div>
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
