import { useState, useEffect } from "react";
import { 
  Button, 
  Snackbar, 
  Alert, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip,
  Skeleton,
  Grid,
  Paper
} from "@mui/material";
import { 
  School as SchoolIcon, 
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ClassManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const formatTime = (time) => {
    if (!time) return '';
    // If time already includes AM/PM, return as is
    if (time.includes('AM') || time.includes('PM')) {
      return time;
    }
    // Otherwise, format the time
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getDayColor = (day) => {
    const colors = {
      'Monday': '#1976d2',
      'Tuesday': '#388e3c',
      'Wednesday': '#f57c00',
      'Thursday': '#7b1fa2',
      'Friday': '#d32f2f',
      'Saturday': '#5d4037'
    };
    return colors[day] || '#757575';
  };

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      // Get staff_id from localStorage with safe parsing
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const staff_id = user?.staff_id;
      const token = localStorage.getItem('token');

      if (!staff_id || !token) {
        setSnackbar({
          open: true,
          message: "Please login again",
          severity: 'error'
        });
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`/api/instructor-subjects?staff_id=${staff_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch courses",
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorCourses();
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCourseClick = (course) => {
    // Store selected course details for sub-pages
    localStorage.setItem('selectedCourse', JSON.stringify(course));
    navigate(`/instructor-classes/grades?course=${course.pc_id}`);
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3].map((item) => (
        <Grid item xs={12} md={6} lg={4} key={item}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="80%" height={24} />
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Skeleton variant="rectangular" width={80} height={24} />
                <Skeleton variant="rectangular" width={100} height={24} />
              </Box>
              <Skeleton variant="text" width="70%" height={20} sx={{ mt: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={36} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0">Class Management</h3>
      </div>

      {/* Courses Grid */}
      <div className="card shadow border-0 p-3 mt-1">
        {loading ? (
          <LoadingSkeleton />
        ) : courses.length > 0 ? (
          <Grid container spacing={3}>
            {courses.map((course, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                          {course.course_code}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                          {course.course_name}
                        </Typography>
                      </Box>
                      <Chip 
                        label={course.units + ' units'} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Section: <strong>{course.section}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Program: <strong>{course.program_name}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Year Level: <strong>{course.year_level}</strong>
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {course.day} • {formatTime(course.start_time)} - {formatTime(course.end_time)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip 
                        label={course.semester} 
                        size="small" 
                        sx={{ 
                          backgroundColor: course.semester === '1st' ? '#e3f2fd' : 
                                         course.semester === '2nd' ? '#f3e5f5' : '#fff3e0',
                          color: course.semester === '1st' ? '#1976d2' : 
                                 course.semester === '2nd' ? '#7b1fa2' : '#f57c00'
                        }}
                      />
                      <Chip 
                        label={course.day} 
                        size="small" 
                        sx={{ 
                          backgroundColor: getDayColor(course.day) + '20',
                          color: getDayColor(course.day),
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>

                    <Button 
                      data-testid={`manage-button-${index}`}
                      variant="contained" 
                      fullWidth
                      onClick={() => handleCourseClick(course)}
                      sx={{ 
                        backgroundColor: '#1976d2',
                        '&:hover': {
                          backgroundColor: '#1565c0'
                        }
                      }}
                    >
                      Manage Class
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
              No courses found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You have not been assigned to any courses yet.
            </Typography>
          </Paper>
        )}
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ClassManagement;
