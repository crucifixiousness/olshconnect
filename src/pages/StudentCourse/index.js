import { useContext, useEffect, useState } from 'react';
import { 
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import axios from 'axios';
import { MyContext } from "../../App";

const StudentCourses = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  /* eslint-disable no-unused-vars */
  const [showBy, setshowBy] = useState('');
  const [showCourseBy, setCourseBy] = useState('');
  /* eslint-disable no-unused-vars */
  const context = useContext(MyContext);

  useEffect(() => {
    context.setIsHideComponents(false);
    window.scrollTo(0, 0);

    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to view your courses.');
          setCourses([]);
          return;
        }
        
        const { data } = await axios.get('/api/student-courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setCourses(Array.isArray(data.courses) ? data.courses : []);
      } catch (err) {
        const message = err.response?.data?.error || 'Failed to load courses.';
        setError(message);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [context]);

  // Debug logging for state changes
  useEffect(() => {
    // State changes logged
  }, [courses, loading, error]);

  return (
    <div className="right-content w-100" data-testid="student-courses">
      <div className="card shadow border-0 p-3">      
        <h3 className="hd mt-2 pb-0">My Courses</h3>
      </div>
 
      {/* Course List Section */}
      <div className="card shadow border-0 p-3 mt-3">
        {/* Course Table */}
        <div className="mt-3">
          <Paper elevation={3} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
            <TableContainer>
              <Table aria-label="courses table" data-testid="courses-table">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }} data-testid="header-course-title">Course Title</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }} align="center" data-testid="header-code">Code</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }} align="center" data-testid="header-units">Unit/s</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }} align="center" data-testid="header-prerequisite">Pre-requisite</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan="4" style={{ textAlign: "center", padding: "40px 0" }}>
                        <CircularProgress style={{ color: '#c70202' }} />
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan="4" style={{ textAlign: "center", padding: "24px 0", color: '#b00020' }}>
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : courses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan="4" style={{ textAlign: "center", padding: "24px 0", color: '#666' }}>
                        No courses found for your current enrollment.
                      </TableCell>
                    </TableRow>
                  ) : (
                    courses.map((course, idx) => {
                      // Handle prerequisites - can be array or object
                      let prerequisites = [];
                      if (course.prerequisites) {
                        if (Array.isArray(course.prerequisites)) {
                          prerequisites = course.prerequisites;
                        } else if (typeof course.prerequisites === 'string') {
                          try {
                            prerequisites = JSON.parse(course.prerequisites);
                          } catch (e) {
                            prerequisites = [];
                          }
                        }
                      }
                      
                      const prerequisiteCodes = prerequisites
                        .filter(p => p && p.course_code)
                        .map(p => p.course_code)
                        .join(', ');
                      
                      return (
                        <TableRow hover key={`${course.course_code}-${idx}`}>
                          <TableCell>{course.course_name}</TableCell>
                          <TableCell align="center">{course.course_code}</TableCell>
                          <TableCell align="center">{course.units}</TableCell>
                          <TableCell align="center">
                            {prerequisiteCodes || '--'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default StudentCourses;
