import { Modal, Button, Select, MenuItem, FormControl, InputLabel, Pagination } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCirclePlus } from "react-icons/fa6";

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

  // Fetch existing document requests on component mount
  useEffect(() => {
    fetchRequestData(); // Call fetchRequestData when component mounts
  }, []); // Page dependency to fetch data again on page change

  const fetchRequestData = async () => {
    try {
      const response = await axios.get("http://localhost:4000/requests");
      setRequestList(response.data); // Set the full list of requests
    } catch (error) {
      console.error("Error fetching request data:", error);
    }
  };

  // Handle new request input changes
  const handleInputChange = (e) => {
    setNewRequest({ ...newRequest, [e.target.name]: e.target.value });
  };

  // Submit new document request
  const handleAddRequest = async (e) => {
    e.preventDefault();
  
    console.log("New request data:", newRequest); // Log for debugging
  
    const { id, doc_type } = newRequest;
  
    if (!id || !doc_type) {
      alert('Both student ID and document type are required.');
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:4000/requests", newRequest);
      
      if (response.status === 201) {
        setRequestList([...requestList, response.data]); // Add new request to the list
        setShowRequestModal(false);
        alert("Request added successfully.");
        fetchRequestData(); // Refetch the data to refresh the list
      } else {
        alert("Failed to add request. Try again.");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
  
      if (error.response && error.response.data) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("An unexpected error occurred. Please try again later.");
      }
    }
  };

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
            {requestList.length > 0 ? (
              requestList.map((request) => (
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
              count={10} // Assuming 10 pages
              page={page}
              onChange={(e, newPage) => setPage(newPage)} // Handle page change
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
        BackdropProps={{ style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' } }}
      >
        <div
          className="modal-container p-4"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '500px',
            width: '100%',
          }}
        >
          <h3>Request a Document</h3>
          <form onSubmit={handleAddRequest}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="document-type-label">Document Type</InputLabel>
              <Select
                labelId="document-type-label"
                name="doc_type"
                value={newRequest.doc_type}
                onChange={handleInputChange}
                label="Document Type"
              >
                <MenuItem value="Certificate of Grades">Certificate of Grades</MenuItem>
                <MenuItem value="Good Moral Certificate">Good Moral Certificate</MenuItem>
                <MenuItem value="Diploma">Diploma</MenuItem>
              </Select>
            </FormControl>

            <div className="d-flex justify-content-end mt-3">
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" color="primary" variant="contained" disabled={isLoading}>
                {isLoading ? "Requesting..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default RequestDocument;
