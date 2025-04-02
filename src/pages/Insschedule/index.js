import { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from "@mui/material";
import axios from 'axios';

const InstructorSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch logged-in instructor details
  useEffect(() => {
    const fetchInstructorSchedule = async () => {
      // Get staff_id from localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      const staff_id = user?.staff_id;
      
      if (!staff_id) {
        setSnackbar({
          open: true,
          message: "No instructor ID found. Please login again.",
          severity: 'error'
        });
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:4000/instructor-courses/${staff_id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data) {
          setSchedules(response.data);
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
        setSnackbar({
          open: true,
          message: error.response?.data?.error || "Failed to fetch schedule",
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

 

    fetchInstructorSchedule();
  }, []);

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const filteredSchedules = schedules.filter(schedule => 
    selectedSemester ? schedule.semester === selectedSemester : true
  );

  // Sort schedules by day and time
  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayDiff = days.indexOf(a.day) - days.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return a.start_time.localeCompare(b.start_time);
  });

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0">My Teaching Schedule</h3>
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

        <div className="table-responsive mt-3">
          <table className="table table-bordered v-align">
            <thead className="thead-dark">
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Units</th>
                <th>Section</th>
                <th>Day</th>
                <th>Time</th>
                <th>Program</th>
                <th>Year Level</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center">Loading...</td>
                </tr>
              ) : sortedSchedules.length > 0 ? (
                sortedSchedules.map((schedule, index) => (
                  <tr key={index}>
                    <td>{schedule.course_code}</td>
                    <td>{schedule.course_name}</td>
                    <td>{schedule.units}</td>
                    <td>{schedule.section}</td>
                    <td>{schedule.day}</td>
                    <td>{`${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`}</td>
                    <td>{schedule.program_name}</td>
                    <td>{schedule.year_level}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No schedules available{selectedSemester ? ` for ${selectedSemester} Semester` : ''}.
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

export default InstructorSchedule;