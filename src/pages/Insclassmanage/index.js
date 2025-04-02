import { useState, useEffect } from "react";
import { Button, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from "@mui/material";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ClassManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState('');
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      const staff_id = localStorage.getItem('staff_id');
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
        const response = await axios.get(`http://localhost:4000/instructor-courses/${staff_id}`, {
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

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCourseClick = (course) => {
    // Store selected course details for sub-pages
    localStorage.setItem('selectedCourse', JSON.stringify(course));
    navigate(`/instructor-classes/grades?course=${course.pc_id}`);
  };

  const filteredCourses = courses.filter(course => 
    selectedSemester ? course.semester === selectedSemester : true
  );

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0">Class Management</h3>
      </div>

      <div className="card shadow border-0 p-3 mt-1">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="semester-filter-label">Filter by Semester</InputLabel>
            <Select
              labelId="semester-filter-label"
              value={selectedSemester}
              onChange={handleSemesterChange}
              label="Filter by Semester"
            >
              <MenuItem value="">All Semesters</MenuItem>
              <MenuItem value="1st">1st Semester</MenuItem>
              <MenuItem value="2nd">2nd Semester</MenuItem>
              <MenuItem value="Summer">Summer</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="thead-dark">
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Section</th>
                <th>Schedule</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center">Loading...</td>
                </tr>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course, index) => (
                  <tr key={index}>
                    <td>{course.course_code}</td>
                    <td>{course.course_name}</td>
                    <td>{course.section}</td>
                    <td>{`${course.day} ${formatTime(course.start_time)} - ${formatTime(course.end_time)}`}</td>
                    <td>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="small"
                        onClick={() => handleCourseClick(course)}
                      >
                        Manage Class
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No courses found{selectedSemester ? ` for ${selectedSemester} semester` : ''}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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