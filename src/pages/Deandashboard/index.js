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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaEye, 
  FaClock,
  FaGraduationCap,
  FaUserGraduate,
  FaBookOpen,
  FaChartLine
} from "react-icons/fa";
import { MyContext } from "../../App";

const DeanDashboard = () => {
  const context = useContext(MyContext);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalComments, setApprovalComments] = useState('');
  const [approving, setApproving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Dashboard statistics
  const [dashboardStats, setDashboardStats] = useState({
    totalGrades: 0,
    pendingApproval: 0,
    registrarApproved: 0,
    deanApproved: 0,
    finalApproved: 0
  });

  // Class-level approval
  const [classes, setClasses] = useState([]);
  const [classLoading, setClassLoading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [viewOpen, setViewOpen] = useState(false);
  const [viewStudents, setViewStudents] = useState([]);
  const [viewClassInfo, setViewClassInfo] = useState(null);

  useEffect(() => {
    context.setIsHideComponents(false);
    window.scrollTo(0, 0);
    fetchDashboardData();
    fetchClassApprovalData();
  }, [context]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch grade approval data
      const response = await axios.get('/api/dean-dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setGrades(response.data.grades || []);
      setDashboardStats(response.data.stats || {
        totalGrades: 0,
        pendingApproval: 0,
        registrarApproved: 0,
        deanApproved: 0,
        finalApproved: 0
      });
    } catch (error) {
      console.error('Error fetching dean dashboard data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load dashboard data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClassApprovalData = async () => {
    try {
      setClassLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get('/api/registrar-class-approval', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Show classes with at least one registrar_approved for Dean to act on
      const list = (response.data.classes || []).filter(c => (parseInt(c.registrar_approved_count, 10) || 0) > 0);
      setClasses(list);
      setSelectedProgram('All');
    } catch (e) {
      console.error('Error fetching class approvals for dean:', e);
    } finally {
      setClassLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleApproveGrade = (grade) => {
    setSelectedGrade(grade);
    setApprovalComments('');
    setApprovalDialogOpen(true);
  };

  const handleApprovalSubmit = async (action) => {
    if (!selectedGrade) return;

    try {
      setApproving(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post('/api/approve-grade', {
        gradeId: selectedGrade.grade_id,
        action: action,
        comments: approvalComments
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSnackbar({
        open: true,
        message: response.data.message || 'Grade approval updated successfully',
        severity: 'success'
      });

      setApprovalDialogOpen(false);
      setSelectedGrade(null);
      setApprovalComments('');
      
      // Refresh data
      fetchDashboardData();
    } catch (error) {
      console.error('Error approving grade:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update grade approval',
        severity: 'error'
      });
    } finally {
      setApproving(false);
    }
  };

  const handleApproveClass = async (pcId, action, assignmentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.post('/api/approve-class-grades', { pcId, assignmentId, action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchClassApprovalData();
      await fetchDashboardData();
      setSnackbar({ open: true, message: 'Class approval updated', severity: 'success' });
    } catch (e) {
      console.error('Error approving class:', e);
      setSnackbar({ open: true, message: 'Failed to approve class', severity: 'error' });
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
      case 'pending':
        return '#ed6c02';
      case 'registrar_approved':
        return '#1976d2';
      case 'dean_approved':
        return '#2e7d32';
      case 'final':
        return '#388e3c';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock />;
      case 'registrar_approved':
        return <FaCheckCircle />;
      case 'dean_approved':
        return <FaCheckCircle />;
      case 'final':
        return <FaGraduationCap />;
      default:
        return <FaClock />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statCards = [
    {
      title: 'Total Grades',
      value: dashboardStats.totalGrades,
      icon: <FaBookOpen size={30} />,
      color: '#1976d2'
    },
    {
      title: 'Pending Approval',
      value: dashboardStats.pendingApproval,
      icon: <FaClock size={30} />,
      color: '#ed6c02'
    },
    {
      title: 'Registrar Approved',
      value: dashboardStats.registrarApproved,
      icon: <FaCheckCircle size={30} />,
      color: '#1976d2'
    },
    {
      title: 'Dean Approved',
      value: dashboardStats.deanApproved,
      icon: <FaGraduationCap size={30} />,
      color: '#2e7d32'
    },
    {
      title: 'Final Approved',
      value: dashboardStats.finalApproved,
      icon: <FaUserGraduate size={30} />,
      color: '#388e3c'
    }
  ];

  const filteredGrades = grades.filter(grade => {
    switch (tabValue) {
      case 0: // All
        return true;
      case 1: // Pending
        return grade.approval_status === 'pending';
      case 2: // Registrar Approved
        return grade.approval_status === 'registrar_approved';
      case 3: // Dean Approved
        return grade.approval_status === 'dean_approved';
      case 4: // Final
        return grade.approval_status === 'final';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="right-content w-100">
        <div className="card shadow border-0 p-3 mt-1">
          <h3 className="mb-4">Dean Dashboard</h3>
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <CircularProgress sx={{ color: '#c70202' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="mb-4">Dean Dashboard - Grade Approval</h3>
        
        {/* Statistics Cards */}
        <div className="row mb-4">
          {statCards.map((card, index) => (
            <div key={index} className="col-md-2 mb-3">
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
                  <Typography variant="h6" className="ms-2" sx={{ fontSize: '0.9rem' }}>
                    {card.title}
                  </Typography>
                </div>
                <Typography variant="h3" style={{ color: card.color, fontWeight: 'bold' }}>
                  {card.value}
                </Typography>
              </Card>
            </div>
          ))}
        </div>

        {/* Grade Approval Tabs */}
        <Card className="mt-4">
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="grade approval tabs">
              <Tab label={`All Grades (${grades.length})`} />
              <Tab label={`Pending (${dashboardStats.pendingApproval})`} />
              <Tab label={`Registrar Approved (${dashboardStats.registrarApproved})`} />
              <Tab label={`Dean Approved (${dashboardStats.deanApproved})`} />
              <Tab label={`Final (${dashboardStats.finalApproved})`} />
            </Tabs>
          </Box>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Student</TableCell>
                  <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Course</TableCell>
                  <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Grade</TableCell>
                  <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Status</TableCell>
                  <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Instructor</TableCell>
                  <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Submitted</TableCell>
                  <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGrades.length > 0 ? (
                  filteredGrades.map((grade) => (
                    <TableRow key={grade.grade_id} hover>
                      <TableCell>
                        <div>
                          <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                            {grade.student_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {grade.student_email}
                          </Typography>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                            {grade.course_code} - {grade.course_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {grade.program_name} - Year {grade.year_level} - Sem {grade.semester}
                          </Typography>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" style={{ fontWeight: 'bold', color: '#c70202' }}>
                          {grade.final_grade}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(grade.approval_status)}
                          label={grade.approval_status.replace('_', ' ').toUpperCase()}
                          style={{ 
                            backgroundColor: getStatusColor(grade.approval_status),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {grade.instructor_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(grade.grade_entered_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <div className="d-flex gap-2">
                          {/* Per-student actions removed */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No grades found for the selected filter
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Class Approvals embedded */}
        <Card className="mt-4 p-3">
          <Typography variant="h6" className="mb-3">Grade Approval Management - Classes</Typography>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={selectedProgram}
              onChange={(e, val) => setSelectedProgram(val)}
              variant="scrollable"
              scrollButtons
              allowScrollButtonsMobile
            >
              <Tab key="All" value="All" label="All Programs" />
              {[...new Set((classes || []).map(c => c.program_name))]
                .filter(Boolean)
                .map(name => (
                  <Tab key={name} value={name} label={name} />
                ))}
            </Tabs>
          </Box>

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
                  {(classes || [])
                    .filter(c => selectedProgram === 'All' || c.program_name === selectedProgram)
                    .map((cls) => (
                    <TableRow key={`${cls.pc_id}-${cls.section}`}>
                      <TableCell>{cls.course_code} - {cls.course_name}</TableCell>
                      <TableCell>{cls.section}</TableCell>
                      <TableCell>
                        <div className="d-flex gap-2">
                          <Tooltip title="Approve (Dean)">
                            <Button size="small" variant="contained"
                              onClick={() => handleApproveClass(cls.pc_id, 'dean_approve', cls.assignment_id)}
                              sx={{ minWidth: 36, height: 32, p: 0, borderRadius: 1, backgroundColor: '#2e7d32', '&:hover': { backgroundColor: '#256628' } }}
                            >
                              <FaCheckCircle size={16} color="#fff" />
                            </Button>
                          </Tooltip>
                          <Tooltip title="Finalize">
                            <Button size="small" variant="contained"
                              onClick={() => handleApproveClass(cls.pc_id, 'final_approve', cls.assignment_id)}
                              sx={{ minWidth: 36, height: 32, p: 0, borderRadius: 1, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#155fa8' } }}
                            >
                              <FaUserGraduate size={16} color="#fff" />
                            </Button>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <Button size="small" variant="contained"
                              onClick={() => handleApproveClass(cls.pc_id, 'reject', cls.assignment_id)}
                              sx={{ minWidth: 36, height: 32, p: 0, borderRadius: 1, backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#a72828' } }}
                            >
                              <FaTimesCircle size={16} color="#fff" />
                            </Button>
                          </Tooltip>
                          <Tooltip title="View Class">
                            <Button size="small" variant="contained"
                              onClick={() => handleViewClass(cls)}
                              sx={{ minWidth: 36, height: 32, p: 0, borderRadius: 1, backgroundColor: '#455a64', '&:hover': { backgroundColor: '#37474f' } }}
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

        {/* View Class Dialog */}
        <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {viewClassInfo ? `${viewClassInfo.course_code} - ${viewClassInfo.course_name} | Section ${viewClassInfo.section}` : 'Class Details'}
          </DialogTitle>
          <DialogContent>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Student</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Email</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Grade</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {viewStudents.length > 0 ? viewStudents.map((s) => (
                    <TableRow key={s.student_id}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{s.final_grade}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No students found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

      {/* Approval Dialog */}
      <Dialog 
        open={approvalDialogOpen} 
        onClose={() => setApprovalDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Grade Approval - {selectedGrade?.student_name}
        </DialogTitle>
        <DialogContent>
          {selectedGrade && (
            <Grid container spacing={2} className="mt-2">
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Student</Typography>
                <Typography variant="body1">{selectedGrade.student_name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Course</Typography>
                <Typography variant="body1">{selectedGrade.course_code} - {selectedGrade.course_name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Grade</Typography>
                <Typography variant="h6" style={{ color: '#c70202', fontWeight: 'bold' }}>
                  {selectedGrade.final_grade}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Current Status</Typography>
                <Chip
                  icon={getStatusIcon(selectedGrade.approval_status)}
                  label={selectedGrade.approval_status.replace('_', ' ').toUpperCase()}
                  style={{ 
                    backgroundColor: getStatusColor(selectedGrade.approval_status),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Comments (Optional)"
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  placeholder="Add any comments about this grade approval..."
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setApprovalDialogOpen(false)}
            disabled={approving}
          >
            Cancel
          </Button>
          {/* Per-student actions removed */}
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

export default DeanDashboard;
