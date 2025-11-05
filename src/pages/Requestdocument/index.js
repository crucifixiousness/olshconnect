import { Modal, Button, Select, MenuItem, FormControl, InputLabel, Pagination, Box, Typography, TextField, Paper, Grid, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
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
// Request form template preview removed from this page

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
  // removed: showFormPreview (moved to admin view)


  useEffect(() => {
    context.setIsHideComponents(false);
    window.scrollTo(0, 0);
    // Simulate loading time
    setTimeout(() => setLoading(false), 1000);
    fetchStudentProgram();
  }, [context]);

  // Fetch student's program to auto-fill grade/strand/course
  const fetchStudentProgram = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/studentprofile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data?.enrollment?.program) {
        const program = response.data.enrollment.program;
        setStudentProgram(program);
        setNewRequest(prev => ({
          ...prev,
          gradeStrandCourse: program
        }));
      }
    } catch (error) {
      console.error("Error fetching student program:", error);
    }
  };

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

  const [studentProgram, setStudentProgram] = useState("");
  const [newRequest, setNewRequest] = useState({
    id: user?.id || null,
    name: user?.full_name || user?.name || "",
    date: new Date().toISOString().slice(0, 10),
    levelAttended: ["COLLEGE"],
    gradeStrandCourse: "",
    yearGraduated: "",
    academicCredentials: [],
    certification: [],
    doc_type: "",
    description: "",
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
      if (requestDataCache.current.data && 
          requestDataCache.current.timestamp && 
          (now - requestDataCache.current.timestamp) < requestDataCache.current.ttl) {
        setRequestList(requestDataCache.current.data);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.get('/api/request-document', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Update cache
      requestDataCache.current = {
        data: response.data,
        timestamp: now,
        ttl: 5 * 60 * 1000
      };

      setRequestList(response.data);
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
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Handle checkbox arrays (levelAttended, academicCredentials, certification)
      const currentArray = newRequest[name] || [];
      if (checked) {
        setNewRequest({ ...newRequest, [name]: [...currentArray, value] });
      } else {
        setNewRequest({ ...newRequest, [name]: currentArray.filter(item => item !== value) });
      }
    } else {
      setNewRequest({ ...newRequest, [name]: value });
    }
  };

  // Submit new document request
  const handleAddRequest = async (e) => {
    e.preventDefault();

    const { levelAttended, academicCredentials, certification, description, gradeStrandCourse, yearGraduated, date } = newRequest;

    // Validate level attended
    if (!levelAttended || levelAttended.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one level attended.',
        severity: 'error'
      });
      return;
    }

    // Validate at least one academic credential or certification
    if ((!academicCredentials || academicCredentials.length === 0) && 
        (!certification || certification.length === 0)) {
      setSnackbar({
        open: true,
        message: 'Please select at least one academic credential or certification.',
        severity: 'error'
      });
      return;
    }

    // Validate grade/strand/course
    if (!gradeStrandCourse || !gradeStrandCourse.trim()) {
      setSnackbar({
        open: true,
        message: 'Grade/Strand/Course is required. Please ensure your program is properly enrolled.',
        severity: 'error'
      });
      return;
    }

    // Validate date
    if (!date || !date.trim()) {
      setSnackbar({
        open: true,
        message: 'Date is required.',
        severity: 'error'
      });
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      setSnackbar({
        open: true,
        message: 'Invalid date format. Please use YYYY-MM-DD format.',
        severity: 'error'
      });
      return;
    }

    // Validate year graduated (required)
    if (!yearGraduated || !yearGraduated.trim()) {
      setSnackbar({
        open: true,
        message: 'Year Graduated / School Year is required.',
        severity: 'error'
      });
      return;
    }

    const year = parseInt(yearGraduated);
    const currentYear = new Date().getFullYear();
    const minYear = 1950; // Reasonable minimum year
    if (isNaN(year) || year < minYear || year > currentYear + 1) {
      setSnackbar({
        open: true,
        message: `Year graduated must be a valid year between ${minYear} and ${currentYear + 1}.`,
        severity: 'error'
      });
      return;
    }

    // Validate description/purpose
    if (!description || !description.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide a purpose for your request.',
        severity: 'error'
      });
      return;
    }

    // Validate description length
    const trimmedDescription = description.trim();
    if (trimmedDescription.length < 10) {
      setSnackbar({
        open: true,
        message: 'Purpose must be at least 10 characters long. Please provide more details.',
        severity: 'error'
      });
      return;
    }

    if (trimmedDescription.length > 500) {
      setSnackbar({
        open: true,
        message: 'Purpose must not exceed 500 characters.',
        severity: 'error'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post("/api/requesting-document", 
        { 
          description: description,
          form_data: newRequest // Send all form data
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        setRequestList([...requestList, response.data]);
        setShowRequestModal(false);
        setSnackbar({
          open: true,
          message: 'Request added successfully.',
          severity: 'success'
        });
        // Reset form
        setNewRequest({
          id: user?.id || null,
          name: user?.full_name || user?.name || "",
          date: new Date().toISOString().slice(0, 10),
          levelAttended: ["COLLEGE"],
          gradeStrandCourse: studentProgram || "",
          yearGraduated: "",
          academicCredentials: [],
          certification: [],
          doc_type: "",
          description: "",
          requestDate: new Date().toISOString().slice(0, 10),
          status: "Pending",
        });
        fetchRequestData();
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

        {/* Request Form Template preview removed (now shown in admin view) */}

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

      {/* Request Form Preview Modal removed */}

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
          maxWidth: "800px",
          maxHeight: "90vh",
          bgcolor: 'background.paper',
          borderRadius: "10px",
          boxShadow: 24,
          p: 4,
          overflow: 'auto',
        }}>
          <Typography variant="h6" className="hd mb-4" sx={{ color: '#c70202', fontWeight: 'bold' }}>
            Request a Document
          </Typography>
          <form onSubmit={handleAddRequest}>
            <Grid container spacing={2}>
              {/* Date */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Date"
                  name="date"
                  type="date"
                  value={newRequest.date}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  disabled
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#c70202' },
                      '&.Mui-focused fieldset': { borderColor: '#c70202' },
                    },
                  }}
                />
              </Grid>

              {/* Level Attended */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  LEVEL ATTENDED: *
                </Typography>
                <FormGroup>
                  <Grid container spacing={1}>
                    {['COLLEGE'].map((level) => (
                      <Grid item key={level}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="levelAttended"
                              value={level}
                              checked={newRequest.levelAttended.includes(level)}
                              onChange={handleInputChange}
                              sx={{
                                color: '#c70202',
                                '&.Mui-checked': { color: '#c70202' },
                              }}
                            />
                          }
                          label={level}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
              </Grid>

              {/* Grade / Strand / Course */}
              <Grid item xs={12}>
                <TextField
                  label="GRADE / STRAND / COURSE"
                  name="gradeStrandCourse"
                  value={newRequest.gradeStrandCourse || studentProgram}
                  onChange={handleInputChange}
                  fullWidth
                  disabled
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#c70202' },
                      '&.Mui-focused fieldset': { borderColor: '#c70202' },
                    },
                  }}
                />
              </Grid>

              {/* Year Graduated */}
              <Grid item xs={12}>
                <TextField
                  label="YEAR GRADUATED / SCHOOL YEAR"
                  name="yearGraduated"
                  value={newRequest.yearGraduated}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="e.g., 2024"
                  required
                  helperText={newRequest.yearGraduated && (
                    (() => {
                      const year = parseInt(newRequest.yearGraduated);
                      const currentYear = new Date().getFullYear();
                      const minYear = 1950;
                      if (isNaN(year)) {
                        return 'Please enter a valid year (e.g., 2024)';
                      }
                      if (year < minYear || year > currentYear + 1) {
                        return `Year must be between ${minYear} and ${currentYear + 1}`;
                      }
                      return '';
                    })()
                  )}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#c70202' },
                      '&.Mui-focused fieldset': { borderColor: '#c70202' },
                    },
                  }}
                />
              </Grid>

              {/* Academic Credentials */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  ACADEMIC CREDENTIALS: 15 Days Processing
                </Typography>
                <FormGroup>
                  <Grid container spacing={1}>
                    {['DIPLOMA', 'TRANSCRIPT OF RECORDS - College'].map((credential) => (
                      <Grid item xs={12} sm={6} key={credential}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="academicCredentials"
                              value={credential}
                              checked={newRequest.academicCredentials.includes(credential)}
                              onChange={handleInputChange}
                              sx={{
                                color: '#c70202',
                                '&.Mui-checked': { color: '#c70202' },
                              }}
                            />
                          }
                          label={credential}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
              </Grid>

              {/* Certification */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  CERTIFICATION: 5 days Processing
                </Typography>
                <FormGroup>
                  <Grid container spacing={1}>
                    {['ENGLISH AS MEDIUM OF INSTRUCTION', 'ENROLLMENT', 'GRADES (FOR COLLEGE ONLY)', 'GRADUATION', 'GWA / HONORS / AWARDS', 'HONORABLE DISMISSAL'].map((cert) => (
                      <Grid item xs={12} sm={6} key={cert}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="certification"
                              value={cert}
                              checked={newRequest.certification.includes(cert)}
                              onChange={handleInputChange}
                              sx={{
                                color: '#c70202',
                                '&.Mui-checked': { color: '#c70202' },
                              }}
                            />
                          }
                          label={cert}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
              </Grid>

              {/* Purpose (Description) */}
              <Grid item xs={12}>
                <TextField
                  label="PURPOSE"
                  name="description"
                  value={newRequest.description}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                  required
                  placeholder="Please state the purpose of your request"
                  helperText={`${newRequest.description?.length || 0}/500 characters`}
                  inputProps={{ maxLength: 500 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#c70202' },
                      '&.Mui-focused fieldset': { borderColor: '#c70202' },
                    },
                  }}
                />
              </Grid>
            </Grid>

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
