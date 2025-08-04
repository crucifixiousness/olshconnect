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
import { MyContext } from "../../App";

const StudentCourses = () => {
  const [loading, setLoading] = useState(true);
  /* eslint-disable no-unused-vars */
  const [showBy, setshowBy] = useState('');
  const [showCourseBy, setCourseBy] = useState('');
  const { user } = useContext(MyContext);
  /* eslint-disable no-unused-vars */
  const context = useContext(MyContext);

  useEffect(() => {
    context.setIsHideComponents(false);
    window.scrollTo(0, 0);
    // Simulate loading time
    setTimeout(() => setLoading(false), 1000);
  }, [context]);

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
                  ) : (
                    <>
                      <TableRow hover>
                        <TableCell>Application Development and Emerging Technologies</TableCell>
                        <TableCell align="center">CC106</TableCell>
                        <TableCell align="center">3</TableCell>
                        <TableCell align="center">*</TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell>Cybersecuirity Principles 1</TableCell>
                        <TableCell align="center">SPT1-CYBER1</TableCell>
                        <TableCell align="center">3</TableCell>
                        <TableCell align="center">*</TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell>Information Assurance and Security</TableCell>
                        <TableCell align="center">IAS102</TableCell>
                        <TableCell align="center">3</TableCell>
                        <TableCell align="center">*</TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell>Web Systems Technology 2</TableCell>
                        <TableCell align="center">WS102</TableCell>
                        <TableCell align="center">3</TableCell>
                        <TableCell align="center">*</TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell>Project Management for IT</TableCell>
                        <TableCell align="center">SPT3</TableCell>
                        <TableCell align="center">3</TableCell>
                        <TableCell align="center">--</TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell>Internet of Things</TableCell>
                        <TableCell align="center">SPT4</TableCell>
                        <TableCell align="center">3</TableCell>
                        <TableCell align="center">--</TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell>Capstone Project and Research 1</TableCell>
                        <TableCell align="center">CAP101</TableCell>
                        <TableCell align="center">3</TableCell>
                        <TableCell align="center">*</TableCell>
                      </TableRow>
                    </>
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
