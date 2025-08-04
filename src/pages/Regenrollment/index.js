import { FormControl, Select, MenuItem, Button, Pagination, Typography, Modal, Box, Snackbar, Alert, Paper, Grid, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
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
  const [loading, setLoading] = useState(false);
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
  const [statusFilter, setStatusFilter] = useState('');

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const formatStudentName = (firstName, middleName, lastName, suffix) => {
    const middleInitial = middleName ? ` ${middleName.charAt(0)}.` : '';
    const suffixText = suffix ? ` ${suffix}` : '';
    return `${lastName}, ${firstName}${middleInitial}${suffixText}`;
  };

  const getEnrollmentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'registered':
        return {
          backgroundColor: '#6c757d', // Gray - Initial registration
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600'
        };
      case 'pending':
      case 'under review':
        return {
          backgroundColor: '#ffc107', // Yellow - Under review
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600'
        };
      case 'verified':
      case 'approved':
        return {
          backgroundColor: '#17a2b8', // Blue - Verified
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600'
        };
      case 'for payment':
        return {
          backgroundColor: '#fd7e14', // Orange - Payment required
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600'
        };
      case 'officially enrolled':
        return {
          backgroundColor: '#28a745', // Green - Successfully enrolled
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600'
        };
      case 'rejected':
      case 'declined':
        return {
          backgroundColor: '#dc3545', // Red - Rejected
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600'
        };
      case 'incomplete':
      case 'missing documents':
        return {
          backgroundColor: '#6f42c1', // Purple - Incomplete
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600'
        };
      default:
        return {
          backgroundColor: '#6c757d', // Gray - Unknown status
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600'
        };
    }
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
      
      const matchesStatus = !statusFilter || enrollment.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesProgram && matchesSearch && matchesYear && matchesStudentType && matchesStatus;
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
      setLoading(true);
      const response = await axios.get(`/api/registrar-enrollments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrollments(response.data);
    } catch (error) {
      const err = new Error('Failed to fetch enrollments');
      console.error('Error fetching enrollments:', err);
      setEnrollments([]);
    } finally {
      setLoading(false);
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

      <div className="card shadow border-0 p-3">
        <Searchbar 
          value={searchTerm}
          onChange={setSearchTerm}
          data-testid="enrollment-searchbar"
        />

        {/* Filters */}
                 <Paper elevation={3} className="p-3 mb-4">
           <Grid container spacing={2} alignItems="center">
             <Grid item xs={2}>
               <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>SHOW BY</Typography>
               <FormControl fullWidth size="small">
                 <Select
                   data-testid="sort-select"
                   value={showBy}
                   onChange={(e)=>setshowBy(e.target.value)}
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
             </Grid>
             <Grid item xs={2}>
               <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>YEAR LEVEL</Typography>
               <FormControl fullWidth size="small">
                 <Select
                   value={yearLevel}
                   onChange={(e) => setYearLevel(e.target.value)}
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
                     <em>All Years</em>
                   </MenuItem>
                   <MenuItem value="1">1st Year</MenuItem>
                   <MenuItem value="2">2nd Year</MenuItem>
                   <MenuItem value="3">3rd Year</MenuItem>
                   <MenuItem value="4">4th Year</MenuItem>
                 </Select>
               </FormControl>
             </Grid>
             <Grid item xs={2}>
               <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>PROGRAM</Typography>
               <FormControl fullWidth size="small">
                 <Select
                   data-testid="program-select"
                   value={showProgramBy}
                   onChange={(e)=>setProgramBy(e.target.value)}
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
             </Grid>
             <Grid item xs={2}>
               <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>STUDENT TYPE</Typography>
               <FormControl fullWidth size="small">
                 <Select
                   value={studentType}
                   onChange={(e) => setStudentType(e.target.value)}
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
                     <em>All Types</em>
                   </MenuItem>
                   <MenuItem value="new">New Student</MenuItem>
                   <MenuItem value="transferee">Transferee</MenuItem>
                 </Select>
               </FormControl>
             </Grid>
             <Grid item xs={2}>
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
                   <MenuItem value="registered">Registered</MenuItem>
                   <MenuItem value="pending">Pending</MenuItem>
                   <MenuItem value="verified">Verified</MenuItem>
                   <MenuItem value="for payment">For Payment</MenuItem>
                   <MenuItem value="officially enrolled">Officially Enrolled</MenuItem>
                   <MenuItem value="rejected">Rejected</MenuItem>
                   <MenuItem value="incomplete">Incomplete</MenuItem>
                 </Select>
               </FormControl>
             </Grid>
             <Grid item xs={2}>
               <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>&nbsp;</Typography>
               <Button 
                 variant="contained"
                 onClick={fetchEnrollments}
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
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Student Name</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Year Level</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Program</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Status</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Student Type</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="6" style={{ textAlign: "center", padding: "40px 0" }}>
                    <CircularProgress style={{ color: '#c70202' }} />
                  </TableCell>
                </TableRow>
              ) : paginatedEnrollments.length > 0 ? (
                paginatedEnrollments.map((enrollment, index) => (
                  <TableRow key={enrollment._id} data-testid={`enrollment-row-${index}`}>
                    <TableCell data-testid={`student-name-${index}`}>{formatStudentName(
                      enrollment.student.firstName,
                      enrollment.student.middleName,
                      enrollment.student.lastName,
                      enrollment.student.suffix
                    )}</TableCell>
                    <TableCell data-testid={`year-level-${index}`}>{enrollment.year_level}</TableCell>
                    <TableCell data-testid={`program-${index}`}>
                      {enrollment.program_name || programMapping[enrollment.programs]}
                    </TableCell>
                                         <TableCell data-testid={`status-${index}`}>
                       <span style={getEnrollmentStatusColor(enrollment.status)}>
                         {enrollment.status}
                       </span>
                     </TableCell>
                    <TableCell data-testid={`student-type-${index}`}>
                      {enrollment.student_type === 'transferee' ? 'Transferee' : 'New Student'}
                    </TableCell>
                    <TableCell>
                      <div className='actions d-flex align-items-center'>
                        <Button 
                          data-testid={`view-button-${index}`}
                          className="secondary" 
                          color="secondary"
                          onClick={() => handleViewDetails(enrollment)}
                          sx={{ mr: 1 }}
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
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="6" style={{ textAlign: "center" }}>
                    No enrollment records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {filteredEnrollments.length > 0 && (
          <div className="d-flex justify-content-center mt-4">
            <Pagination 
              data-testid="pagination"
              count={pageCount}
              page={page}
              onChange={handlePageChange} 
              color="primary" 
              className='pagination' 
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
                  {selectedEnrollment.birthCertificateDoc ? (
                    <img 
                      src={`data:image/jpeg;base64,${selectedEnrollment.birthCertificateDoc}`} 
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
                  {selectedEnrollment.form137Doc ? (
                    <img 
                      src={`data:image/jpeg;base64,${selectedEnrollment.form137Doc}`} 
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
                      {selectedEnrollment.transferCertificateDoc ? (
                        <img 
                          src={`data:image/jpeg;base64,${selectedEnrollment.transferCertificateDoc}`} 
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
                      {selectedEnrollment.torDoc ? (
                        <img 
                          src={`data:image/jpeg;base64,${selectedEnrollment.torDoc}`} 
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
