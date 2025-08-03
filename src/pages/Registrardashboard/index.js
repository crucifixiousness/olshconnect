import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Card, Typography, CircularProgress, Box } from '@mui/material';
import { IoIosPeople } from "react-icons/io";
import { FaFileAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { MyContext } from "../../App";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching registrar data:', error);
        setLoading(false);
      }
    };

    fetchRegistrarData();
  }, []);

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
        
        {/* Summary Cards */}
        <div className="dashboardBoxWrapper">
          <div className="dashboardBox" style={{ background: 'linear-gradient(135deg, #1976d2, #1565c0)' }}>
            <div className="col1">
              <h4>Total Enrollments</h4>
              <span>{dashboardData.totalEnrollments}</span>
            </div>
            <div className="icon">
              <IoIosPeople size={40} />
            </div>
          </div>
          
          <div className="dashboardBox" style={{ background: 'linear-gradient(135deg, #ed6c02, #e65100)' }}>
            <div className="col1">
              <h4>For Payment</h4>
              <span>{dashboardData.totalForPayment}</span>
            </div>
            <div className="icon">
              <FaFileAlt size={40} />
            </div>
          </div>

          <div className="dashboardBox" style={{ background: 'linear-gradient(135deg, #2e7d32, #1b5e20)' }}>
            <div className="col1">
              <h4>Verified</h4>
              <span>{dashboardData.totalVerified}</span>
            </div>
            <div className="icon">
              <FaCheckCircle size={40} />
            </div>
          </div>

          <div className="dashboardBox" style={{ background: 'linear-gradient(135deg, #d32f2f, #c62828)' }}>
            <div className="col1">
              <h4>Pending</h4>
              <span>{dashboardData.totalPending}</span>
            </div>
            <div className="icon">
              <FaTimesCircle size={40} />
            </div>
          </div>
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
                      <Tooltip 
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
                    <Tooltip formatter={(value) => [value, 'Students']} />
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
      </div>
    </div>
  );
};

export default RegistrarDashboard;
