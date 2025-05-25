import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';
import { FaCheck } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';

const DocumentRequests = () => {
  // eslint-disable-next-line
  const [requests, setRequests] = useState([]);
  const [filterBy, setFilterBy] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Add new state for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Update fetchRequests function
  const fetchRequests = async () => {
    try {
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

  // Filter requests based on document type
  const filteredRequests = filterBy
    ? requests.filter(request => request.doc_type === filterBy)
    : requests;

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

  // Add Snackbar component at the end of return statement, before the final closing div
  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0" data-testid="page-title">Document Requests</h3>
      </div>

      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd" data-testid="section-title">Requested Documents</h3>

        <div className="row cardFilters mt-3">
          <div className="col-md-3">
            <h4>FILTER BY DOCUMENT</h4>
            <FormControl size='small' className='w-100'>
              <Select
                data-testid="document-filter"
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                displayEmpty
                inputProps={{ 'aria-label': 'Filter documents by type' }}
                className='w-100'
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                <MenuItem value="Certificate of Grades">Certificate of Grades</MenuItem>
                <MenuItem value="Good Moral Certificate">Good Moral Certificate</MenuItem>
                <MenuItem value="Diploma">Diploma</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <div className='table-responsive mt-3'>
          <table className='table table-bordered v-align' data-testid="requests-table">
            <thead className='thead-dark'>
              <tr>
                <th>STUDENT NAME</th>
                <th>DOCUMENT TYPE</th>
                <th>REQUEST DATE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.length > 0 ? (
                paginatedRequests.map((request) => (
                  <tr key={request.req_id} data-testid={`request-row-${request.req_id}`}>
                    <td>
                      {formatStudentName(
                        request.first_name,
                        request.middle_name,
                        request.last_name,
                        request.suffix
                      )}
                    </td>
                    <td>{request.doc_type}</td>
                    <td>{new Date(request.req_date).toLocaleDateString()}</td>
                    <td>{request.req_status}</td>
                    <td className='action'>
                      <div className='actions d-flex align-items-center'>
                        <Button 
                          className="success" 
                          color="success"
                          data-testid={`approve-button-${request.req_id}`}
                          aria-label={`Approve request for ${request.first_name} ${request.last_name}`}
                          onClick={() => handleStatusUpdate(request.req_id, 'Approved')}
                          disabled={request.req_status !== 'Pending'}
                        >
                          <FaCheck/>
                        </Button>
                        <Button 
                          className="error" 
                          color="error"
                          data-testid={`reject-button-${request.req_id}`}
                          aria-label={`Reject request for ${request.first_name} ${request.last_name}`}
                          onClick={() => handleStatusUpdate(request.req_id, 'Rejected')}
                          disabled={request.req_status !== 'Pending'}
                        >
                          <FaXmark/>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }} data-testid="no-data-message">
                    No document requests available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className='d-flex tableFooter'>
            <Pagination 
              data-testid="pagination"
              count={pageCount}
              page={page}
              onChange={(e, newPage) => setPage(newPage)}
              color="primary" 
              className='pagination'
              showFirstButton 
              showLastButton 
            />
          </div>
        </div>
      </div>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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
