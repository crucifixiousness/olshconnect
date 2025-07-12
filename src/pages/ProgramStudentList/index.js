import { useState, useEffect } from 'react';
import { Button, FormControl, Select, MenuItem, Pagination, Modal, Box, Typography, TextField, Snackbar, Alert } from '@mui/material';
import { FaEye, FaEdit, FaPlus } from "react-icons/fa";
import Searchbar from '../../components/Searchbar';
import axios from 'axios';

const ProgramStudentList = () => {
  const [showBy, setshowBy] = useState('');
  const [block, setBlock] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [programId, setProgramId] = useState(null);
  const [programName, setProgramName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState('');
  const [newBlockName, setNewBlockName] = useState('');
  const [showAddBlock, setShowAddBlock] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Add program mapping
  const programMapping = {
    1: 'BSIT',
    2: 'BSED',
    3: 'BSHM',
    4: 'BSOA',
    5: 'BSCRIM'
    // Add more programs as needed
  };

  useEffect(() => {
    const storedProgramId = localStorage.getItem("program_id");
    if (storedProgramId) {
      setProgramId(storedProgramId);
      setProgramName(programMapping[storedProgramId] || "Unknown Program");
    }
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!programId) return;
      
      try {
        // Only include non-empty filter values and ensure year_level is a number
        const params = {
          program_id: programId,
          ...(yearLevel && yearLevel !== '' && { year_level: parseInt(yearLevel) }),
          ...(block && block !== '' && { block_name: block })
        };

        const response = await axios.get('/api/get-program-students', { params });
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [programId, yearLevel, block, showBy]);

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.block?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.year_level?.toString().includes(searchTerm)
  );

  // Helper function to get year suffix
  const getYearSuffix = (year) => {
    if (year === 1) return 'st';
    if (year === 2) return 'nd';
    if (year === 3) return 'rd';
    return 'th';
  };

  // Handle opening assign modal
  const handleAssignBlock = (student) => {
    setSelectedStudent(student);
    setSelectedBlock('');
    setNewBlockName('');
    setShowAddBlock(false);
    setShowAssignModal(true);
  };

  // Handle closing assign modal
  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedStudent(null);
    setSelectedBlock('');
    setNewBlockName('');
    setShowAddBlock(false);
  };

  // Handle assigning block to student
  const handleAssignBlockSubmit = async () => {
    if (!selectedStudent || (!selectedBlock && !newBlockName)) {
      setSnackbar({
        open: true,
        message: 'Please select a block or add a new one',
        severity: 'error'
      });
      return;
    }

    try {
      const blockToAssign = selectedBlock || newBlockName;
      
      const response = await axios.put(`/api/assign-student-block`, {
        student_id: selectedStudent.id,
        block: blockToAssign,
        program_id: programId
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: `Student assigned to Block ${blockToAssign} successfully!`,
          severity: 'success'
        });
        handleCloseAssignModal();
        // Refresh the student list
        const updatedStudents = students.map(student => 
          student.id === selectedStudent.id 
            ? { ...student, block: blockToAssign }
            : student
        );
        setStudents(updatedStudents);
      }
    } catch (error) {
      console.error('Error assigning block:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to assign block to student',
        severity: 'error'
      });
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="right-content w-100" data-testid="student-list">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0">Student List</h3>      
      </div>
  
      <div className="card shadow border-0 p-3 mt-1">
        <div className="card shadow border-0 p-3 mt-1">
          <Searchbar
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <h3 className="hd">Student List - {programName}</h3>
  
          <div className="row cardFilters mt-3">
            <div className="col-md-3">
              <h4>SHOW BY</h4>
              <FormControl size='small' className='w-100'>
                <Select
                  value={showBy}
                  onChange={(e) => setshowBy(e.target.value)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Show by filter' }}
                  className='w-100'
                >
                  <MenuItem value=""><em>Default</em></MenuItem>
                  <MenuItem value="asc">A - Z</MenuItem>
                  <MenuItem value="desc">Z - A</MenuItem>
                </Select>
              </FormControl>
            </div>
  
            <div className="col-md-3">
              <h4>YEAR LEVEL</h4>
              <FormControl size='small' className='w-100'>
                <Select
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  displayEmpty
                  className='w-100'
                >
                  <MenuItem value=""><em>All Years</em></MenuItem>
                  <MenuItem value={1}>1st Year</MenuItem>
                  <MenuItem value={2}>2nd Year</MenuItem>
                  <MenuItem value={3}>3rd Year</MenuItem>
                  <MenuItem value={4}>4th Year</MenuItem>
                </Select>
              </FormControl>
            </div>
  
            <div className="col-md-3">
              <h4>BLOCK</h4>
              <FormControl size='small' className='w-100'>
                <Select
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  displayEmpty
                  className='w-100'
                >
                  <MenuItem value=""><em>All Blocks</em></MenuItem>
                  <MenuItem value="A">Block A</MenuItem>
                  <MenuItem value="B">Block B</MenuItem>
                  <MenuItem value="C">Block C</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
  
          <div className='table-responsive mt-3'>
            <table className='table table-bordered v-align' data-testid="student-table">
              <thead className='thead-dark'>
                <tr>
                  <th>STUDENT NAME</th>
                  <th className="text-center">YEAR LEVEL</th>
                  <th className="text-center">BLOCK</th>
                  <th className="text-center">SEX</th>
                  <th className="text-center">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center">Loading...</td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      {searchTerm ? 'No students found matching your search' : 'No enrolled students found'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>{student.student_name}</td>
                      <td className="text-center">
                        {student.year_level === 0 ? 
                          <span className="text-muted">N/A</span> : 
                          `${student.year_level}${getYearSuffix(student.year_level)} Year`
                        }
                      </td>
                      <td className="text-center">
                        {student.block === 'N/A' ? 
                          <span className="text-muted">N/A</span> : 
                          `Block ${student.block}`
                        }
                      </td>
                      <td className="text-center">
                        {student.sex === 'N/A' ? 
                          <span className="text-muted">N/A</span> : 
                          student.sex
                        }
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          <Button 
                            variant="contained"
                            size="small"
                            startIcon={<FaEye/>}
                            sx={{
                              bgcolor: '#0d6efd',
                              '&:hover': { bgcolor: '#0b5ed7' }
                            }}
                          >
                            View
                          </Button>
                          {student.block === 'N/A' && (
                            <Button 
                              variant="contained"
                              size="small"
                              startIcon={<FaEdit/>}
                              onClick={() => handleAssignBlock(student)}
                              sx={{
                                bgcolor: '#28a745',
                                '&:hover': { bgcolor: '#218838' }
                              }}
                            >
                              Assign Block
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className='d-flex tableFooter'>
              <Pagination count={10} color="primary" className='pagination' showFirstButton showLastButton />
            </div>
          </div>          
        </div>
      </div>

      {/* Assign Block Modal */}
      <Modal
        open={showAssignModal}
        onClose={handleCloseAssignModal}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: "90%",
          maxWidth: "500px",
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "30px",
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}>
          <Typography variant="h5" sx={{ mb: 3, color: '#c70202', fontWeight: 'bold' }}>
            Assign Block to Student
          </Typography>

          {selectedStudent && (
            <div>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                <strong>Student:</strong> {selectedStudent.student_name}
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 3 }}>
                <strong>Year Level:</strong> {selectedStudent.year_level}{getYearSuffix(selectedStudent.year_level)} Year
              </Typography>

              <div className="mb-3">
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Select Block:
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Select
                    value={selectedBlock}
                    onChange={(e) => setSelectedBlock(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>Choose a block</em>
                    </MenuItem>
                    <MenuItem value="A">Block A</MenuItem>
                    <MenuItem value="B">Block B</MenuItem>
                    <MenuItem value="C">Block C</MenuItem>
                  </Select>
                </FormControl>

                <div className="d-flex align-items-center mb-3">
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>
                    Or add a new block:
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FaPlus />}
                    onClick={() => setShowAddBlock(!showAddBlock)}
                    sx={{ borderColor: '#c70202', color: '#c70202' }}
                  >
                    {showAddBlock ? 'Cancel' : 'Add New Block'}
                  </Button>
                </div>

                {showAddBlock && (
                  <TextField
                    fullWidth
                    label="New Block Name"
                    value={newBlockName}
                    onChange={(e) => setNewBlockName(e.target.value)}
                    placeholder="e.g., Block D, Block E"
                    sx={{ mb: 2 }}
                  />
                )}
              </div>

              <div className="d-flex gap-2">
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleAssignBlockSubmit}
                  sx={{
                    bgcolor: '#c70202',
                    '&:hover': { bgcolor: '#a00000' }
                  }}
                >
                  Assign Block
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleCloseAssignModal}
                  sx={{
                    borderColor: '#c70202',
                    color: '#c70202',
                    '&:hover': {
                      borderColor: '#a00000',
                      color: '#a00000'
                    }
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Box>
      </Modal>

      {/* Snackbar */}
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

export default ProgramStudentList;
