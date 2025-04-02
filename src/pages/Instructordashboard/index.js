import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Card, Typography, CircularProgress } from '@mui/material';
import { FaChalkboardTeacher, FaUserGraduate, FaClipboardList, FaClock } from 'react-icons/fa';
import { MyContext } from '../../App';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const InstructorDashboard = () => {
  const context = useContext(MyContext);

  useEffect(() => {
    context.setIsHideComponents(false);
    window.scrollTo(0,0);
  }, [context]);

  const [dashboardData, setDashboardData] = useState({
    assignedClasses: 0,
    totalStudents: 0,
    pendingGrades: 0,
    todayClasses: 0
  });
  const [loading, setLoading] = useState(true);
  const [todaySchedule, setTodaySchedule] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const staff_id = user?.staff_id;
        const token = localStorage.getItem('token');
        
        if (!staff_id || !token) {
          console.error('No staff ID or token found');
          setLoading(false);
          return;
        }

        // Fetch dashboard data
        const dashboardResponse = await axios.get(`http://localhost:4000/instructor/dashboard/${staff_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch today's schedule
        const scheduleResponse = await axios.get(`http://localhost:4000/instructor-courses/${staff_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todayCourses = scheduleResponse.data.filter(course => course.day === today);
        
        setTodaySchedule(todayCourses.sort((a, b) => a.start_time.localeCompare(b.start_time)));
        setDashboardData({
          assignedClasses: Number(dashboardResponse.data.assignedClasses) || 0,
          totalStudents: Number(dashboardResponse.data.totalStudents) || 0,
          pendingGrades: Number(dashboardResponse.data.pendingGrades) || 0,
          todayClasses: Number(dashboardResponse.data.todayClasses) || 0
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error details:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Assigned Classes',
      value: dashboardData.assignedClasses,
      icon: <FaChalkboardTeacher size={30} />,
      color: '#1976d2'
    },
    {
      title: 'Total Students',
      value: dashboardData.totalStudents,
      icon: <FaUserGraduate size={30} />,
      color: '#2e7d32'
    },
    {
      title: 'Pending Grades',
      value: dashboardData.pendingGrades,
      icon: <FaClipboardList size={30} />,
      color: '#ed6c02'
    },
    {
      title: 'Classes Today',
      value: dashboardData.todayClasses,
      icon: <FaClock size={30} />,
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

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="mb-4">Instructor Dashboard</h3>
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

        {/* Recent Activities Section */}
        <div className="row mt-4">
          <div className="col-md-6 mb-4">
            <Card className="h-100 p-3">
              <Typography variant="h6" className="mb-3">Today's Schedule</Typography>
              {todaySchedule.length > 0 ? (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Course</TableCell>
                        <TableCell>Section</TableCell>
                        <TableCell>Program</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {todaySchedule.map((course, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {formatTime(course.start_time)} - {formatTime(course.end_time)}
                          </TableCell>
                          <TableCell>
                            <div>{course.course_code}</div>
                            <div style={{ fontSize: '0.8em', color: 'gray' }}>{course.course_name}</div>
                          </TableCell>
                          <TableCell>{course.section}</TableCell>
                          <TableCell>
                            {course.program_name} {course.year_level}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  No classes scheduled for today
                </Typography>
              )}
            </Card>
          </div>
          <div className="col-md-6 mb-4">
            <Card className="h-100 p-3">
              <Typography variant="h6" className="mb-3">Recent Activities</Typography>
              {/* Add activities list here */}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;