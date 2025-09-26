import { useState, useEffect, useContext } from 'react';
import { Card, Typography, CircularProgress, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Tooltip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { GiBookshelf } from "react-icons/gi";
import { RiPoliceBadgeFill } from "react-icons/ri";
import { MdTour } from "react-icons/md";
import { FaComputer } from "react-icons/fa6";
import { PiComputerTowerFill } from "react-icons/pi";
import { IoIosPeople } from "react-icons/io";
import { MyContext } from "../../App";
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaEye } from "react-icons/fa";
import { TbNumber1, TbNumber2, TbNumber3, TbNumber4 } from "react-icons/tb";

// Add this at the top with other imports
const programMapping = {
  1: "BSIT",
  2: "BSHM",
  3: "Education",
  4: "BSOAd",
  5: "BSCrim"
};
const programIcons = {
  1: <FaComputer size={40} style={{ color: '#006a13' }}/>,
  2: <MdTour size={40} style={{ color: '#b6b62a' }}/>,             
  3: <GiBookshelf size={40} style={{ color: '#092985' }}/>,          
  4: <PiComputerTowerFill size={40} style={{ color: '#11f000' }}/>,
  5: <RiPoliceBadgeFill size={40} style={{ color: '#6a0000' }}/>
};           
            
const ProgramHeadDashboard = () => {
  const [loading, setLoading] = useState(true);
  const context = useContext(MyContext);
  const [program_id, setProgramId] = useState(null);
  const [program_name, setProgramName] = useState("");
  const [programData, setProgramData] = useState({
    total_students: 0,
    students_per_year: {
      first: 0,
      second: 0,
      third: 0,
      fourth: 0
    }
  });

  // Class approvals state
  const [classes, setClasses] = useState([]);
  const [classLoading, setClassLoading] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewStudents, setViewStudents] = useState([]);
  const [viewClassInfo, setViewClassInfo] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch program_id and set program_name from localStorage
  useEffect(() => {
    const storedProgramId = localStorage.getItem("program_id");
    const userString = localStorage.getItem("user");
    
    console.log('Stored program_id from localStorage:', storedProgramId);
    console.log('User string from localStorage:', userString);
    
    let programId = null;
    
    // Try to get program_id from localStorage first
    if (storedProgramId) {
      programId = parseInt(storedProgramId, 10);
      console.log('Using program_id from localStorage:', programId);
    }
    
    // If not found, try to get it from user object
    if (!programId && userString) {
      try {
        const user = JSON.parse(userString);
        console.log('Parsed user object:', user);
        if (user.program_id) {
          programId = parseInt(user.program_id, 10);
          console.log('Using program_id from user object:', programId);
        }
      } catch (error) {
        console.error('Error parsing user object:', error);
      }
    }
    
    if (!isNaN(programId)) {
      setProgramId(programId);
      setProgramName(programMapping[programId] || "Unknown");
      console.log('Set program_id in state:', programId);
      console.log('Set program_name in state:', programMapping[programId] || "Unknown");
    } else {
      console.error('No valid program_id found');
    }
  }, []);

  // Fetch student data when program_id is available
  useEffect(() => {
    const fetchProgramData = async () => {
      if (!program_id) {
        console.log('No program_id available yet');
        return;
      }
      
      console.log('Fetching data for program_id:', program_id);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        console.log('Making API call to program-head-dashboard...');
        const response = await axios.get(`/api/program-head-dashboard?program_id=${program_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('API Response:', response.data);
        setProgramData(response.data);
        // Also fetch classes for approval
        await fetchClassApprovalData();
      } catch (error) {
        console.error('Error fetching program data:', error);
        console.error('Error response:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    context.setIsHideComponents(false);
    window.scrollTo(0,0);
    fetchProgramData();
  }, [context, program_id]);

  const fetchClassApprovalData = async () => {
    try {
      setClassLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`/api/program-head-class-approval?program_id=${program_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = (response.data.classes || []).filter(c => (parseInt(c.total_grades, 10) || 0) > 0);
      setClasses(list);
    } catch (e) {
      console.error('Error fetching PH class approvals:', e);
    } finally {
      setClassLoading(false);
    }
  };

  const handleApproveClass = async (pcId, assignmentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.post('/api/program-head-approve-class', { pcId, assignmentId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchClassApprovalData();
      setSnackbar({ open: true, message: 'Class approved by Program Head', severity: 'success' });
    } catch (e) {
      console.error('Error approving class:', e);
      setSnackbar({ open: true, message: 'Failed to approve class', severity: 'error' });
    }
  };

  const handleRejectClass = async (pcId, assignmentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.post('/api/reject-class', { pcId, assignmentId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchClassApprovalData();
      setSnackbar({ open: true, message: 'Class reset to pending', severity: 'success' });
    } catch (e) {
      console.error('Error rejecting class:', e);
      setSnackbar({ open: true, message: 'Failed to reset class', severity: 'error' });
    }
  };

  const handleViewClass = async (cls) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`/api/course-students?courseId=${cls.assignment_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setViewStudents(response.data.students || []);
      setViewClassInfo({
        course_code: cls.course_code,
        course_name: cls.course_name,
        section: cls.section,
        program_name: cls.program_name,
        year_level: cls.year_level,
        semester: cls.semester
      });
      setViewOpen(true);
    } catch (e) {
      console.error('Error fetching class students:', e);
      setSnackbar({ open: true, message: 'Failed to load class students', severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Final':
        return '#388e3c';
      case 'Dean Approved':
        return '#2e7d32';
      case 'Program Head Approved':
        return '#1976d2';
      case 'Pending':
        return '#ed6c02';
      case 'Graded':
        return '#d4edda';
      case 'Not Graded':
        return '#f8d7da';
      default:
        return '#6c757d';
    }
  };

  // Update statCards to use program_name
  // Update statCards array
  const statCards = [
    {
      title: 'st Year Students',
      value: programData.students_per_year.first || 0,
      icon: <TbNumber1 size={30} />,
      color: '#1976d2'
    },
    {
      title: 'nd Year Students',
      value: programData.students_per_year.second,
      icon: <TbNumber2 size={30} />,
      color: '#2e7d32'
    },
    {
      title: 'rd Year Students',
      value: programData.students_per_year.third,
      icon: <TbNumber3 size={30} />,
      color: '#ed6c02'
    },
    {
      title: 'th Year Students',
      value: programData.students_per_year.fourth,
      icon: <TbNumber4 size={30} />,
      color: '#9c27b0'
    }
  ];
  
  useEffect(() => {
    context.setIsHideComponents(false);
    window.scrollTo(0,0);
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, [context]);

  // Replace the current loading state
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
        <h3 className="mb-4">{program_name} Program Head Dashboard</h3>
        <div className="row">
          {statCards.map((card, index) => (
            <div key={index} className="col-md-3 mb-4">
              <Card 
                className="h-100 p-3" 
                sx={{ 
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)' },
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                <div className="d-flex align-items-center mb-3">
                  <div style={{ color: card.color }}>{card.icon}</div>
                  <Typography variant="h6" className="ms-2">{card.title}</Typography>
                </div>
                <Typography variant="h3" style={{ color: card.color }}>
                  {card.value}
                </Typography>
              </Card>
            </div>
          ))}
        </div>

        {/* Program Statistics Section */}
        <div className="row mt-4">
          <div className="col-md-6 mb-4">
            <Card className="h-100 p-3">
              <Typography variant="h6" className="mb-3">Total {program_name} Students</Typography>
              <div className="d-flex align-items-center mb-3">
                {programIcons[program_id] || <IoIosPeople size={40} style={{ color: '#1976d2' }}/>}
                <Typography variant="h4" className="ms-2">{programData.total_students}</Typography>
              </div>
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>First Year {programData.program_name}</span>
                  <strong>{programData.students_per_year.first}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Second Year {programData.program_name}</span>
                  <strong>{programData.students_per_year.second}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Third Year {programData.program_name}</span>
                  <strong>{programData.students_per_year.third}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Fourth Year {programData.program_name}</span>
                  <strong>{programData.students_per_year.fourth}</strong>
                </div>
              </div>
            </Card>
          </div>
          <div className="col-md-6 mb-4">
            <Card className="h-100 p-3">
              <Typography variant="h6" className="mb-3">Recent Activities</Typography>
              {/* Add activities list here */}
            </Card>
          </div>
        </div>

        {/* Grade Approval Management - Program Head */}
        <div className="row mt-2">
          <div className="col-md-12 mb-4">
            <Card className="h-100 p-3">
              <Typography variant="h6" className="mb-3">Grade Approval Management</Typography>

              {classLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '160px' }}>
                  <CircularProgress style={{ color: '#c70202' }} />
                </div>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Course</TableCell>
                        <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Section / Block</TableCell>
                        <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(classes || []).map((cls) => (
                        <TableRow key={`${cls.pc_id}-${cls.section}`}>
                          <TableCell>{cls.course_code} - {cls.course_name}</TableCell>
                          <TableCell>{cls.section}</TableCell>
                          <TableCell>
                            <div className="d-flex gap-2">
                              <Tooltip title="Approve (Program Head)">
                                <Button size="small" variant="contained"
                                  onClick={() => handleApproveClass(cls.pc_id, cls.assignment_id)}
                                  sx={{ minWidth: 36, height: 32, p: 0, borderRadius: 1, backgroundColor: '#2e7d32', '&:hover': { backgroundColor: '#256628' } }}
                                >
                                  <FaCheckCircle size={16} color="#fff" />
                                </Button>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <Button size="small" variant="contained"
                                  onClick={() => handleRejectClass(cls.pc_id, cls.assignment_id)}
                                  sx={{ minWidth: 36, height: 32, p: 0, borderRadius: 1, backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#a72828' } }}
                                >
                                  <FaTimesCircle size={16} color="#fff" />
                                </Button>
                              </Tooltip>
                              <Tooltip title="View Class">
                                <Button size="small" variant="contained"
                                  onClick={() => handleViewClass(cls)}
                                  sx={{ minWidth: 36, height: 32, p: 0, borderRadius: 1, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#155fa8' } }}
                                >
                                  <FaEye size={16} color="#fff" />
                                </Button>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* View Class Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Class Details - {viewClassInfo?.course_code} {viewClassInfo?.course_name}
        </DialogTitle>
        <DialogContent>
          {viewClassInfo && (
            <div className="mb-3">
              <Typography variant="subtitle1" className="mb-2">
                <strong>Program-Year-Section:</strong> {viewClassInfo.program_name}-{viewClassInfo.year_level}{viewClassInfo.section}
              </Typography>
              <Typography variant="subtitle1" className="mb-2">
                <strong>Semester:</strong> {viewClassInfo.semester}
              </Typography>
            </div>
          )}
          
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Student Name</TableCell>
                  <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Final Grade</TableCell>
                  <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {viewStudents.map((student) => (
                  <TableRow key={student.student_id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.final_grade || '-'}</TableCell>
                    <TableCell>
                      <span 
                        style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '12px',
                          backgroundColor: getStatusColor(student.grade_status),
                          color: '#fff'
                        }}
                      >
                        {student.grade_status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProgramHeadDashboard;
