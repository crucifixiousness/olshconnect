import { FormControl, Select, MenuItem, Button, Pagination, Typography, Modal, Box, Snackbar, Alert } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { FaEye } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import Searchbar from '../../components/Searchbar';
import axios from 'axios';

const RegistrarEnrollment = () => {  
  const programMapping = {
    '1': 'BSIT',
    '2': 'BSHM',
    '3': 'Education',
    '4': 'BSOAd',
    '5': 'BSCrim'
  };

  const [showBy, setshowBy] = useState('');
  const [showProgramBy, setProgramBy] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem('token');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [yearLevel, setYearLevel] = useState('');
  const [studentType, setStudentType] = useState('');


  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const formatStudentName = (firstName, middleName, lastName, suffix) => {
    const middleInitial = middleName ? ` ${middleName.charAt(0)}.` : '';
    const suffixText = suffix ? ` ${suffix}` : '';
    return `${lastName}, ${firstName}${middleInitial}${suffixText}`;
  };

  // Update the filteredEnrollments logic
  const filteredEnrollments = enrollments
    // First apply all filters
    .filter(enrollment => {
      const matchesProgram = !showProgramBy || 
        (enrollment.program_name || programMapping[enrollment.programs]) === showProgramBy;
      
      const matchesYear = !yearLevel || enrollment.year_level === parseInt(yearLevel);
      
      const searchString = formatStudentName(
        enrollment.student.firstName,
        enrollment.student.middleName,
        enrollment.student.lastName,
        enrollment.student.suffix
      ).toLowerCase();
      
      const matchesSearch = !searchTerm || searchString.includes(searchTerm.toLowerCase());
      
      const matchesStudentType = !studentType || enrollment.student_type === studentType;

      return matchesProgram && matchesSearch && matchesYear && matchesStudentType;
    })
    // Then apply sorting to filtered results
    .sort((a, b) => {
      if (!showBy) return 0;
      
      // Get full names for comparison
      const nameA = formatStudentName(
        a.student.firstName,
        a.student.middleName,
        a.student.lastName,
        a.student.suffix
      ).toLowerCase();
      
      const nameB = formatStudentName(
        b.student.firstName,
        b.student.middleName,
        b.student.lastName,
        b.student.suffix
      ).toLowerCase();

      // Apply sorting
      return showBy === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  
  // Now use filteredEnrollments for pagination
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedEnrollments = filteredEnrollments.slice(startIndex, endIndex);
  const pageCount = Math.ceil(filteredEnrollments.length / rowsPerPage);

  const fetchEnrollments = useCallback(async () => {
    try {
      const response = await axios.get(`/api/registrar-enrollments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrollments(response.data);
    } catch (error) {
      const err = new Error('Failed to fetch enrollments');
      console.error('Error fetching enrollments:', err);
      setEnrollments([]);
    }
  }, [token]); 

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleVerify = async (enrollmentId) => {
    try {
      console.log('Enrollment ID to verify:', enrollmentId); // Debug log
      
      const response = await axios.put(`/api/verify-enrollment?id=${enrollmentId}`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Enrollment verified successfully",
          severity: "success"
        });
        fetchEnrollments();
      }
    } catch (error) {
      console.error('Error verifying enrollment:', error.response?.data || error.message);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to verify enrollment",
        severity: "error"
      });
    }
  };

  const handleViewDetails = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="right-content w-100" data-testid="registrar-enrollment-page">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0" data-testid="page-title">Enrollment Verification</h3>      
      </div>

      <div className="card shadow border-0 p-3 mt-1">
        <div className="card shadow border-0 p-3 mt-1">
          <Searchbar 
            value={searchTerm}
            onChange={setSearchTerm}
            data-testid="enrollment-searchbar"
          />
          <h3 className="hd" data-testid="list-title">List</h3>

          <div className="row cardFilters mt-3">
            <div className="col-md-3">
              <h4>SHOW BY</h4>
                <FormControl size='small' className='w-100'>
                  <Select
                    data-testid="sort-select"
                    value={showBy}
                    onChange={(e)=>setshowBy(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="" data-testid="sort-default">
                      <em>Default</em>
                    </MenuItem>
                    <MenuItem value="asc" data-testid="sort-asc">
                      A - Z
                    </MenuItem>
                    <MenuItem value="desc" data-testid="sort-desc">
                      Z - A
                    </MenuItem>
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
                >
                  <MenuItem value="">
                    <em>All Years</em>
                  </MenuItem>
                  <MenuItem value="1">1st Year</MenuItem>
                  <MenuItem value="2">2nd Year</MenuItem>
                  <MenuItem value="3">3rd Year</MenuItem>
                  <MenuItem value="4">4th Year</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="col-md-3">
              <h4>PROGRAM</h4>
              <FormControl size='small' className='w-100'>
                <Select
                  data-testid="program-select"
                  value={showProgramBy}
                  onChange={(e)=>setProgramBy(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="" data-testid="program-default">
                    <em>Program</em>
                  </MenuItem>
                  <MenuItem value="Education" data-testid="program-bsed">EDUCATION</MenuItem>
                  <MenuItem value="BSIT" data-testid="program-bsit">BSIT</MenuItem>
                  <MenuItem value="BSHM" data-testid="program-bshm">BSHM</MenuItem>
                  <MenuItem value="BSOAd" data-testid="program-bsoad">BSOAd</MenuItem>
                  <MenuItem value="BSCrim" data-testid="program-bscrim">BSCRIM</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="col-md-3">
              <h4>STUDENT TYPE</h4>
              <FormControl size='small' className='w-100'>
                <Select
                  value={studentType}
                  onChange={(e) => setStudentType(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>All Types</em>
                  </MenuItem>
                  <MenuItem value="new">New Student</MenuItem>
                  <MenuItem value="transferee">Transferee</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          <div className='table-responsive mt-3'>
            <table className='table table-bordered v-align' data-testid="enrollments-table">
              <thead className='thead-dark'>
                <tr>
                  <th>STUDENT NAME</th>
                  <th>YEAR LEVEL</th>
                  <th>PROGRAM</th>
                  <th>STATUS</th>
                  <th>STUDENT TYPE</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {/* Update to use paginatedEnrollments */}
                {paginatedEnrollments.map((enrollment, index) => (
                  <tr key={enrollment._id} data-testid={`enrollment-row-${index}`}>
                    <td data-testid={`student-name-${index}`}>{formatStudentName(
                      enrollment.student.firstName,
                      enrollment.student.middleName,
                      enrollment.student.lastName,
                      enrollment.student.suffix
                    )}</td>
                    <td data-testid={`year-level-${index}`}>{enrollment.year_level}</td>
                    <td data-testid={`program-${index}`}>
                      {enrollment.program_name || programMapping[enrollment.programs]}
                    </td>
                    <td data-testid={`status-${index}`}>{enrollment.status}</td>
                    <td data-testid={`student-type-${index}`}>{enrollment.student_type === 'transferee' ? 'Transferee' : 'New Student'}</td>
                    <td className='action'>
                      <div className='actions d-flex align-items-center'>
                        <Button 
                          data-testid={`view-button-${index}`}
                          className="secondary" 
                          color="secondary"
                          onClick={() => handleViewDetails(enrollment)}
                        >
                          <FaEye/>
                        </Button>
                        {enrollment.status === 'Pending' && (
                          <Button 
                            data-testid={`verify-button-${index}`}
                            className="success" 
                            color="success"
                            onClick={() => handleVerify(enrollment._id)}
                          >
                            <FaCheck/>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className='d-flex tableFooter'>
              <Pagination 
                data-testid="pagination"
                count={pageCount}
                page={page}
                onChange={handlePageChange} 
                color="primary" 
                className='pagination' 
                showFirstButton 
                showLastButton 
              />
            </div>
          </div>          
        </div>
      </div>

      <Modal 
        open={open} 
        onClose={() => setOpen(false)}
        data-testid="enrollment-details-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 4,
          p: 0,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          {selectedEnrollment && (
            <div className="enrollment-details" data-testid="enrollment-details">
              <div className="enrollment-details-header">
                <Typography variant="h5" sx={{ 
                  fontWeight: 'bold',
                  color: '#c70202'
                }}>
                  Enrollment Details
                </Typography>
              </div>

              <div className="enrollment-info-item">
                <Typography variant="subtitle2" sx={{ color: '#666' }}>Student Name</Typography>
                <Typography 
                  variant="body1" 
                  sx={{ fontWeight: 500 }}
                  data-testid="modal-student-name"
                >
                  {formatStudentName(
                    selectedEnrollment.student.firstName,
                    selectedEnrollment.student.middleName,
                    selectedEnrollment.student.lastName,
                    selectedEnrollment.student.suffix
                  )}
                </Typography>
              </div>

              <div className="enrollment-info-item">
                <Typography variant="subtitle2" sx={{ color: '#666' }}>Program</Typography>
                <Typography 
                  variant="body1" 
                  sx={{ fontWeight: 500 }}
                  data-testid="modal-program"
                >
                  {programMapping[selectedEnrollment.programs] || selectedEnrollment.programs}
                </Typography>
              </div>

              <div className="enrollment-info-item">
                <Typography variant="subtitle2" sx={{ color: '#666' }}>Year Level</Typography>
                <Typography 
                  variant="body1" 
                  sx={{ fontWeight: 500 }}
                  data-testid="modal-year-level"
                >
                  {selectedEnrollment.year_level}
                </Typography>
              </div>

              <div className="enrollment-info-item">
                <Typography variant="subtitle2" sx={{ color: '#666' }}>Semester</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedEnrollment.semester.replace(/[{"}]/g, '')}
                </Typography>
              </div>

              <div className="enrollment-info-item">
                <Typography variant="subtitle2" sx={{ color: '#666' }}>Academic Year</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedEnrollment.academic_year.replace(/[{"}]/g, '')}
                </Typography>
              </div>

              <div className="enrollment-info-item">
                <Typography variant="subtitle2" sx={{ color: '#666' }}>Student Type</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedEnrollment.student_type === 'transferee' ? 'Transferee' : 'New Student'}
                </Typography>
              </div>

              {selectedEnrollment.student_type === 'transferee' && (
                <>
                  <div className="enrollment-info-item">
                    <Typography variant="subtitle2" sx={{ color: '#666' }}>Previous School</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedEnrollment.previous_school || 'Not specified'}
                    </Typography>
                  </div>

                  <div className="enrollment-info-item">
                    <Typography variant="subtitle2" sx={{ color: '#666' }}>Previous Program</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedEnrollment.previous_program || 'Not specified'}
                    </Typography>
                  </div>
                </>
              )}

              <div className="enrollment-docs-section">
                <Typography variant="h6" sx={{ 
                  mb: 2,
                  color: '#c70202',
                  fontWeight: 'bold'
                }}>
                  Required Documents
                </Typography>
                
                <div className="document-preview">
                  <div className="document-title">
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Student ID Picture
                    </Typography>
                  </div>
                  {selectedEnrollment.idpic ? (
                    <img 
                      src={`data:image/jpeg;base64,${selectedEnrollment.idpic}`} 
                      alt="Student ID" 
                      style={{ width: '100%', borderRadius: '8px' }}
                    />
                  ) : (
                    <div className="no-doc-message">No ID picture uploaded</div>
                  )}
                </div>

                <div className="document-preview">
                  <div className="document-title">
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Birth Certificate
                    </Typography>
                  </div>
                  {selectedEnrollment.birth_certificate_doc ? (
                    <img 
                      src={`data:image/jpeg;base64,${selectedEnrollment.birth_certificate_doc}`} 
                      alt="Birth Certificate" 
                      style={{ width: '100%', borderRadius: '8px' }}
                    />
                  ) : (
                    <div className="no-doc-message">No birth certificate uploaded</div>
                  )}
                </div>

                <div className="document-preview">
                  <div className="document-title">
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Form 137
                    </Typography>
                  </div>
                  {selectedEnrollment.form137_doc ? (
                    <img 
                      src={`data:image/jpeg;base64,${selectedEnrollment.form137_doc}`} 
                      alt="Form 137" 
                      style={{ width: '100%', borderRadius: '8px' }}
                    />
                  ) : (
                    <div className="no-doc-message">No Form 137 uploaded</div>
                  )}
                </div>

                {/* Additional documents for transferee students */}
                {selectedEnrollment.student_type === 'transferee' && (
                  <>
                    <div className="document-preview">
                      <div className="document-title">
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Transfer Certificate
                        </Typography>
                      </div>
                      {selectedEnrollment.transfer_certificate_doc ? (
                        <img 
                          src={`data:image/jpeg;base64,${selectedEnrollment.transfer_certificate_doc}`} 
                          alt="Transfer Certificate" 
                          style={{ width: '100%', borderRadius: '8px' }}
                        />
                      ) : (
                        <div className="no-doc-message">No transfer certificate uploaded</div>
                      )}
                    </div>

                    <div className="document-preview">
                      <div className="document-title">
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Transcript of Records (TOR)
                        </Typography>
                      </div>
                      {selectedEnrollment.tor_doc ? (
                        <img 
                          src={`data:image/jpeg;base64,${selectedEnrollment.tor_doc}`} 
                          alt="Transcript of Records" 
                          style={{ width: '100%', borderRadius: '8px' }}
                        />
                      ) : (
                        <div className="no-doc-message">No TOR uploaded</div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <Button 
                data-testid="modal-close-button"
                variant="contained" 
                fullWidth 
                sx={{ 
                  mt: 3,
                  bgcolor: '#c70202',
                  '&:hover': {
                    bgcolor: '#a00000',
                  },
                  height: '45px',
                  fontWeight: 'bold'
                }}
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </div>
          )}
        </Box>
      </Modal>
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

export default RegistrarEnrollment;
