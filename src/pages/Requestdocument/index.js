import { Modal, Button, Select, MenuItem, FormControl, InputLabel, Pagination, Box, Typography, TextField, Paper, Grid, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FaCirclePlus } from "react-icons/fa6";
import { Snackbar, Alert } from '@mui/material';
import { useCallback } from 'react';
import { MyContext } from '../../App';
import { FaEye } from "react-icons/fa";
import { IconButton, Dialog } from '@mui/material';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { useRef } from 'react';

const RequestDocument = () => {
  // eslint-disable-next-line
  const [isLoading, setIsLoading] = useState(false);
  const [requestList, setRequestList] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [page, setPage] = useState(1); // Pagination state
  const handleOpen = () => setShowRequestModal(true);
  const handleClose = () => setShowRequestModal(false);
  const context = useContext(MyContext);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const pdfCache = useRef(new Map());


  useEffect(() => {
    context.setIsHideComponents(false);
    window.scrollTo(0, 0);
    // Simulate loading time
    setTimeout(() => setLoading(false), 1000);
  }, [context]);
  
  // Add safe parsing of user data
  const user = (() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  })();

  const [newRequest, setNewRequest] = useState({
    id: user?.id || null,
    doc_type: "",
    description: "", // Added description field
    requestDate: new Date().toISOString().slice(0, 10),
    status: "Pending",
  });
  const [rowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Filter requests
  const filteredRequests = requestList.filter(request => {
    const matchesSearch = !searchTerm || 
      request.doc_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || request.req_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);
  const pageCount = Math.ceil(filteredRequests.length / rowsPerPage);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Add this near other useRef declarations
  const requestDataCache = useRef({
    data: null,
    timestamp: null,
    ttl: 5 * 60 * 1000 // 5 minutes cache TTL
  });

  const fetchRequestData = useCallback(async () => {
    try {
      if (!user || !user.id) {
        console.error("No user ID found");
        return;
      }

      // Check if cache is valid
      const now = Date.now();
      const cacheAge = requestDataCache.current.timestamp ? (now - requestDataCache.current.timestamp) : Infinity;
      
      // If cache exists and is valid (and not too recent - might miss new submissions), use it
      // For very recent cache (< 30 seconds), still fetch fresh to catch any new submissions
      if (requestDataCache.current.data && 
          requestDataCache.current.timestamp && 
          cacheAge < requestDataCache.current.ttl &&
          cacheAge >= 30000) { // Only use cache if it's at least 30 seconds old
        setRequestList(requestDataCache.current.data);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.get('/api/request-document', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Sort requests by date (newest first) before caching and setting state
      const sortedData = [...response.data].sort((a, b) => {
        const dateA = new Date(a.req_date || a.requestDate || 0);
        const dateB = new Date(b.req_date || b.requestDate || 0);
        return dateB - dateA; // Descending order (newest first)
      });

      // Update cache with sorted data
      requestDataCache.current = {
        data: sortedData,
        timestamp: now,
        ttl: 5 * 60 * 1000
      };

      setRequestList(sortedData);
    } catch (error) {
      console.error("Error fetching request data:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchRequestData();
  }, [fetchRequestData]);

  useEffect(() => {
    if (user) {
      fetchRequestData();
    }
  }, [user, fetchRequestData]); // Add both dependencies

  // Handle new request input changes
  const handleInputChange = (e) => {
    setNewRequest({ ...newRequest, [e.target.name]: e.target.value });
  };

  // Submit new document request
  const handleAddRequest = async (e) => {
    e.preventDefault();
  
    const { doc_type, description } = newRequest;
  
    if (!doc_type) {
      setSnackbar({
        open: true,
        message: 'Document type is required.',
        severity: 'error'
      });
      return;
    }

    if (!description.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide a reason for your request.',
        severity: 'error'
      });
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post("/api/requesting-document", 
        { doc_type, description }, // Include description in request
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 201) {
        const newRequest = response.data;
        
        // Immediately update cache and state with the new request
        const now = Date.now();
        const currentCache = requestDataCache.current.data || [];
        
        // Add new request to the beginning of the list (newest first)
        const updatedList = [newRequest, ...currentCache].sort((a, b) => {
          const dateA = new Date(a.req_date || a.requestDate || 0);
          const dateB = new Date(b.req_date || b.requestDate || 0);
          return dateB - dateA; // Descending order (newest first)
        });
        
        // Update cache immediately
        requestDataCache.current = {
          data: updatedList,
          timestamp: now,
          ttl: 5 * 60 * 1000
        };
        
        // Update state immediately for instant UI update
        setRequestList(updatedList);
        
        setShowRequestModal(false);
        setSnackbar({
          open: true,
          message: 'Request added successfully.',
          severity: 'success'
        });
        // Reset form
        setNewRequest({
          id: user?.id || null,
          doc_type: "",
          description: "",
          requestDate: new Date().toISOString().slice(0, 10),
          status: "Pending",
        });
        // Reset pagination to show first page
        setPage(1);
        
        // Background fetch to ensure data consistency (don't await)
        fetchRequestData().catch(err => {
          console.error("Background fetch error:", err);
          // If background fetch fails, keep the optimistic update
        });
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'An unexpected error occurred.',
        severity: 'error'
      });
    }
  };

  const handleViewDocument = async (request) => {
    try {
      // Check cache first
      const cachedPdf = pdfCache.current.get(request.req_id);
      if (cachedPdf) {
        setPdfUrl(cachedPdf);
        setShowPdfModal(true);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/generate-document`, {
        params: { req_id: request.req_id },
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        responseType: 'arraybuffer',
        validateStatus: false
      });

      if (response.status !== 200) {
        const errorMessage = new TextDecoder().decode(response.data);
        throw new Error(errorMessage);
      }

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Cache the PDF URL
      pdfCache.current.set(request.req_id, pdfUrl);
      
      setPdfUrl(pdfUrl);
      setShowPdfModal(true);
    } catch (error) {
      console.error('Error fetching PDF:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to load document',
        severity: 'error'
      });
    }
  };

  const handleClosePdfModal = () => {
    setShowPdfModal(false);
    // Don't revoke cached URLs
    if (pdfUrl && !pdfCache.current.has(pdfUrl)) {
      URL.revokeObjectURL(pdfUrl);
    }
  };

  // Add this function to handle PDF download
  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'certificate-of-grades.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="right-content w-100" data-testid="request-document-page">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0" data-testid="page-title">Document Request Management</h3>
      </div>

      <div className="card shadow border-0 p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="hd">Requested Documents</h3>
          <Button
            variant="contained"
            onClick={handleOpen}
            data-testid="request-document-button"
            sx={{
              bgcolor: '#c70202',
              '&:hover': {
                bgcolor: '#a00000',
              },
            }}
          >
            <FaCirclePlus/> Request Document
          </Button>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
            <CircularProgress style={{ color: '#c70202' }} />
          </div>
        ) : (
          <>
            {/* Filters */}
            <Paper elevation={3} className="p-3 mb-4">
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>SEARCH</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by document type or reason..."
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
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>STATUS</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
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
                        <em>All Status</em>
                      </MenuItem>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Approved">Approved</MenuItem>
                      <MenuItem value="Rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>&nbsp;</Typography>
                  <Button 
                    variant="contained"
                    onClick={fetchRequestData}
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
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Document Type</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Reason/Description</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Date of Request</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Status</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRequests.length > 0 ? (
                    paginatedRequests.map((request, index) => (
                      <TableRow key={request.req_id} data-testid={`request-row-${index}`}>
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
                          {request.req_status}
                        </TableCell>
                        <TableCell>
                          {request.req_status === 'Approved' ? (
                            request.doc_type === 'Certificate of Grades' ? (
                              <IconButton
                                onClick={() => handleViewDocument(request)}
                                color="primary"
                                size="small"
                                title="View Certificate of Grades"
                                data-testid={`view-button-${index}`}
                              >
                                <FaEye />
                              </IconButton>
                            ) : (
                              <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                                Ready for Pickup
                              </Typography>
                            )
                          ) : request.req_status === 'Pending' ? (
                            <Typography variant="body2" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                              Under Review
                            </Typography>
                          ) : request.req_status === 'Rejected' ? (
                            <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                              Request Denied
                            </Typography>
                          ) : (
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              —
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan="5" style={{ textAlign: "center" }} data-testid="no-requests-message">
                        {searchTerm || statusFilter ? 'No requests found matching your filters' : 'No document requests available.'}
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
          </>
        )}
      </div>

      <Dialog
        open={showPdfModal}
        onClose={handleClosePdfModal}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ height: '80vh', position: 'relative' }}>
          <Button
            onClick={handleDownload}
            variant="contained"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 1,
              bgcolor: '#c70202',
              '&:hover': {
                bgcolor: '#a00000',
              }
            }}
          >
            Download PDF
          </Button>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            {pdfUrl && (
              <Viewer fileUrl={pdfUrl} />
            )}
          </Worker>
        </Box>
      </Dialog>

      {/* Request Document Modal */}
      <Modal
        open={showRequestModal}
        onClose={handleClose}
        data-testid="request-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: "90%",
          maxWidth: "500px",
          bgcolor: 'background.paper',
          borderRadius: "10px",
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h6" className="hd mb-4" sx={{ color: '#c70202', fontWeight: 'bold' }}>
            Request a Document
          </Typography>
          <form onSubmit={handleAddRequest}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="document-type-label">Document Type</InputLabel>
              <Select
                labelId="document-type-label"
                name="doc_type"
                value={newRequest.doc_type}
                onChange={handleInputChange}
                label="Document Type"
                required
                aria-label="Document Type"
                data-testid="document-type-select"
                data-value={newRequest.doc_type}
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
                <MenuItem value="Certificate of Grades">Certificate of Grades</MenuItem>
                <MenuItem value="Good Moral Certificate">Good Moral Certificate</MenuItem>
                <MenuItem value="Diploma">Diploma</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Reason for Request"
              name="description"
              value={newRequest.description}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              placeholder="Please explain why you need this document (e.g., job application, scholarship, transfer, etc.)"
              required
              data-testid="description-input"
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

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button 
                onClick={handleClose}
                variant="outlined"
                sx={{
                  borderColor: '#c70202',
                  color: '#c70202',
                  '&:hover': {
                    borderColor: '#a00000',
                    color: '#a00000',
                  },
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                disabled={isLoading}
                data-testid="submit-request-button"
                sx={{
                  bgcolor: '#c70202',
                  '&:hover': {
                    bgcolor: '#a00000',
                  },
                  '&:disabled': {
                    bgcolor: '#ccc',
                  },
                }}
              >
                {isLoading ? "Requesting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Box>
      </Modal>
      
      {/* Add this before the closing div */}
      <Snackbar
        data-testid="snackbar"
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          data-testid="snackbar-alert"
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

export default RequestDocument;
