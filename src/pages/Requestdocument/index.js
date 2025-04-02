import { Modal, Button, Select, MenuItem, FormControl, InputLabel, Pagination, Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCirclePlus } from "react-icons/fa6";
import { Snackbar, Alert } from '@mui/material';
import { useCallback } from 'react';

const RequestDocument = () => {
  // eslint-disable-next-line
  const [isLoading, setIsLoading] = useState(false);
  const [requestList, setRequestList] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [page, setPage] = useState(1); // Pagination state
  const handleOpen = () => setShowRequestModal(true);
  const handleClose = () => setShowRequestModal(false);
  const user = JSON.parse(localStorage.getItem("user")); 
  const [newRequest, setNewRequest] = useState({
    id: user ? user.id : null,
    doc_type: "", // Changed from documentType
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
      const response = await axios.get(`http://localhost:4000/requests/student/${user.id}`);
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
  
    const { id, doc_type } = newRequest;
  
    if (!id || !doc_type) {
      setSnackbar({
        open: true,
        message: 'Both student ID and document type are required.',
        severity: 'error'
      });
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:4000/requests", newRequest);
      
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

  // Add this component before the closing div of your return statement
  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0">Document Request Management</h3>
      </div>

      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd">Requested Documents</h3>

        <div className="addreq d-flex justify-content-end mb-3">
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
          >
            <FaCirclePlus/> Request Document
          </Button>
        </div>

        <div className="table-responsive mt-3">
          <table className="table table-bordered v-align">
            <thead className="thead-dark">
              <tr>
                <th>Document Type</th>
                <th>Date of Request</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map((request) => (
                <tr key={request.req_id}> {/* Use request_id from backend */}
                  <td>{request.doc_type}</td>
                  <td>{new Date(request.req_date).toLocaleDateString()}</td>
                  <td>{request.req_status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>
                  No document requests available.
                </td>
              </tr>
            )}
          </tbody>
          </table>

          {/* Pagination */}
          <div className="d-flex justify-content-center mt-3">
            <Pagination
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

      {/* Request Document Modal */}
      <Modal
        open={showRequestModal}
        onClose={handleClose}
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
        open={snackbar.open}
        autoHideDuration={4000}
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

export default RequestDocument;
