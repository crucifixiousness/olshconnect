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
import olshcoLogo from '../../asset/images/olshco-logo1.png';

const RequestDocument = () => {
  // eslint-disable-next-line
  const [isLoading, setIsLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [page, setPage] = useState(1); // Pagination state
  const handleOpen = () => setShowRequestModal(true);
  const handleClose = () => setShowRequestModal(false);
  const context = useContext(MyContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const pdfCache = useRef(new Map());
  const [showFormPreview, setShowFormPreview] = useState(false);

  // Check localStorage cache synchronously on mount (like Academic Records)
  const cachedData = localStorage.getItem('requestDocumentData');
  const cacheTimestamp = localStorage.getItem('requestDocumentTimestamp');
  const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : null;
  const hasValidCache = cachedData && cacheAge && cacheAge < 300000; // 5 minutes

  // Initialize state with cached data if available, otherwise empty
  const [requestList, setRequestList] = useState(hasValidCache ? (JSON.parse(cachedData) || []) : []);
  const [loading, setLoading] = useState(!hasValidCache); // Only show loading if no valid cache

  useEffect(() => {
    context.setIsHideComponents(false);
    window.scrollTo(0, 0);
    fetchRequestData();
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

  const fetchRequestData = useCallback(async (forceRefresh = false) => {
    try {
      if (!user || !user.id) {
        console.error("No user ID found");
        return;
      }

      // Check cache first (like Academic Records and Student Profile), unless forcing refresh
      if (!forceRefresh) {
        const cachedData = localStorage.getItem('requestDocumentData');
        const cacheTimestamp = localStorage.getItem('requestDocumentTimestamp');
        const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : null;

        // Use cache if it's less than 5 minutes old
        if (cachedData && cacheAge && cacheAge < 300000) {
          const parsedData = JSON.parse(cachedData);
          setRequestList(parsedData);
          setLoading(false);
          
          // Always do background refresh to check for status updates (approvals, rejections, etc.)
          // This ensures status changes appear on next navigation
          fetchRequestData(true).catch(err => {
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
      const response = await axios.get('/api/request-document', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Sort requests by date (newest first) before caching and setting state
      const sortedData = [...response.data].sort((a, b) => {
        const dateA = new Date(a.req_date || a.requestDate || 0);
        const dateB = new Date(b.req_date || b.requestDate || 0);
        return dateB - dateA; // Descending order (newest first)
      });

      // Cache the new data (like Academic Records and Student Profile)
      localStorage.setItem('requestDocumentData', JSON.stringify(sortedData));
      localStorage.setItem('requestDocumentTimestamp', Date.now().toString());

      setRequestList(sortedData);
      
      // Only update loading if not forcing refresh
      if (!forceRefresh) {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching request data:", error);
      setLoading(false);
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
        // Invalidate cache and refetch from server (no optimistic update)
        try {
          localStorage.removeItem('requestDocumentData');
          localStorage.removeItem('requestDocumentTimestamp');
        } catch (e) {
          // ignore storage errors
        }

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

        // Force refresh to get true server state
        fetchRequestData(true).catch(err => {
          console.error("Background fetch error:", err);
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
        <div className="mb-3">
          <Button
            variant="outlined"
            onClick={() => setShowFormPreview(true)}
            sx={{ borderColor: '#c70202', color: '#c70202', '&:hover': { borderColor: '#a00000', color: '#a00000' } }}
          >
            View Request Form Template
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

      {/* Request Form Preview Modal */}
      <Dialog
        open={showFormPreview}
        onClose={() => setShowFormPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Paper variant="outlined" sx={{ p: 2, borderWidth: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 56, height: 56, border: '1px solid #999', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff' }}>
                    <img src={olshcoLogo} alt="School logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>REQUEST FORM</Typography>
                    <Typography variant="body2">PAASCU ACCREDITED</Typography>
                    <Typography variant="body2">ISO ACCREDITED</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Grid container>
                  <Grid item xs={8}>
                    <Box sx={{ border: '1px solid #000', p: 1 }}>
                      <Grid container>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Document Code:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>ACAD-REG-FM-001</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Effectivity Date:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>April 12, 2024</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Revision No.</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>0</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ border: '1px solid #000', borderLeft: 'none', height: '100%', p: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Page</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>1 of 1</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, border: '1px solid #000' }}>
              <Grid container>
                <Grid item xs={9} sx={{ borderRight: '1px solid #000' }}>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>NAME:</Typography>
                    <Typography variant="caption">(Please use MAIDEN NAME for MARRIED Alumna) (Apilido noong Dalaga)</Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Date:</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ borderTop: '1px solid #000', p: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>LEVEL ATTENDED:</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {['PS/GS','HS','JHS','SHS','COLLEGE'].map((label) => (
                    <Grid item key={label}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 14, height: 14, border: '1px solid #000' }} />
                        <Typography variant="body2">{label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box sx={{ borderTop: '1px solid #000', p: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>GRADE / STRAND / COURSE:</Typography>
              </Box>

              <Box sx={{ borderTop: '1px solid #000', p: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>YEAR GRADUATED / SCHOOL YEAR:</Typography>
              </Box>

              <Box sx={{ borderTop: '1px solid #000', p: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>ACADEMIC CREDENTIALS: 15 Days Processing</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {['DIPLOMA','F137 / SF10 - PS / GS / JHS / SHS','TRANSCRIPT OF RECORDS - College'].map((label) => (
                    <Grid item xs={12} md={6} key={label}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 14, height: 14, border: '1px solid #000' }} />
                        <Typography variant="body2">{label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box sx={{ borderTop: '1px solid #000', p: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>CERTIFICATION: 5 days Processing</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {['ENGLISH AS MEDIUM OF INSTRUCTION','ENROLLMENT','GRADES (FOR COLLEGE ONLY)','GRADUATION','GWA / HONORS / AWARDS','HONORABLE DISMISSAL'].map((label) => (
                    <Grid item xs={12} md={6} key={label}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 14, height: 14, border: '1px solid #000' }} />
                        <Typography variant="body2">{label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box sx={{ borderTop: '1px solid #000', p: 1, minHeight: 64 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>PURPOSE:</Typography>
              </Box>

              <Grid container sx={{ borderTop: '1px solid #000' }}>
                <Grid item xs={6} sx={{ borderRight: '1px solid #000' }}>
                  <Box sx={{ p: 1, minHeight: 64 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>REQUESTED BY:</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1, minHeight: 64 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>ACCOUNTING OFFICE:</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={() => setShowFormPreview(false)} variant="contained" sx={{ bgcolor: '#c70202', '&:hover': { bgcolor: '#a00000' } }}>
                Close
              </Button>
            </Box>
          </Paper>
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
