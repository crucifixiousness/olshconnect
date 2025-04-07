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
  Alert
} from '@mui/material';
import axios from 'axios';
// Import the search icon
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { CircularProgress } from '@mui/material';  // Add this to imports

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

  const fetchPrograms = async () => {
    try {
      const response = await axios.get('http://localhost:4000/programs');
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
      const response = await axios.get('http://localhost:4000/tuition-fees');
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
      await axios.post('http://localhost:4000/tuition-fees', formData, {
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

  // Add this state for search
  const [searchTerm, setSearchTerm] = useState('');

  // Add this function to handle search
  const filteredTuitionFees = tuitionFees.filter(fee =>
    fee.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.semester.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.year_level.toString().includes(searchTerm)
  );

  // In the return statement, add this before the table
  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0">
          Tuition Fee Management
        </h3>
      </div>

      <div className="card shadow border-0 p-3 mt-3">
        <div className="d-flex justify-content-between mb-3">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search by program, semester, or year level"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                width: '400px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#c70202',
                  },
                  '&:hover fieldset': {
                    borderColor: '#a00000',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#c70202',
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <Button
                    sx={{
                      minWidth: '40px',
                      bgcolor: '#c70202',
                      '&:hover': { bgcolor: '#a00000' },
                      height: '100%',
                      borderRadius: '0 4px 4px 0',
                      marginRight: '-13px'
                    }}
                  >
                    <FaSearch style={{ color: 'white' }} />
                  </Button>
                ),
              }}
            />
          </Box>
          <Button 
            variant="contained" 
            onClick={() => setOpenModal(true)}
            sx={{ bgcolor: '#c70202', '&:hover': { bgcolor: '#a00000' } }}
          >
            <FaPlus className="me-2"/> Set New Tuition Fee
          </Button>
        </div>

        <div className="table-responsive mt-3">
          {loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : (
            <table className="table table-bordered v-align">
              <thead className="thead-dark">
                <tr>
                  <th>Program</th>
                  <th>Year Level</th>
                  <th>Semester</th>
                  <th>Tuition Fee</th>
                  <th>Misc. Fees</th>
                  <th>Lab Fees</th>
                  <th>Other Fees</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTuitionFees.map((fee) => (
                  <tr key={fee.fee_id}>
                    <td>{fee.program_name}</td>
                    <td>{fee.year_level}</td>
                    <td>{fee.semester}</td>
                    <td>₱{fee.tuition_amount}</td>
                    <td>₱{fee.misc_fees}</td>
                    <td>₱{fee.lab_fees}</td>
                    <td>₱{fee.other_fees}</td>
                    <td>₱{parseFloat(fee.tuition_amount) + parseFloat(fee.misc_fees) + parseFloat(fee.lab_fees) + parseFloat(fee.other_fees)}</td>
                    <td>
                      <div className="actions d-flex align-items-center gap-2">
                        <Button 
                          data-testid={`edit-button-${fee.fee_id}`}
                          className="success" 
                          color="success" 
                          size="small"
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          data-testid={`delete-button-${fee.fee_id}`}
                          className="error" 
                          color="error" 
                          size="small"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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