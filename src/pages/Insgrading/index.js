import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress
} from '@mui/material';

const InstructorGrades = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        
        const response = await axios.get(
          `http://localhost:4000/instructor-courses/${user.staff_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setCourses(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:4000/course-students/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setStudents(response.data);
      
      // Initialize grades object
      const initialGrades = {};
      response.data.forEach(student => {
        initialGrades[student.student_id] = student.final_grade || '';
      });
      setGrades(initialGrades);
      
    } catch (error) {
      console.error('Error fetching students:', error);
    }
    
    setLoading(false);
  };

  const handleGradeChange = (studentId, value) => {
    // Validate grade input (1.0 to 5.0)
    const grade = parseFloat(value);
    if ((grade >= 1.0 && grade <= 5.0) || value === '') {
      setGrades(prev => ({
        ...prev,
        [studentId]: value
      }));
    }
  };

  const handleSaveGrades = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:4000/save-grades',
        {
          courseId: selectedCourse,
          grades: grades
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Grades saved successfully!');
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Failed to save grades. Please try again.');
    }
    setSaving(false);
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
        <h3 className="mb-4">Grade Entry</h3>
        
        <Card className="mb-4 p-3">
          <div className="row align-items-center">
            <div className="col-md-6">
              <Typography variant="subtitle1" className="mb-2">Select Course</Typography>
              <Select
                fullWidth
                value={selectedCourse}
                onChange={(e) => handleCourseChange(e.target.value)}
              >
                {courses.map((course) => (
                  <MenuItem key={course.pc_id} value={course.pc_id}>
                    {course.course_code} - {course.course_name} ({course.section})
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {selectedCourse && students.length > 0 && (
          <Card className="p-3">
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Final Grade</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell>{student.student_id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          inputProps={{ 
                            step: "0.1",
                            min: "1.0",
                            max: "5.0"
                          }}
                          value={grades[student.student_id]}
                          onChange={(e) => handleGradeChange(student.student_id, e.target.value)}
                          size="small"
                          style={{ width: '100px' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <div className="d-flex justify-content-end mt-3">
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSaveGrades}
                disabled={saving}
              >
                {saving ? <CircularProgress size={24} /> : 'Save Grades'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InstructorGrades;