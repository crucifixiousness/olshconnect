import { Modal, Button, Select, MenuItem, FormControl, InputLabel, Pagination, Box, Typography } from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FaCirclePlus } from "react-icons/fa6";
import { Snackbar, Alert, CircularProgress } from '@mui/material';
import { useCallback } from 'react';
import { MyContext } from '../../App';
import { FaEye } from "react-icons/fa";
import { IconButton, Dialog } from '@mui/material';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

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

  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

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
    requestDate: new Date().toISOString().slice(0, 10),
    status: "Pending",
  });
  const [rowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });


  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRequests = requestList.slice(startIndex, endIndex);
  const pageCount = Math.ceil(requestList.length / rowsPerPage);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };



  const fetchRequestData = useCallback(async () => {
    try {
      if (!user || !user.id) {
        console.error("No user ID found");
        return;
      }
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/request-document', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
    setNewRequest({ ...newRequest, [e.target.name]: e.target.value });
  };

  // Submit new document request
  const handleAddRequest = async (e) => {
    e.preventDefault();
  
    const { doc_type } = newRequest;
  
    if (!doc_type) {
      setSnackbar({
        open: true,
        message: 'Document type is required.',
        severity: 'error'
      });
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post("/api/requesting-document", 
        { doc_type }, 
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
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/generate-document/${request.req_id}`, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      // Convert base64 to blob
      const pdfBlob = new Blob(
        [Uint8Array.from(atob(response.data.data), c => c.charCodeAt(0))],
        { type: 'application/pdf' }
      );
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
      setShowPdfModal(true);
    } catch (error) {
      console.error('Error fetching PDF:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load document',
        severity: 'error'
      });
    }
  };

  // Add this function to handle PDF download
  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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

  // Add this component before the closing div of your return statement
  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0" data-testid="page-title">Document Request Management</h3>
      </div>

      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd">Requested Documents</h3>

        <div className="addreq d-flex justify-content-end mb-3">
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            data-testid="request-document-button"
          >
            <FaCirclePlus/> Request Document
          </Button>
        </div>

        <div className="table-responsive mt-3">
          <table className="table table-bordered v-align" data-testid="requests-table">
            <thead className="thead-dark">
              <tr>
                <th>Document Type</th>
                <th>Date of Request</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map((request) => (
                <tr key={request.req_id}>
                  <td>{request.doc_type}</td>
                  <td>{new Date(request.req_date).toLocaleDateString()}</td>
                  <td>{request.req_status}</td>
                  <td>
                    {request.req_status === 'Approved' && (
                      <IconButton
                        onClick={() => handleViewDocument(request)}
                        color="primary"
                        size="small"
                        title="View Document"
                      >
                        <FaEye />
                      </IconButton>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }} data-testid="no-requests-message">
                  No document requests available.
                </td>
              </tr>
            )}
          </tbody>
          </table>

          {/* Pagination */}
          <div className="d-flex justify-content-center mt-3">
            <Pagination
              data-testid="pagination"
              count={pageCount}
              page={page}
              onChange={(e, newPage) => setPage(newPage)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </div>
        </div>
      </div>

      <Dialog
      open={showPdfModal}
      onClose={() => setShowPdfModal(false)}
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
          <Typography variant="h6" className="hd mb-4">Request a Document</Typography>
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
                data-value={newRequest.doc_type} // Add this line
              >
                <MenuItem value="Certificate of Grades">Certificate of Grades</MenuItem>
                <MenuItem value="Good Moral Certificate">Good Moral Certificate</MenuItem>
                <MenuItem value="Diploma">Diploma</MenuItem>
              </Select>
            </FormControl>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button onClick={handleClose}>Cancel</Button>
              <Button 
                type="submit" 
                variant="contained"
                disabled={isLoading}
                data-testid="submit-request-button"
                sx={{
                  bgcolor: '#c70202',
                  '&:hover': {
                    bgcolor: '#a00000',
                  }
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
