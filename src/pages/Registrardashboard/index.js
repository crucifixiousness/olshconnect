import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
  Card, 
  Typography, 
  CircularProgress, 
  Box, 
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
  IconButton,
  Tooltip
} from '@mui/material';
import { IoIosPeople } from "react-icons/io";
import { FaFileAlt, FaCheckCircle, FaTimesCircle, FaEye, FaClock, FaGraduationCap } from "react-icons/fa";
import { MyContext } from "../../App";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const RegistrarDashboard = () => {
  const context = useContext(MyContext);

  useEffect(() => {
    context.setIsHideComponents(false);
    window.scrollTo(0,0);
  }, [context]);

  const [dashboardData, setDashboardData] = useState({
    totalEnrollments: 0,
    totalVerified: 0,
    totalPending: 0,
    totalRejected: 0
  });
  const [enrollmentStats, setEnrollmentStats] = useState({
    programStats: [],
    yearLevelStats: [],
    monthlyData: [],
    statusDistribution: [],
    documentStats: {}
  });
  const [loading, setLoading] = useState(true);

  // Grade approval states
  const [gradeApprovalTab, setGradeApprovalTab] = useState(0);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalComments, setApprovalComments] = useState('');
  const [approving, setApproving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [gradeStats, setGradeStats] = useState({
    totalGrades: 0,
    pendingApproval: 0,
    registrarApproved: 0,
    deanApproved: 0,
    finalApproved: 0
  });

  // Class-level approval states
  const [classes, setClasses] = useState([]);
  const [classLoading, setClassLoading] = useState(false);

  useEffect(() => {
    const fetchRegistrarData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        // Fetch dashboard data from new API
        const response = await axios.get('/api/registrar-dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setDashboardData({
          totalEnrollments: response.data.totalEnrollments || 0,
          totalVerified: response.data.totalVerified || 0,
          totalPending: response.data.totalPending || 0,
          totalRejected: response.data.totalRejected || 0
        });

        setEnrollmentStats({
          programStats: response.data.enrollmentStats?.programStats || [],
          yearLevelStats: response.data.enrollmentStats?.yearLevelStats || [],
          monthlyData: response.data.enrollmentStats?.monthlyData || [],
          statusDistribution: response.data.enrollmentStats?.statusDistribution || [],
          documentStats: response.data.enrollmentStats?.documentStats || {}
        });

        // Fetch grade approval data
        await fetchGradeApprovalData();
        // Fetch class approval data
        await fetchClassApprovalData();
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching registrar data:', error);
        setLoading(false);
      }
    };

    fetchRegistrarData();
  }, []);

  const fetchGradeApprovalData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }

      // Fetch grade approval data
      const response = await axios.get('/api/registrar-grade-approval', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setGrades(response.data.grades || []);
      setGradeStats(response.data.stats || {
        totalGrades: 0,
        pendingApproval: 0,
        registrarApproved: 0,
        deanApproved: 0,
        finalApproved: 0
      });
    } catch (error) {
      console.error('Error fetching grade approval data:', error);
    }
  };

  const handleGradeApprovalTabChange = (event, newValue) => {
    setGradeApprovalTab(newValue);
  };

  const fetchClassApprovalData = async () => {
    try {
      setClassLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get('/api/registrar-class-approval', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(response.data.classes || []);
    } catch (e) {
      console.error('Error fetching class approvals:', e);
    } finally {
      setClassLoading(false);
    }
  };

  const handleApproveClass = async (pcId, action) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.post('/api/approve-class-grades', { pcId, action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh both grades and classes summary
      fetchGradeApprovalData();
      fetchClassApprovalData();
      setSnackbar({ open: true, message: 'Class approval updated', severity: 'success' });
    } catch (e) {
      console.error('Error approving class:', e);
      setSnackbar({ open: true, message: 'Failed to approve class', severity: 'error' });
    }
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
      fetchGradeApprovalData();
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

  const getApprovalStatusColor = (status) => {
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

  const getApprovalStatusIcon = (status) => {
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
      title: 'Total Enrollments',
      value: dashboardData.totalEnrollments,
      icon: <IoIosPeople size={30} />,
      color: '#1976d2'
    },
    {
      title: 'Verified Enrollments',
      value: dashboardData.totalVerified,
      icon: <FaCheckCircle size={30} />,
      color: '#2e7d32'
    },
    {
      title: 'Pending Enrollments',
      value: dashboardData.totalPending,
      icon: <FaFileAlt size={30} />,
      color: '#ed6c02'
    },
    {
      title: 'Rejected Enrollments',
      value: dashboardData.totalRejected,
      icon: <FaTimesCircle size={30} />,
      color: '#d32f2f'
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  const formatMonth = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified':
        return '#2e7d32';
      case 'Pending':
        return '#ed6c02';
      case 'Rejected':
        return '#d32f2f';
      case 'For Payment':
        return '#1976d2';
      case 'Officially Enrolled':
        return '#388e3c';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <div className="right-content w-100">
        <div className="card shadow border-0 p-3 mt-1">
          <h3 className="mb-4">Registrar Dashboard</h3>
          
          {/* Stat Cards - Show skeleton loading */}
          <div className="row">
            {[1, 2, 3, 4].map((index) => (
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
                    <CircularProgress size={30} style={{ color: '#c70202' }} />
                    <Typography variant="h6" className="ms-2">Loading...</Typography>
                  </div>
                  <Typography variant="h3" style={{ color: '#c70202' }}>
                    --
                  </Typography>
                </Card>
              </div>
            ))}
          </div>

          <div className="row mt-4">
            {/* Enrollment Statistics - Loading State */}
            <div className="col-md-12 mb-4">
              <Card className="h-100 p-3">
                <Typography variant="h6" className="mb-3">Enrollment Statistics</Typography>
                <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                  <CircularProgress style={{ color: '#c70202' }} />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="mb-4">Registrar Dashboard</h3>
        
        {/* Stat Cards */}
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

        <div className="row mt-4">
          {/* Enrollment Statistics */}
          <div className="col-md-12 mb-4">
            <Card className="h-100 p-3">
              <Typography variant="h6" className="mb-3">Enrollment Statistics</Typography>
              
              {/* Program-wise Statistics */}
              {enrollmentStats.programStats.length > 0 ? (
                <Box mb={3}>
                  <Typography variant="subtitle2" className="mb-2">Enrollments by Program</Typography>
                  <TableContainer component={Paper} elevation={0}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Program</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="right">For Payment</TableCell>
                          <TableCell align="right">Verified</TableCell>
                          <TableCell align="right">Pending</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {enrollmentStats.programStats.map((program, index) => (
                          <TableRow key={index}>
                            <TableCell>{program.program_name}</TableCell>
                            <TableCell align="right">{program.total_enrollments}</TableCell>
                            <TableCell align="right" style={{ color: '#ed6c02', fontWeight: 'bold' }}>
                              {program.for_payment_enrollments}
                            </TableCell>
                            <TableCell align="right" style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                              {program.verified_enrollments}
                            </TableCell>
                            <TableCell align="right" style={{ color: '#ed6c02', fontWeight: 'bold' }}>
                              {program.pending_enrollments}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Box mb={3}>
                  <Typography variant="subtitle2" className="mb-2">Enrollments by Program</Typography>
                  <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', padding: '20px' }}>
                    No program enrollment data available
                  </Typography>
                </Box>
              )}

              {/* Monthly Enrollments Chart */}
              {enrollmentStats.monthlyData.length > 0 ? (
                <Box mb={3}>
                  <Typography variant="subtitle2" className="mb-2">Monthly Enrollments (Last 6 Months)</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={enrollmentStats.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tickFormatter={(value) => formatMonth(value)}
                        fontSize={12}
                      />
                      <YAxis fontSize={12} />
                      <RechartsTooltip 
                        formatter={(value, name) => [
                          value, 
                          name === 'enrollment_count' ? 'Total' : 
                          name === 'verified_count' ? 'Verified' : 'Pending'
                        ]}
                        labelFormatter={(value) => formatMonth(value)}
                      />
                      <Bar dataKey="enrollment_count" fill="#1976d2" name="Total" />
                      <Bar dataKey="verified_count" fill="#2e7d32" name="Verified" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box mb={3}>
                  <Typography variant="subtitle2" className="mb-2">Monthly Enrollments (Last 6 Months)</Typography>
                  <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', padding: '20px' }}>
                    No monthly enrollment data available
                  </Typography>
                </Box>
              )}
            </Card>
          </div>
        </div>

        {/* Additional Statistics Row */}
        <div className="row mt-4">
          {/* Year Level Distribution */}
          <div className="col-md-6 mb-4">
            <Card className="h-100 p-3">
              <Typography variant="h6" className="mb-3">Students by Year Level</Typography>
              {enrollmentStats.yearLevelStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={enrollmentStats.yearLevelStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year_level" fontSize={12} />
                    <YAxis fontSize={12} />
                    <RechartsTooltip formatter={(value) => [value, 'Students']} />
                    <Bar dataKey="total_students" fill="#1976d2" name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', padding: '20px' }}>
                  No year level data available
                </Typography>
              )}
            </Card>
          </div>

          {/* Document Completion Statistics */}
          <div className="col-md-6 mb-4">
            <Card className="h-100 p-3">
              <Typography variant="h6" className="mb-3">Document Completion Status</Typography>
              {enrollmentStats.documentStats && Object.keys(enrollmentStats.documentStats).length > 0 ? (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Typography variant="body1">Total Enrollments</Typography>
                    <Typography variant="h6" style={{ color: '#1976d2' }}>
                      {enrollmentStats.documentStats.total_enrollments || 0}
                    </Typography>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Typography variant="body1">With ID Picture</Typography>
                    <Typography variant="h6" style={{ color: '#2e7d32' }}>
                      {enrollmentStats.documentStats.with_id_pic || 0}
                    </Typography>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Typography variant="body1">With Birth Certificate</Typography>
                    <Typography variant="h6" style={{ color: '#2e7d32' }}>
                      {enrollmentStats.documentStats.with_birth_cert || 0}
                    </Typography>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Typography variant="body1">With Form 137</Typography>
                    <Typography variant="h6" style={{ color: '#2e7d32' }}>
                      {enrollmentStats.documentStats.with_form137 || 0}
                    </Typography>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Typography variant="body1">Complete Documents</Typography>
                    <Typography variant="h6" style={{ color: '#388e3c', fontWeight: 'bold' }}>
                      {enrollmentStats.documentStats.complete_documents || 0}
                    </Typography>
                  </div>
                </div>
              ) : (
                <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', padding: '20px' }}>
                  No document statistics available
                </Typography>
              )}
            </Card>
          </div>
        </div>

        {/* Grade Approval Section */}
        <div className="row mt-4">
          <div className="col-md-12 mb-4">
            <Card className="h-100 p-3">
              <Typography variant="h6" className="mb-3">Grade Approval Management</Typography>
              
              {/* Grade Statistics */}
              <div className="row mb-4">
                <div className="col-md-2 mb-2">
                  <Card className="p-2 text-center" sx={{ backgroundColor: '#f8f9fa' }}>
                    <Typography variant="h6" style={{ color: '#1976d2' }}>{gradeStats.totalGrades}</Typography>
                    <Typography variant="caption">Total Grades</Typography>
                  </Card>
                </div>
                <div className="col-md-2 mb-2">
                  <Card className="p-2 text-center" sx={{ backgroundColor: '#fff3e0' }}>
                    <Typography variant="h6" style={{ color: '#ed6c02' }}>{gradeStats.pendingApproval}</Typography>
                    <Typography variant="caption">Pending</Typography>
                  </Card>
                </div>
                <div className="col-md-2 mb-2">
                  <Card className="p-2 text-center" sx={{ backgroundColor: '#e3f2fd' }}>
                    <Typography variant="h6" style={{ color: '#1976d2' }}>{gradeStats.registrarApproved}</Typography>
                    <Typography variant="caption">Registrar Approved</Typography>
                  </Card>
                </div>
                <div className="col-md-2 mb-2">
                  <Card className="p-2 text-center" sx={{ backgroundColor: '#e8f5e8' }}>
                    <Typography variant="h6" style={{ color: '#2e7d32' }}>{gradeStats.deanApproved}</Typography>
                    <Typography variant="caption">Dean Approved</Typography>
                  </Card>
                </div>
                <div className="col-md-2 mb-2">
                  <Card className="p-2 text-center" sx={{ backgroundColor: '#f1f8e9' }}>
                    <Typography variant="h6" style={{ color: '#388e3c' }}>{gradeStats.finalApproved}</Typography>
                    <Typography variant="caption">Final</Typography>
                  </Card>
                </div>
              </div>

              {/* Grade Approval Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={gradeApprovalTab} onChange={handleGradeApprovalTabChange} aria-label="grade approval tabs">
                  <Tab label={`All Grades (${grades.length})`} />
                  <Tab label={`Pending (${gradeStats.pendingApproval})`} />
                  <Tab label={`Registrar Approved (${gradeStats.registrarApproved})`} />
                  <Tab label={`Dean Approved (${gradeStats.deanApproved})`} />
                  <Tab label={`Final (${gradeStats.finalApproved})`} />
                </Tabs>
              </Box>

              <TableContainer component={Paper} elevation={0} className="mt-3">
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
                    {grades.filter(grade => {
                      switch (gradeApprovalTab) {
                        case 0: return true;
                        case 1: return grade.approval_status === 'pending';
                        case 2: return grade.approval_status === 'registrar_approved';
                        case 3: return grade.approval_status === 'dean_approved';
                        case 4: return grade.approval_status === 'final';
                        default: return true;
                      }
                    }).length > 0 ? (
                      grades.filter(grade => {
                        switch (gradeApprovalTab) {
                          case 0: return true;
                          case 1: return grade.approval_status === 'pending';
                          case 2: return grade.approval_status === 'registrar_approved';
                          case 3: return grade.approval_status === 'dean_approved';
                          case 4: return grade.approval_status === 'final';
                          default: return true;
                        }
                      }).map((grade) => (
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
                              icon={getApprovalStatusIcon(grade.approval_status)}
                              label={grade.approval_status.replace('_', ' ').toUpperCase()}
                              style={{ 
                                backgroundColor: getApprovalStatusColor(grade.approval_status),
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
                              <Tooltip title="View Details">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => handleApproveGrade(grade)}
                                >
                                  <FaEye />
                                </IconButton>
                              </Tooltip>
                              {grade.approval_status === 'pending' && (
                                <Tooltip title="Approve as Registrar">
                                  <IconButton 
                                    size="small" 
                                    color="success"
                                    onClick={() => handleApproveGrade(grade)}
                                  >
                                    <FaCheckCircle />
                                  </IconButton>
                                </Tooltip>
                              )}
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
          </div>
        </div>

        {/* Class Approval (Per Subject/Course) */}
        <div className="row mt-4">
          <div className="col-md-12 mb-4">
            <Card className="h-100 p-3">
              <Typography variant="h6" className="mb-3">Class Approvals (Per Subject/Course)</Typography>
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
                        <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Section</TableCell>
                        <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Pending</TableCell>
                        <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Registrar Approved</TableCell>
                        <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Dean Approved</TableCell>
                        <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Final</TableCell>
                        <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(classes || []).map((cls) => (
                        <TableRow key={`${cls.pc_id}-${cls.section}`}>
                          <TableCell>{cls.course_code} - {cls.course_name}</TableCell>
                          <TableCell>{cls.section}</TableCell>
                          <TableCell>{cls.pending_count}</TableCell>
                          <TableCell>{cls.registrar_approved_count}</TableCell>
                          <TableCell>{cls.dean_approved_count}</TableCell>
                          <TableCell>{cls.final_count}</TableCell>
                          <TableCell>
                            <div className="d-flex gap-2">
                              <Button size="small" variant="contained" color="success" onClick={() => handleApproveClass(cls.pc_id, 'registrar_approve')}>Approve All (Registrar)</Button>
                              <Button size="small" variant="outlined" color="error" onClick={() => handleApproveClass(cls.pc_id, 'reject')}>Reject All</Button>
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
            <Box sx={{ mt: 2 }}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <Typography variant="subtitle2" color="textSecondary">Student</Typography>
                  <Typography variant="body1">{selectedGrade.student_name}</Typography>
                </div>
                <div className="col-md-6 mb-3">
                  <Typography variant="subtitle2" color="textSecondary">Course</Typography>
                  <Typography variant="body1">{selectedGrade.course_code} - {selectedGrade.course_name}</Typography>
                </div>
                <div className="col-md-6 mb-3">
                  <Typography variant="subtitle2" color="textSecondary">Grade</Typography>
                  <Typography variant="h6" style={{ color: '#c70202', fontWeight: 'bold' }}>
                    {selectedGrade.final_grade}
                  </Typography>
                </div>
                <div className="col-md-6 mb-3">
                  <Typography variant="subtitle2" color="textSecondary">Current Status</Typography>
                  <Chip
                    icon={getApprovalStatusIcon(selectedGrade.approval_status)}
                    label={selectedGrade.approval_status.replace('_', ' ').toUpperCase()}
                    style={{ 
                      backgroundColor: getApprovalStatusColor(selectedGrade.approval_status),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </div>
                <div className="col-md-12">
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Comments (Optional)"
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    placeholder="Add any comments about this grade approval..."
                  />
                </div>
              </div>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setApprovalDialogOpen(false)}
            disabled={approving}
          >
            Cancel
          </Button>
          {selectedGrade?.approval_status === 'pending' && (
            <Button
              onClick={() => handleApprovalSubmit('registrar_approve')}
              color="success"
              variant="contained"
              disabled={approving}
              startIcon={approving ? <CircularProgress size={16} /> : <FaCheckCircle />}
            >
              {approving ? 'Approving...' : 'Approve as Registrar'}
            </Button>
          )}
          <Button
            onClick={() => handleApprovalSubmit('reject')}
            color="error"
            variant="outlined"
            disabled={approving}
            startIcon={approving ? <CircularProgress size={16} /> : <FaTimesCircle />}
          >
            {approving ? 'Rejecting...' : 'Reject'}
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

export default RegistrarDashboard;
