import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
  Card, 
  Typography, 
  CircularProgress, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Chip
} from '@mui/material';
import { FaEye, FaCheck, FaTimes, FaDownload } from "react-icons/fa";
import { MyContext } from "../../App";

const ProgramHeadTorEvaluation = () => {
  const context = useContext(MyContext);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [torRequests, setTorRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [evaluationOpen, setEvaluationOpen] = useState(false);
  const [equivalencies, setEquivalencies] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [remainingCourses, setRemainingCourses] = useState([]);
  const [requiredCourses, setRequiredCourses] = useState([]);
  const [comments, setComments] = useState('');

  useEffect(() => {
    context.setIsHideComponents(false);
    window.scrollTo(0, 0);
    fetchTorRequests();
  }, [context]);

  const fetchTorRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const program_id = user.program_id;

      if (!token || !program_id) {
        console.error('No token or program_id found');
        setLoading(false);
        return;
      }

      const response = await axios.get(`/api/program-head-tor-evaluation?program_id=${program_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTorRequests(response.data.requests || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching TOR requests:', error);
      setSnackbar({ open: true, message: 'Failed to load TOR requests', severity: 'error' });
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async (program_id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/credit-courses?program_id=${program_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchExistingEquivalencies = async (tor_request_id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/program-head-tor-evaluation?tor_request_id=${tor_request_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('🔍 DEBUG: Fetching equivalencies for tor_request_id:', tor_request_id);
      console.log('🔍 DEBUG: Response:', response.data);
      
      if (response.data.success && response.data.equivalencies) {
        // Convert the database format to form format
        const formattedEquivalencies = response.data.equivalencies.map(equiv => ({
          external_course_code: equiv.external_course_code || '',
          external_course_name: equiv.external_course_name || '',
          external_grade: equiv.external_grade || '',
          external_units: equiv.external_units || 0,
          equivalent_course_id: equiv.equivalent_course_id || '',
          equivalent_course_code: equiv.equivalent_course_code || '',
          equivalent_course_name: equiv.equivalent_course_name || '',
          source_school: equiv.source_school || '',
          source_academic_year: equiv.source_academic_year || ''
        }));
        console.log('🔍 DEBUG: Formatted equivalencies:', formattedEquivalencies);
        setEquivalencies(formattedEquivalencies);
      } else {
        console.log('🔍 DEBUG: No equivalencies found or success=false');
        setEquivalencies([]);
      }
    } catch (error) {
      console.error('Error fetching existing equivalencies:', error);
      // If no equivalencies exist yet, start with empty array
      setEquivalencies([]);
    }
  };

  const handleViewRequest = async (request) => {
    setSelectedRequest(request);
    setComments('');
    
    // Fetch available courses for the student's program
    await fetchAvailableCourses(request.program_id);
    
    // Fetch existing equivalencies if any
    await fetchExistingEquivalencies(request.id);

    // Fetch remaining (current semester) and required courses
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        student_id: String(request.student_id),
        program_id: String(request.program_id),
        year_id: String(request.year_id),
        semester: String(request.semester),
        tor_request_id: String(request.id)
      }).toString();
      const res = await axios.get(`/api/student-remaining-courses?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRemainingCourses(res.data.remainingCourses || []);
      setRequiredCourses(res.data.requiredCourses || []);
    } catch (e) {
      console.error('Error fetching remaining/required courses:', e);
    }
    
    setEvaluationOpen(true);
  };

  const handleDownloadTor = async (tor_request_id) => {
    try {
      console.log('🔍 DEBUG: Attempting to download TOR for request ID:', tor_request_id);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/download-tor?tor_request_id=${tor_request_id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob' // Important for file downloads
      });

      console.log('✅ DEBUG: Download response received:', response);

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'TOR_Document.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSnackbar({ open: true, message: 'TOR document downloaded successfully', severity: 'success' });
    } catch (error) {
      console.error('❌ ERROR downloading TOR:', error);
      
      let errorMessage = 'Failed to download TOR document';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const errorData = error.response.data;
        
        console.log('❌ ERROR: Server response:', { status, errorData });
        
        if (status === 404) {
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = 'TOR document not found. Please check if the document was uploaded.';
          }
        } else if (status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (status === 400) {
          errorMessage = 'Invalid request. Please try again.';
        } else {
          errorMessage = `Server error (${status}). Please try again later.`;
        }
      } else if (error.request) {
        // Request was made but no response received
        console.log('❌ ERROR: No response received:', error.request);
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        // Something else happened
        console.log('❌ ERROR: Request setup error:', error.message);
        errorMessage = 'Failed to prepare download request.';
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleAddEquivalency = () => {
    setEquivalencies([...equivalencies, {
      external_course_code: '',
      external_course_name: '',
      external_grade: '',
      external_units: 0,
      equivalent_course_id: '',
      equivalent_course_code: '',
      equivalent_course_name: '',
      source_school: '',
      source_academic_year: ''
    }]);
  };

  const handleRemoveEquivalency = (index) => {
    const updated = equivalencies.filter((_, i) => i !== index);
    setEquivalencies(updated);
  };

  const handleEquivalencyChange = (index, field, value) => {
    const updated = [...equivalencies];
    updated[index][field] = value;
    
    // Auto-populate course info when course is selected
    if (field === 'equivalent_course_id') {
      const course = availableCourses.find(c => c.course_id == value);
      if (course) {
        updated[index].equivalent_course_code = course.course_code;
        updated[index].equivalent_course_name = course.course_name;
      }
    }
    
    setEquivalencies(updated);
  };

  const handleSubmitEvaluation = async () => {
    // Validate that at least one equivalency is added
    if (equivalencies.length === 0) {
      setSnackbar({ open: true, message: 'Please add at least one course equivalency before submitting.', severity: 'error' });
      return;
    }

    // Validate that all equivalencies have required fields
    const hasEmptyFields = equivalencies.some(equiv => 
      !equiv.external_course_code || 
      !equiv.external_course_name || 
      !equiv.external_grade || 
      !equiv.equivalent_course_id ||
      !equiv.source_school ||
      !equiv.source_academic_year
    );

    if (hasEmptyFields) {
      setSnackbar({ open: true, message: 'Please fill in all required fields for all course equivalencies.', severity: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.post('/api/program-head-tor-evaluation', {
        tor_request_id: selectedRequest.id,
        equivalencies: equivalencies,
        comments: comments
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSnackbar({ open: true, message: 'Course equivalencies submitted successfully', severity: 'success' });
      setEvaluationOpen(false);
      fetchTorRequests();
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      setSnackbar({ open: true, message: 'Failed to submit evaluation', severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'program_head_reviewed': return 'info';
      case 'registrar_approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
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

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="mb-4" style={{ color: '#c70202', fontWeight: 'bold' }}>TOR Evaluation Requests</h3>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Student</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Program</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Year Level</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Semester</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Status</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Submitted</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {torRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <strong>{request.first_name} {request.last_name}</strong>
                      <div style={{ fontSize: '0.8em', color: 'gray' }}>{request.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{request.program_name}</TableCell>
                  <TableCell>{request.year_level}</TableCell>
                  <TableCell>{request.semester}</TableCell>
                  <TableCell>
                    <Chip 
                      label={request.status.replace('_', ' ').toUpperCase()} 
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(request.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleViewRequest(request)}
                        sx={{ 
                          minWidth: 36, 
                          height: 32, 
                          p: 0, 
                          borderRadius: 1, 
                          backgroundColor: '#1976d2',
                          '&:hover': { backgroundColor: '#155fa8' }
                        }}
                      >
                        <FaEye size={16} color="#fff" />
                      </Button>
                      {request.tor_document_path && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleDownloadTor(request.id)}
                          sx={{ 
                            minWidth: 36, 
                            height: 32, 
                            p: 0, 
                            borderRadius: 1, 
                            backgroundColor: '#c70202',
                            '&:hover': { backgroundColor: '#a00000' }
                          }}
                        >
                          <FaDownload size={16} color="#fff" />
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* TOR Evaluation Dialog */}
        <Dialog open={evaluationOpen} onClose={() => setEvaluationOpen(false)} maxWidth="lg" fullWidth>
          <DialogTitle style={{ color: '#c70202', fontWeight: 'bold', fontSize: '1.5rem' }}>
            TOR Evaluation - {selectedRequest?.first_name} {selectedRequest?.last_name}
          </DialogTitle>
          <DialogContent>
            {selectedRequest && (
              <Box>
                <Typography variant="h6" className="mb-3" style={{ color: '#c70202', fontWeight: 'bold' }}>Student Information</Typography>
                <Box className="mb-4">
                  <strong>Program:</strong> {selectedRequest.program_name}<br/>
                  <strong>Year Level:</strong> {selectedRequest.year_level}<br/>
                  <strong>Semester:</strong> {selectedRequest.semester}
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" className="mb-3">
                  <Typography variant="h6" style={{ color: '#c70202', fontWeight: 'bold' }}>
                    Course Equivalencies ({equivalencies.length})
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={handleAddEquivalency}
                    style={{ 
                      backgroundColor: '#c70202', 
                      color: 'white',
                      fontWeight: 'bold',
                      '&:hover': { backgroundColor: '#a00000' }
                    }}
                  >
                    Add Course Equivalency
                  </Button>
                </Box>

                {equivalencies.length === 0 ? (
                  <Card className="p-4 text-center" style={{ border: '2px dashed #e0e0e0', borderRadius: '8px' }}>
                    <Typography variant="body1" style={{ color: '#666' }}>
                      No course equivalencies added yet. Click "Add Course Equivalency" to start.
                    </Typography>
                  </Card>
                ) : (
                  equivalencies.map((equiv, index) => (
                  <Card key={index} className="p-3 mb-3" style={{ border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" className="mb-2">
                      <Typography variant="subtitle1" style={{ color: '#c70202', fontWeight: 'bold' }}>
                        Equivalency {index + 1}
                      </Typography>
                      {equivalencies.length > 1 && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleRemoveEquivalency(index)}
                          style={{ minWidth: 'auto', padding: '4px 8px' }}
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                    <div className="row">
                      <div className="col-md-6">
                        <TextField
                          label="External Course Code"
                          fullWidth
                          size="small"
                          value={equiv.external_course_code}
                          onChange={(e) => handleEquivalencyChange(index, 'external_course_code', e.target.value)}
                          className="mb-2"
                        />
                        <TextField
                          label="External Course Name"
                          fullWidth
                          size="small"
                          value={equiv.external_course_name}
                          onChange={(e) => handleEquivalencyChange(index, 'external_course_name', e.target.value)}
                          className="mb-2"
                        />
                        <TextField
                          label="Grade (1.0-5.0)"
                          fullWidth
                          size="small"
                          type="number"
                          step="0.1"
                          min="1.0"
                          max="5.0"
                          value={equiv.external_grade}
                          onChange={(e) => handleEquivalencyChange(index, 'external_grade', parseFloat(e.target.value))}
                          className="mb-2"
                        />
                        <TextField
                          label="External Units"
                          fullWidth
                          size="small"
                          type="number"
                          value={equiv.external_units}
                          onChange={(e) => handleEquivalencyChange(index, 'external_units', parseFloat(e.target.value))}
                          className="mb-2"
                        />
                        <TextField
                          label="Source School"
                          fullWidth
                          size="small"
                          value={equiv.source_school}
                          onChange={(e) => handleEquivalencyChange(index, 'source_school', e.target.value)}
                          className="mb-2"
                        />
                        <TextField
                          label="Academic Year (e.g., 2022-2023)"
                          fullWidth
                          size="small"
                          value={equiv.source_academic_year}
                          onChange={(e) => handleEquivalencyChange(index, 'source_academic_year', e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <TextField
                          select
                          label="Equivalent Course"
                          fullWidth
                          size="small"
                          value={equiv.equivalent_course_id}
                          onChange={(e) => handleEquivalencyChange(index, 'equivalent_course_id', e.target.value)}
                          className="mb-2"
                          SelectProps={{
                            native: true,
                          }}
                        >
                          <option value="">Select Course</option>
                          {availableCourses.map((course) => (
                            <option key={course.course_id} value={course.course_id}>
                              {course.course_code} - {course.course_name} ({course.units} units)
                            </option>
                          ))}
                        </TextField>
                      </div>
                    </div>
                  </Card>
                  ))
                )}

                {/* Remaining Required Courses (current semester only) */}
                <Box className="mt-4">
                  <Typography variant="h6" className="mb-2" style={{ color: '#c70202', fontWeight: 'bold' }}>
                    Assign Additional Course (Current Semester)
                  </Typography>
                  <div className="row">
                    <div className="col-md-8">
                      <TextField
                        select
                        label="Remaining Course"
                        fullWidth
                        size="small"
                        className="mb-2"
                        SelectProps={{ native: true }}
                        onChange={async (e) => {
                          const pcId = Number(e.target.value || 0);
                          if (!pcId) return;
                          try {
                            const token = localStorage.getItem('token');
                            await axios.post('/api/student-required-courses', {
                              student_id: selectedRequest.student_id,
                              pc_id: pcId,
                              reason: 'not_taken'
                            }, { headers: { Authorization: `Bearer ${token}` } });
                            // Move from remaining to required list locally
                            const picked = remainingCourses.find(rc => Number(rc.pc_id) === pcId);
                            if (picked) {
                              setRequiredCourses([...requiredCourses, picked]);
                              setRemainingCourses(remainingCourses.filter(rc => Number(rc.pc_id) !== pcId));
                              setSnackbar({ open: true, message: 'Course added to required list', severity: 'success' });
                            }
                          } catch (err) {
                            console.error('Error adding required course:', err);
                            setSnackbar({ open: true, message: 'Failed to add required course', severity: 'error' });
                          }
                          e.target.value = '';
                        }}
                      >
                        <option value="">Select a remaining course</option>
                        {remainingCourses.map(rc => (
                          <option key={rc.pc_id} value={rc.pc_id}>
                            {rc.course_code} - {rc.course_name} ({rc.units} units)
                          </option>
                        ))}
                      </TextField>
                    </div>
                  </div>

                  {requiredCourses.length > 0 && (
                    <TableContainer component={Paper} elevation={0} className="mt-2">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Required Course</TableCell>
                            <TableCell align="right">Units</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {requiredCourses.map(rc => (
                            <TableRow key={rc.pc_id}>
                              <TableCell>{rc.course_code} - {rc.course_name}</TableCell>
                              <TableCell align="right">{rc.units}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>

              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setEvaluationOpen(false)}
              style={{ color: '#666' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitEvaluation}
              variant="contained"
              style={{ 
                backgroundColor: '#c70202', 
                color: 'white',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#a00000' }
              }}
            >
              Submit Evaluation
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
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
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default ProgramHeadTorEvaluation;
