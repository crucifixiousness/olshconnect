import { FormControl, Select, MenuItem, Button, Pagination, Typography, Modal, Box } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { FaEye } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import Searchbar from '../../components/Searchbar';
import axios from 'axios';

const RegistrarEnrollment = () => {
  const [showBy, setshowBy] = useState('');
  const [showProgramBy, setProgramBy] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem('token');

  const formatStudentName = (firstName, middleName, lastName, suffix) => {
    const middleInitial = middleName ? ` ${middleName.charAt(0)}.` : '';
    const suffixText = suffix ? ` ${suffix}` : '';
    return `${lastName}, ${firstName}${middleInitial}${suffixText}`;
  };

  const fetchEnrollments = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:4000/registrar/enrollments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrollments(response.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  }, [token]); 

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleVerify = async (enrollmentId) => {
    try {
      await axios.put(`http://localhost:4000/registrar/verify-enrollment/${enrollmentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEnrollments(); // Refresh the list
    } catch (error) {
      console.error('Error verifying enrollment:', error);
    }
  };

  const handleViewDetails = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setOpen(true);
  };

  const programMapping = {
    '1': 'BSIT',
    '2': 'BSHM',
    '3': 'EDUCATION',
    '4': 'BSOAD',
    '5': 'BSCRIM'
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0">Enrollment Verification</h3>      
      </div>

      <div className="card shadow border-0 p-3 mt-1">
        <div className="card shadow border-0 p-3 mt-1">
          <Searchbar/>
          <h3 className="hd">List</h3>

          <div className="row cardFilters mt-3">
            <div className="col-md-3">
              <h4>SHOW BY</h4>
              <FormControl size='small' className='w-100'>
                <Select
                  value={showBy}
                  onChange={(e)=>setshowBy(e.target.value)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  <MenuItem value=""><em>Default</em></MenuItem>
                  <MenuItem value="asc">A - Z</MenuItem>
                  <MenuItem value="desc">Z - A</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="col-md-3">
              <h4>PROGRAM</h4>
              <FormControl size='small' className='w-100'>
                <Select
                  value={showProgramBy}
                  onChange={(e)=>setProgramBy(e.target.value)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  <MenuItem value=""><em>Program</em></MenuItem>
                  <MenuItem value="BSED">BSeD</MenuItem>
                  <MenuItem value="BSIT">BSIT</MenuItem>
                  <MenuItem value="BSHM">BSHM</MenuItem>
                  <MenuItem value="BSOAD">BSOAd</MenuItem>
                  <MenuItem value="BSCRIM">BSCRIM</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          <div className='table-responsive mt-3'>
            <table className='table table-bordered v-align'>
              <thead className='thead-dark'>
                <tr>
                  <th>STUDENT NAME</th>
                  <th>YEAR LEVEL</th>
                  <th>PROGRAM</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment._id}>
                    <td>{formatStudentName(
                      enrollment.student.firstName,
                      enrollment.student.middleName,
                      enrollment.student.lastName,
                      enrollment.student.suffix
                    )}</td>
                    <td>{enrollment.yearLevel}</td>
                    <td>{programMapping[enrollment.programs] || enrollment.program_name}</td>
                    <td>{enrollment.status}</td>
                    <td className='action'>
                      <div className='actions d-flex align-items-center'>
                        <Button 
                          className="secondary" 
                          color="secondary"
                          onClick={() => handleViewDetails(enrollment)}
                        >
                          <FaEye/>
                        </Button>
                        {enrollment.status === 'Pending' && (
                          <Button 
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
              <Pagination count={10} color="primary" className='pagination' showFirstButton showLastButton />
            </div>
          </div>          
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
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
            <div className="enrollment-details">
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
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
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
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {programMapping[selectedEnrollment.programs] || selectedEnrollment.programs}
                </Typography>
              </div>

              <div className="enrollment-info-item">
                <Typography variant="subtitle2" sx={{ color: '#666' }}>Year Level</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedEnrollment.yearLevel}
                </Typography>
              </div>

              <div className="enrollment-info-item">
                <Typography variant="subtitle2" sx={{ color: '#666' }}>Semester</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedEnrollment.semester}
                </Typography>
              </div>

              <div className="enrollment-info-item">
                <Typography variant="subtitle2" sx={{ color: '#666' }}>Academic Year</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedEnrollment.academic_year}
                </Typography>
              </div>
              
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
              </div>

              <Button 
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
    </div>
  );
};

export default RegistrarEnrollment;