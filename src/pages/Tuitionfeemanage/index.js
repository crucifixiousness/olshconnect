import React, { useState, useEffect } from 'react';
import { 
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Modal,
  Box,
  Typography,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
// Import the search icon
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Searchbar from '../../components/Searchbar';

const TuitionManagement = () => {
  const [tuitionFees, setTuitionFees] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  // Modify the formData state to include program_id
  const [formData, setFormData] = useState({
    program_id: '', // Changed from 'program' to 'program_id'
    yearLevel: '',
    semester: '',
    tuitionAmount: '',
    miscFees: '',
    labFees: '',
    otherFees: ''
  });
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Add CSS to override Searchbar margin
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .searchbar-container .searchBar {
        margin-bottom: 0 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await axios.get('/api/programs');
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  useEffect(() => {
    fetchTuitionFees();
    fetchPrograms();
  }, []);

  const fetchTuitionFees = async () => {
    try {
      const response = await axios.get('/api/tuition-fees');
      setTuitionFees(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tuition fees:', error);
      // No error message displayed to user
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // Add token to request headers
      await axios.post('/api/add-tuition-fee', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      setSnackbar({
        open: true,
        message: 'Tuition fee set successfully!',
        severity: 'success'
      });
      fetchTuitionFees(); // Refresh the list
      setOpenModal(false);
      setFormData({
        program: '',
        yearLevel: '',
        semester: '',
        tuitionAmount: '',
        miscFees: '',
        labFees: '',
        otherFees: ''
      });
    } catch (error) {
      console.error('Error saving tuition fee:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to set tuition fee',
        severity: 'error'
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [snackbar, setSnackbar] = useState({
      open: false,
      message: '',
      severity: 'success'
  });
  
  const handleSnackbarClose = () => {
      setSnackbar({ ...snackbar, open: false });
  };

  // Add this function to handle search
  const filteredTuitionFees = tuitionFees.filter(fee =>
    fee.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.semester.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.year_level.toString().includes(searchTerm)
  );

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedTuitionFees = filteredTuitionFees.slice(startIndex, endIndex);
  const pageCount = Math.ceil(filteredTuitionFees.length / rowsPerPage);

  // In the return statement, add this before the table
  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0">
          Tuition Fee Management
        </h3>
      </div>

      <div className="card shadow border-0 p-3 mt-1">
        <div className="card shadow border-0 p-3 mt-1">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2" style={{ width: '100%' }}>
              <div style={{ width: '850px' }}>
                <div className="searchbar-container" style={{ marginBottom: '0' }}>
                  <Searchbar value={searchTerm} onChange={setSearchTerm} />
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Button 
                  variant="contained" 
                  onClick={() => setOpenModal(true)}
                  sx={{ 
                    bgcolor: '#c70202', 
                    '&:hover': { bgcolor: '#a00000' },
                    height: '40px',
                    fontSize: '0.875rem'
                  }}
                >
                  <FaPlus className="me-2"/> Set New Tuition Fee
                </Button>
              </div>
            </div>
          </div>

          <div className="table-responsive mt-3">
            {loading ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress style={{ color: '#c70202' }} />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Program</TableCell>
                      <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Year Level</TableCell>
                      <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Semester</TableCell>
                      <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Tuition Fee</TableCell>
                      <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Misc. Fees</TableCell>
                      <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Lab Fees</TableCell>
                      <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Other Fees</TableCell>
                      <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Total</TableCell>
                      <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan="9" style={{ textAlign: "center", padding: "40px 0" }}>
                          <CircularProgress style={{ color: '#c70202' }} />
                        </TableCell>
                      </TableRow>
                    ) : paginatedTuitionFees.length > 0 ? (
                      paginatedTuitionFees.map((fee) => (
                        <TableRow 
                          key={fee.fee_id}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell>{fee.program_name}</TableCell>
                          <TableCell>{fee.year_level}</TableCell>
                          <TableCell>{fee.semester}</TableCell>
                          <TableCell>₱{fee.tuition_amount}</TableCell>
                          <TableCell>₱{fee.misc_fees}</TableCell>
                          <TableCell>₱{fee.lab_fees}</TableCell>
                          <TableCell>₱{fee.other_fees}</TableCell>
                          <TableCell style={{ fontWeight: 'bold' }}>
                            ₱{parseFloat(fee.tuition_amount) + parseFloat(fee.misc_fees) + parseFloat(fee.lab_fees) + parseFloat(fee.other_fees)}
                          </TableCell>
                          <TableCell>
                            <div className="actions d-flex align-items-center gap-1">
                              <Button 
                                data-testid={`edit-button-${fee.fee_id}`}
                                variant="contained"
                                size="small"
                                sx={{
                                  minWidth: '36px',
                                  width: '36px',
                                  height: '36px',
                                  padding: 0,
                                  borderRadius: '8px',
                                  bgcolor: '#e8f5e8',
                                  color: '#2e7d32',
                                  '&:hover': {
                                    bgcolor: '#c8e6c9',
                                  },
                                  '& .MuiButton-startIcon': {
                                    margin: 0
                                  }
                                }}
                              >
                                <FaEdit />
                              </Button>
                              <Button 
                                data-testid={`delete-button-${fee.fee_id}`}
                                variant="contained"
                                size="small"
                                sx={{
                                  minWidth: '36px',
                                  width: '36px',
                                  height: '36px',
                                  padding: 0,
                                  borderRadius: '8px',
                                  bgcolor: '#ffebee',
                                  color: '#c62828',
                                  '&:hover': {
                                    bgcolor: '#ffcdd2',
                                  },
                                  '& .MuiButton-startIcon': {
                                    margin: 0
                                  }
                                }}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="9" style={{ textAlign: "center" }}>
                          No tuition fees found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination */}
            {filteredTuitionFees.length > 0 && (
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
      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: "90%",
          maxWidth: "600px",
          bgcolor: 'background.paper',
          borderRadius: "10px",
          boxShadow: 24,
          p: 4,
          maxHeight: "90vh",
          overflowY: "auto"
        }}>
          <Typography variant="h5" sx={{ 
            textAlign: "center", 
            marginBottom: "20px",
            color: '#c70202',
            fontWeight: 'bold'
          }}>
            Set Tuition Fee
          </Typography>

          <form onSubmit={handleSubmit}>
            <div className="registration-section">
              <Typography variant="h6" className="section-title">
                Program Details
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Program</InputLabel>
                <Select
                  data-testid="program-select"
                  name="program_id"
                  value={formData.program_id}
                  onChange={handleInputChange}
                  required
                >
                  {programs.map((program) => (
                    <MenuItem key={program.program_id} value={program.program_id}>
                      {program.program_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Year Level</InputLabel>
                <Select
                  data-testid="year-select"
                  name="yearLevel"
                  value={formData.yearLevel}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="1">1st Year</MenuItem>
                  <MenuItem value="2">2nd Year</MenuItem>
                  <MenuItem value="3">3rd Year</MenuItem>
                  <MenuItem value="4">4th Year</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Semester</InputLabel>
                <Select
                  data-testid="semester-select"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="1st">1st Semester</MenuItem>
                  <MenuItem value="2nd">2nd Semester</MenuItem>
                  <MenuItem value="Summer">Summer</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="registration-section">
              <Typography variant="h6" className="section-title">
                Fee Breakdown
              </Typography>
              <TextField
                data-testid="tuition-amount"
                fullWidth
                margin="normal"
                label="Tuition Amount"
                name="tuitionAmount"
                type="number"
                value={formData.tuitionAmount}
                onChange={handleInputChange}
                required
              />

              <TextField
                data-testid="misc-fees"
                fullWidth
                margin="normal"
                label="Miscellaneous Fees"
                name="miscFees"
                type="number"
                value={formData.miscFees}
                onChange={handleInputChange}
                required
              />

              <TextField
                data-testid="lab-fees"
                fullWidth
                margin="normal"
                label="Laboratory Fees"
                name="labFees"
                type="number"
                value={formData.labFees}
                onChange={handleInputChange}
                required
              />

              <TextField
                data-testid="other-fees"
                fullWidth
                margin="normal"
                label="Other Fees"
                name="otherFees"
                type="number"
                value={formData.otherFees}
                onChange={handleInputChange}
                required
              />

              <Button 
                data-testid="submit-button"
                type="submit" 
                variant="contained"
                fullWidth
                sx={{
                  mt: 3,
                  bgcolor: '#c70202',
                  '&:hover': { bgcolor: '#a00000' },
                  height: '45px',
                  fontWeight: 'bold'
                }}
              >
                Save Tuition Fee
              </Button>
            </div>
          </form>
        </Box>
      </Modal>

      {/* Move Snackbar inside the return statement */}
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

export default TuitionManagement;
