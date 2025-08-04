import { useContext, useEffect, useState } from 'react';
import { MyContext } from "../../App";
import { 
  Button, 
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box
} from '@mui/material';

const AcademicRecords = () => {
  const [loading, setLoading] = useState(true);
  const { user } = useContext(MyContext);
  const context = useContext(MyContext);

  useEffect(() => {
    context.setIsHideComponents(false);
    window.scrollTo(0, 0);
    // Simulate loading time
    setTimeout(() => setLoading(false), 1000);
  }, [context]);

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
      {/* Header Section */}
      {user && user.firstName && (
        <div className="card shadow border-0 p-3">
          <h3 className="hd mt-2 pb-0" data-testid="page-title">Academic Records</h3>
        </div>
      )}

      {/* Academic Records Section */}
      <div className="card shadow border-0 p-3 mt-3">

        {/* Personal Information */}
        <div className="mt-3">
          <Typography variant="h6" sx={{ color: '#c70202', mb: 2 }}>Personal Information</Typography>
          <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
            <p><strong>Name:</strong> {user?.lastName}, {user?.firstName} {user?.middleName?.charAt(0)}. </p>
            <p><strong>Student No:</strong> {user?.id}</p>
            <p><strong>Program:</strong> BSIT</p>
            <p><strong>Year Level:</strong> 3rd Year</p>
            <p><strong>Status:</strong> Active</p>
          </Box>
        </div>

        {/* Grades Overview */}
        <div className="mt-3">
          <Typography variant="h6" sx={{ color: '#c70202', mb: 2 }}>Grades Overview</Typography>
          <Paper elevation={3} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
            <TableContainer>
              <Table aria-label="grades table">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Subject Code</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Subject Title</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }} align="center">Units</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }} align="center">Grade</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }} align="center">Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell>IT101</TableCell>
                    <TableCell>Introduction to IT</TableCell>
                    <TableCell align="center">3</TableCell>
                    <TableCell align="center">85</TableCell>
                    <TableCell align="center">
                      <span className="badge bg-success">Passed</span>
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>ENG102</TableCell>
                    <TableCell>English Communication</TableCell>
                    <TableCell align="center">3</TableCell>
                    <TableCell align="center">87</TableCell>
                    <TableCell align="center">
                      <span className="badge bg-success">Passed</span>
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>MATH101</TableCell>
                    <TableCell>College Algebra</TableCell>
                    <TableCell align="center">3</TableCell>
                    <TableCell align="center">80</TableCell>
                    <TableCell align="center">
                      <span className="badge bg-success">Passed</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>

        {/* GPA Overview */}
        <div className="mt-3">
          <Typography variant="h6" sx={{ color: '#c70202', mb: 2 }}>GPA Overview</Typography>
          <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
            <p><strong>Semester GPA:</strong> 3.5</p>
            <p><strong>Cumulative GPA:</strong> 3.2</p>
          </Box>
        </div>

        {/* Enrollment History */}
        <div className="mt-3">
          <Typography variant="h6" sx={{ color: '#c70202', mb: 2 }}>Enrollment History</Typography>
          <Paper elevation={3} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
            <TableContainer>
              <Table aria-label="enrollment history table">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Academic Year</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Semester</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }} align="center">Status</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }} align="center">Units Enrolled</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }} align="center">Units Earned</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell>2024-2025</TableCell>
                    <TableCell>1st Semester</TableCell>
                    <TableCell align="center">
                      <span className="badge bg-primary">Enrolled</span>
                    </TableCell>
                    <TableCell align="center">21</TableCell>
                    <TableCell align="center">18</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>2023-2024</TableCell>
                    <TableCell>2nd Semester</TableCell>
                    <TableCell align="center">
                      <span className="badge bg-success">Completed</span>
                    </TableCell>
                    <TableCell align="center">18</TableCell>
                    <TableCell align="center">18</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>2023-2024</TableCell>
                    <TableCell>1st Semester</TableCell>
                    <TableCell align="center">
                      <span className="badge bg-success">Completed</span>
                    </TableCell>
                    <TableCell align="center">21</TableCell>
                    <TableCell align="center">21</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>

        <div className="mt-4">
          <Typography variant="h6" sx={{ color: '#c70202', mb: 2 }}>Transcript Request</Typography>
          <Button 
            variant="contained" 
            sx={{
              bgcolor: '#c70202',
              '&:hover': { bgcolor: '#a00000' }
            }}
          >
            Request TOR
          </Button>
        </div>        
      </div>
    </div>
  );
};

export default AcademicRecords;
