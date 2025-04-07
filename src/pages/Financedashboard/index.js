import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Card, Typography, CircularProgress } from '@mui/material';
import { FaMoneyBillWave, FaUserGraduate, FaFileInvoiceDollar, FaCreditCard } from 'react-icons/fa';
import { MyContext } from '../../App';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const FinanceDashboard = () => {
  const context = useContext(MyContext);

  useEffect(() => {
    context.setIsHideComponents(false);
    window.scrollTo(0,0);
  }, [context]);

  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    pendingPayments: 0,
    recentTransactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        // Fetch dashboard data
        const dashboardResponse = await axios.get('http://localhost:4000/finance/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch recent transactions
        const transactionsResponse = await axios.get('http://localhost:4000/finance/recent-transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setRecentTransactions(transactionsResponse.data);
        setDashboardData({
          totalRevenue: Number(dashboardResponse.data.totalRevenue) || 0,
          totalStudents: Number(dashboardResponse.data.totalStudents) || 0,
          pendingPayments: Number(dashboardResponse.data.pendingPayments) || 0,
          recentTransactions: Number(dashboardResponse.data.recentTransactions) || 0
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error details:', error);
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
      title: 'Total Students',
      value: dashboardData.totalStudents,
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
      value: dashboardData.recentTransactions,
      icon: <FaCreditCard size={30} />,
      color: '#9c27b0'
    }
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <CircularProgress />
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="mb-4">Finance Dashboard</h3>
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
          <div className="col-md-6 mb-4">
            <Card className="h-100 p-3">
              <Typography variant="h6" className="mb-3">Recent Transactions</Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Student</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentTransactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>
                          <div>{transaction.student_name}</div>
                          <div style={{ fontSize: '0.8em', color: 'gray' }}>{transaction.student_id}</div>
                        </TableCell>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell>₱{transaction.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </div>
          <div className="col-md-6 mb-4">
            <Card className="h-100 p-3">
              <Typography variant="h6" className="mb-3">Payment Statistics</Typography>
              {/* Add payment statistics or charts here */}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;