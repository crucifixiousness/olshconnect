import { useState, useEffect, useCallback } from "react";
import { Button, Modal, TextField, FormControl, InputLabel, Select, MenuItem, Pagination, Snackbar, Alert, Box, Typography, Grid, CircularProgress } from "@mui/material";
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { FaCirclePlus } from "react-icons/fa6";
import { FaEdit, FaTrash } from "react-icons/fa"; 

const programMapping = {
  1: "BSIT",
  2: "BSHM",
  3: "Education",
  4: "BSOAd",
  5: "BSCrim"
};

const AssignCourses = () => {
  // Add these state declarations at the top with your other states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  
  // Add these functions with your other function declarations
  const handleOpen = () => {
    setShowAddCourseModal(true);
  };

  const handleClose = () => {
    setShowAddCourseModal(false);
    setNewAssignment({
      year_level: "",
      course_id: "",
      course_code: "",
      course_name: "",
      units: "",
      semester: ""
    });
  };
  const [loading, setLoading] = useState(false);
  const [assignedCourses, setAssignedCourses] = useState([]);
  //eslint-disable-next-line
  const [courses, setCourses] = useState([]); // Store available courses
  const [program_id, setProgramId] = useState(null);
  const [staff_id, setStaffId] = useState(null);
  const [program_name, setProgramName] = useState("");
  const [searchParams] = useSearchParams();
  const yearLevel = searchParams.get('year');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Add these new states near your other states
  const [selectedSemester, setSelectedSemester] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState('');

  // Update the handleEditOpen function
  const handleEditOpen = async (course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
    
    try {
      // Fetch instructors
      await fetchInstructors();
      
      // Fetch existing assignment data
      const response = await axios.get(`/api/course-assignment/${course.pc_id}`);
      const assignmentData = response.data;
      
      if (assignmentData) {
        setSelectedSection(assignmentData.section || '');
        setSelectedDay(assignmentData.day || '');
        setStartTime(assignmentData.start_time || '');
        setEndTime(assignmentData.end_time || '');
        setSelectedInstructor(assignmentData.staff_id || '');
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error);
      setSnackbar({
        open: true,
        message: "Failed to fetch assignment details",
        severity: 'error'
      });
    }
  };
  
  // Update handleEditClose to reset all fields
  const handleEditClose = () => {
    setShowEditModal(false);
    setSelectedCourse(null);
    setSelectedInstructor('');
    setSelectedSection('');
    setSelectedDay('');
    setStartTime('');
    setEndTime('');
  };

  // Add this function to fetch instructors
  // Wrap fetchInstructors in useCallback
  const fetchInstructors = useCallback(async () => {
    try {
      setLoading(true);
      // Get staff_id from state
      const storedStaffId = localStorage.getItem('staff_id');
      const response = await axios.get(`/api/instructor-courses?staff_id=${storedStaffId}`);
      setInstructors(response.data);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      setSnackbar({
        open: true,
        message: "Failed to fetch instructors",
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []); // No need for staff_id dependency as we're getting it from localStorage
  
  // Update the useEffect
  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]); // Add fetchInstructors as dependency

  // Modify your filteredCourses logic to include semester filtering
  const filteredCourses = assignedCourses.filter(course => {
    const yearMatch = yearLevel ? course.year_level === parseInt(yearLevel) : true;
    const semesterMatch = selectedSemester ? course.semester === selectedSemester : true;
    return yearMatch && semesterMatch;
  });

  // Add this handler function
  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };
    
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);
  const pageCount = Math.ceil(filteredCourses.length / rowsPerPage);

  const [newAssignment, setNewAssignment] = useState({
    year_level: "",
    course_id: "",
    course_code: "",
    course_name: "",
    units: "",
    semester: ""
  });
  
  // Fetch logged-in user details (assuming it's stored in localStorage)
  useEffect(() => {
    const storedProgramId = localStorage.getItem("program_id");
    const storedStaffId = localStorage.getItem("staff_id"); // Add this line
    
    if (storedProgramId) {
      const programId = parseInt(storedProgramId, 10);
      if (!isNaN(programId)) {
        setProgramId(programId);
        setProgramName(programMapping[programId] || "Unknown");
      }
    }

    if (storedStaffId) { // Add this block
      setStaffId(storedStaffId);
    }
  }, []);
  
  // Fetch program_name based on program_id
  useEffect(() => {
    if (program_id) {
      const fetchProgramName = async () => {
        try {
          const response = await axios.get(`/api/program/${program_id}`);
          setProgramName(response.data.program_name);
        } catch (error) {
          console.error("Error fetching program name:", error);
        }
      };
      fetchProgramName();
    }
  }, [program_id]);
  
  // First, wrap fetchAssignedCourses in useCallback
  const fetchAssignedCourses = useCallback(async () => {
    if (!program_id) return;
    try {
      const response = await axios.get(`/api/program-courses?program_id=${program_id}`); // Fixed: Using actual program_id
      setAssignedCourses(response.data);
    } catch (error) {
      console.error("Error fetching assigned courses:", error);
    }
  }, [program_id]);
  
  // Then update the useEffects that use fetchAssignedCourses
  useEffect(() => {
    if (program_id) {
      fetchAssignedCourses();
      fetchCourses();
    }
  }, [program_id, fetchAssignedCourses]);
  
  useEffect(() => {
    fetchAssignedCourses();
    fetchCourses();
  }, [program_id, fetchAssignedCourses]);

  // Fetch all available courses
  const fetchCourses = async () => {
    try {
      const response = await axios.get("/api/courses");
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };
  
  useEffect(() => {
    fetchAssignedCourses();
    fetchCourses();
  }, [program_id, fetchAssignedCourses]); // Runs when program_id is available
  
  // Handle input changes
  const handleInputChange = (e) => {
    setNewAssignment({ ...newAssignment, [e.target.name]: e.target.value });
  };
  
  // Assign Course
  const handleAssignCourse = async (event) => {
    event.preventDefault();
    console.log("Form submitted");
  
    if (!program_id || !newAssignment.year_level || !newAssignment.course_code || 
        !newAssignment.course_name || !newAssignment.units || !newAssignment.semester) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields",
        severity: 'error'
      });
      return;
    }
  
    try {
      const response = await axios.post("/api/program-course", {
        program_id: program_id,
        course_code: newAssignment.course_code,
        course_name: newAssignment.course_name,
        units: newAssignment.units,
        semester: newAssignment.semester,
        year_level: newAssignment.year_level
      });
  
      console.log("Response:", response.data);
      setSnackbar({
        open: true,
        message: "Course assigned successfully!",
        severity: 'success'
      });
      handleClose();
      fetchAssignedCourses();
    } catch (error) {
      console.error("Error assigning course:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message;
      setSnackbar({
        open: true,
        message: "Failed to assign course: " + errorMessage,
        severity: 'error'
      });
    }
  };

  // Add this function after your existing functions
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Update the handleEditSubmit function
  const handleEditSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedCourse || !selectedInstructor || !selectedSection || !selectedDay || !startTime || !endTime) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields",
        severity: 'error'
      });
      return;
    }
  
    try {
      await axios.put(`/api/assign-instructor`, {
        course_id: selectedCourse.pc_id, // Make sure you're using the correct ID field
        instructor_id: selectedInstructor,
        section: selectedSection,
        day: selectedDay,
        start_time: startTime,
        end_time: endTime
      });
  
      setSnackbar({
        open: true,
        message: "Instructor assigned successfully!",
        severity: 'success'
      });
  
      handleEditClose();
      fetchAssignedCourses(); // Refresh the course list
    } catch (error) {
      console.error("Error assigning instructor:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to assign instructor",
        severity: 'error'
      });
    }
  };

  // Update the loading check in the return statement
  if (loading) {
    return (
      <div className="right-content w-100">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
          <CircularProgress style={{ color: '#c70202' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0">Assign Courses to Year Level</h3>
      </div>

      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd">
          Courses {yearLevel ? `- Year ${yearLevel}` : ''}
        </h3>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="semester-filter-label">Filter by Semester</InputLabel>
            <Select
              labelId="semester-filter-label"
              value={selectedSemester}
              onChange={handleSemesterChange}
              label="Filter by Semester"
              data-testid="semester-filter"
            >
              <MenuItem value="">All Semesters</MenuItem>
              <MenuItem value="1st">1st Semester</MenuItem>
              <MenuItem value="2nd">2nd Semester</MenuItem>
              <MenuItem value="Summer">Summer</MenuItem>
            </Select>
          </FormControl>
          <div className="addreq d-flex justify-content-end">
          <Button variant="contained" color="primary" onClick={handleOpen} data-testid="assign-course-button">
            <FaCirclePlus/> ASSIGN COURSE
          </Button>
          </div>
        </div>

        <div className="table-responsive mt-3">
          <table className="table table-bordered v-align" data-testid="courses-table">
            <thead className="thead-dark">
              <tr>
                <th>Program</th>
                <th>Year Level</th>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Units</th>
                <th>Semester</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
            {paginatedCourses.length > 0 ? (
              paginatedCourses.map((assignment, index) => (
                  <tr key={index}>
                    <td>{assignment.program_name}</td>
                    <td>{assignment.year_level}</td>
                    <td>{assignment.course_code}</td>
                    <td>{assignment.course_name}</td>
                    <td>{assignment.units}</td>
                    <td>{assignment.semester}</td>
                    <td>
                      <div className="actions d-flex align-items-center gap-2">
                        <Button 
                          className="success" 
                          color="success" 
                          size="small"
                          onClick={() => handleEditOpen(assignment)}
                        >
                          <FaEdit />
                        </Button>
                        <Button className="error" color="error" size="small">
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No course assignments available{yearLevel ? ` for Year ${yearLevel}` : ''}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="d-flex tableFooter">
            <Pagination 
              count={pageCount}
              page={page}
              onChange={handlePageChange}
              color="primary" 
              className="pagination"
              showFirstButton 
              showLastButton 
            />
          </div>
        </div>
      </div>

      {/* Modal for Assigning a Course */}
      <Modal
        open={showAddCourseModal}
        onClose={handleClose}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: "90%",
          maxWidth: "600px",
          margin: "50px auto",
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "30px",
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          maxHeight: "90vh",
          overflowY: "auto",
        }}>
          <Button
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: "10px",
              right: "10px",
              minWidth: "30px",
              minHeight: "30px",
              padding: "5px",
              fontSize: "1.2rem",
              color: "#c70202",
              '&:hover': {
                backgroundColor: 'rgba(199, 2, 2, 0.1)',
              },
            }}
          >
            &times;
          </Button>

          <Typography variant="h5" sx={{ 
            textAlign: "center", 
            marginBottom: "20px",
            color: '#c70202',
            fontWeight: 'bold'
          }}>
            Assign Course
          </Typography>

          <form onSubmit={handleAssignCourse}>
            <div className="registration-section">
              <Typography variant="h6" className="section-title">
                Program Details
              </Typography>
              <TextField 
                label="Program" 
                value={program_name || "Not Found"} 
                fullWidth 
                margin="normal" 
                disabled 
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Year Level</InputLabel>
                <Select
                  name="year_level"
                  value={newAssignment.year_level}
                  onChange={handleInputChange}
                  data-testid="input-year-level"
                >
                  <MenuItem value={1}>1st Year</MenuItem>
                  <MenuItem value={2}>2nd Year</MenuItem>
                  <MenuItem value={3}>3rd Year</MenuItem>
                  <MenuItem value={4}>4th Year</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="registration-section">
              <Typography variant="h6" className="section-title">
                Course Information
              </Typography>
              <TextField 
                label="Course Code" 
                name="course_code" 
                value={newAssignment.course_code} 
                onChange={handleInputChange} 
                fullWidth 
                margin="normal"
                data-testid="input-course-code" 
              />
              <TextField 
                label="Course Name" 
                name="course_name" 
                value={newAssignment.course_name} 
                onChange={handleInputChange} 
                fullWidth 
                margin="normal"
                data-testid="input-course-name" 
              />
              <TextField 
                label="Units" 
                name="units" 
                type="number"
                value={newAssignment.units} 
                onChange={handleInputChange} 
                fullWidth 
                margin="normal"
                data-testid="input-units" 
              />
            </div>

            <div className="registration-section">
              <Typography variant="h6" className="section-title">
                Semester
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Semester</InputLabel>
                <Select
                  name="semester"
                  value={newAssignment.semester}
                  onChange={handleInputChange}
                  data-testid="input-semester"
                >
                  <MenuItem value="1st">1st Semester</MenuItem>
                  <MenuItem value="2nd">2nd Semester</MenuItem>
                  <MenuItem value="Summer">Summer</MenuItem>
                </Select>
              </FormControl>
            </div>

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              sx={{ 
                mt: 3,
                bgcolor: '#c70202',
                '&:hover': {
                  bgcolor: '#a00000',
                },
                height: '45px',
                fontWeight: 'bold'
              }}
              data-testid="submit-button"
            >
              Save Course Assignment
            </Button>
          </form>
        </Box>
      </Modal>

      <Modal
        open={showEditModal}
        onClose={handleEditClose}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: "90%",
          maxWidth: "600px",
          margin: "50px auto",
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "30px",
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          maxHeight: "90vh",
          overflowY: "auto",
        }}>
          <Button
            onClick={handleEditClose}
            sx={{
              position: "absolute",
              top: "10px",
              right: "10px",
              minWidth: "30px",
              minHeight: "30px",
              padding: "5px",
              fontSize: "1.2rem",
              color: "#c70202",
              '&:hover': {
                backgroundColor: 'rgba(199, 2, 2, 0.1)',
              },
            }}
          >
            &times;
          </Button>

          <Typography variant="h5" sx={{ 
            textAlign: "center", 
            marginBottom: "20px",
            color: '#c70202',
            fontWeight: 'bold'
          }}>
            Edit Course Assignment
          </Typography>

          <form onSubmit={handleEditSubmit}>
            <div className="registration-section">
              <Typography variant="h6" className="section-title">
                Course Details
              </Typography>
              <TextField 
                label="Course Name" 
                value={selectedCourse?.course_name || ''} 
                fullWidth 
                margin="normal" 
                disabled 
              />
            </div>

            <div className="registration-section">
              <Typography variant="h6" className="section-title">
                Section Assignment
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Block/Section</InputLabel>
                <Select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  <MenuItem value="A">Block A</MenuItem>
                  <MenuItem value="B">Block B</MenuItem>
                  <MenuItem value="C">Block C</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="registration-section">
              <Typography variant="h6" className="section-title">
                Schedule
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Day</InputLabel>
                <Select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                >
                  <MenuItem value="Monday">Monday</MenuItem>
                  <MenuItem value="Tuesday">Tuesday</MenuItem>
                  <MenuItem value="Wednesday">Wednesday</MenuItem>
                  <MenuItem value="Thursday">Thursday</MenuItem>
                  <MenuItem value="Friday">Friday</MenuItem>
                  <MenuItem value="Saturday">Saturday</MenuItem>
                </Select>
              </FormControl>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <TextField
                    label="Start Time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="End Time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </div>

            <div className="registration-section">
              <Typography variant="h6" className="section-title">
                Instructor Assignment
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Instructor</InputLabel>
                <Select
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                  disabled={loading}
                >
                  {instructors.map((instructor) => (
                    <MenuItem key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              sx={{ 
                mt: 3,
                bgcolor: '#c70202',
                '&:hover': {
                  bgcolor: '#a00000',
                },
                height: '45px',
                fontWeight: 'bold'
              }}
            >
              Save Changes
            </Button>
          </form>
        </Box>
      </Modal>

      {/* Add this before the closing div */}
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

export default AssignCourses;
