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
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaEye, 
  FaUserGraduate
} from "react-icons/fa";
import { MyContext } from "../../App";

const DeanDashboard = () => {
  const context = useContext(MyContext);
  const [loading, setLoading] = useState(true);
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
    fetchClassApprovalData();
  }, [context]);

  // Removed per-student dashboard data fetch

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

  // Removed per-student approval handlers

  const handleApproveClass = async (pcId, action, assignmentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.post('/api/approve-class-grades', { pcId, assignmentId, action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchClassApprovalData();
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

  // Removed per-student status helpers

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

  // Removed per-student statistic cards

  // Removed per-student filtering

  // Simplified loading handled within class section

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="mb-4">Dean Dashboard - Grade Approval (Classes)</h3>

        {/* Class Approvals (Per Subject/Course) */}
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
                      <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Instructor</TableCell>
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
                      <TableCell>{cls.instructor_name || 'Not assigned'}</TableCell>
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

      {/* Removed per-student approval dialog */}

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
