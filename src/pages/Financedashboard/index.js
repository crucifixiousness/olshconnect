import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Card, Typography, CircularProgress, Box } from '@mui/material';
import { FaMoneyBillWave, FaUserGraduate, FaFileInvoiceDollar, FaCreditCard } from 'react-icons/fa';
import { MyContext } from '../../App';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const FinanceDashboard = () => {
  const context = useContext(MyContext);

  useEffect(() => {
    context.setIsHideComponents(false);
    window.scrollTo(0,0);
  }, [context]);

  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalStudentsPaid: 0,
    pendingPayments: 0,
    recentTransactions: []
  });
  const [paymentStats, setPaymentStats] = useState({
    monthlyData: [],
    paymentMethods: [],
    programStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        // Fetch dashboard data from new API
        const response = await axios.get('/api/finance-dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setDashboardData({
          totalRevenue: response.data.totalRevenue || 0,
          totalStudentsPaid: response.data.totalStudentsPaid || 0,
          pendingPayments: response.data.pendingPayments || 0,
          recentTransactions: response.data.recentTransactions || []
        });

        setPaymentStats({
          monthlyData: (response.data.paymentStats?.monthlyData || []).map(item => ({
            ...item,
            monthly_revenue: parseFloat(item.monthly_revenue) || 0,
            transaction_count: parseInt(item.transaction_count) || 0
          })),
          paymentMethods: (response.data.paymentStats?.paymentMethods || []).map(item => ({
            ...item,
            total_amount: parseFloat(item.total_amount) || 0,
            count: parseInt(item.count) || 0
          })),
          programStats: (response.data.paymentStats?.programStats || []).map(item => ({
            ...item,
            total_revenue: parseFloat(item.total_revenue) || 0,
            student_count: parseInt(item.student_count) || 0
          }))
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching finance data:', error);
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₱${dashboardData.totalRevenue.toLocaleString()}`,
      icon: <FaMoneyBillWave size={30} />,
      color: '#1976d2'
    },
    {
      title: 'Students Who Paid',
      value: dashboardData.totalStudentsPaid,
      icon: <FaUserGraduate size={30} />,
      color: '#2e7d32'
    },
    {
      title: 'Pending Payments',
      value: dashboardData.pendingPayments,
      icon: <FaFileInvoiceDollar size={30} />,
      color: '#ed6c02'
    },
    {
      title: 'Recent Transactions',
      value: dashboardData.recentTransactions.length,
      icon: <FaCreditCard size={30} />,
      color: '#9c27b0'
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMonth = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="mb-4">Finance Dashboard</h3>
        
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
          {/* Recent Transactions */}
          <div className="col-md-6 mb-4">
            <Card className="h-100 p-3">
              <Typography variant="h6" className="mb-3">Recent Transactions</Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Student</TableCell>
                      <TableCell>Program</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Method</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.recentTransactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(transaction.payment_date)}</TableCell>
                        <TableCell>
                          <div style={{ fontWeight: 'bold' }}>{transaction.student_name}</div>
                          <div style={{ fontSize: '0.8em', color: 'gray' }}>ID: {transaction.student_id}</div>
                        </TableCell>
                        <TableCell>
                          <div>{transaction.program_name}</div>
                          <div style={{ fontSize: '0.8em', color: 'gray' }}>{transaction.year_level}</div>
                        </TableCell>
                        <TableCell style={{ fontWeight: 'bold', color: '#2e7d32' }}>
                          ₱{parseFloat(transaction.amount_paid).toLocaleString()}
                        </TableCell>
                        <TableCell>{transaction.payment_method}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </div>

          {/* Payment Statistics */}
          <div className="col-md-6 mb-4">
            <Card className="h-100 p-3">
              <Typography variant="h6" className="mb-3">Payment Statistics</Typography>
              
              {/* Monthly Revenue Chart */}
              {paymentStats.monthlyData.length > 0 ? (
                <Box mb={3}>
                  <Typography variant="subtitle2" className="mb-2">Monthly Revenue (Last 6 Months)</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={paymentStats.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tickFormatter={(value) => formatMonth(value)}
                        fontSize={12}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        formatter={(value, name) => [
                          `₱${parseFloat(value).toLocaleString()}`, 
                          name === 'monthly_revenue' ? 'Revenue' : 'Transactions'
                        ]}
                        labelFormatter={(value) => formatMonth(value)}
                      />
                      <Bar dataKey="monthly_revenue" fill="#1976d2" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box mb={3}>
                  <Typography variant="subtitle2" className="mb-2">Monthly Revenue (Last 6 Months)</Typography>
                  <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', padding: '20px' }}>
                    No monthly revenue data available
                  </Typography>
                </Box>
              )}

              {/* Payment Methods Distribution */}
              {paymentStats.paymentMethods.length > 0 ? (
                <Box mb={3}>
                  <Typography variant="subtitle2" className="mb-2">Payment Methods Distribution</Typography>
                  {console.log('🎯 Payment Methods Data:', paymentStats.paymentMethods)}
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={paymentStats.paymentMethods}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total_amount"
                        nameKey="payment_method"
                      >
                        {paymentStats.paymentMethods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`₱${parseFloat(value).toLocaleString()}`, name]}
                        labelFormatter={(value) => value}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Debug: Show payment methods data as text */}
                  <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                    <Typography variant="caption" color="textSecondary">
                      Payment Methods Data: {JSON.stringify(paymentStats.paymentMethods)}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box mb={3}>
                  <Typography variant="subtitle2" className="mb-2">Payment Methods Distribution</Typography>
                  <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', padding: '20px' }}>
                    No payment method data available
                  </Typography>
                </Box>
              )}

              {/* Program-wise Statistics */}
              {paymentStats.programStats.length > 0 ? (
                <Box>
                  <Typography variant="subtitle2" className="mb-2">Revenue by Program</Typography>
                  <TableContainer component={Paper} elevation={0}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Program</TableCell>
                          <TableCell align="right">Students</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paymentStats.programStats.map((program, index) => (
                          <TableRow key={index}>
                            <TableCell>{program.program_name}</TableCell>
                            <TableCell align="right">{program.student_count}</TableCell>
                            <TableCell align="right" style={{ fontWeight: 'bold', color: '#2e7d32' }}>
                              ₱{parseFloat(program.total_revenue || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Box>
                  <Typography variant="subtitle2" className="mb-2">Revenue by Program</Typography>
                  <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', padding: '20px' }}>
                    No program revenue data available
                  </Typography>
                </Box>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
