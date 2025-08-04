import { useContext, useEffect, useState } from 'react';
import { 
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Typography,
  Box
} from '@mui/material';
import { MyContext } from "../../App";

const StuDashboard = () => {
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
    <div className="right-content w-100">
      {
        context.isLogin !== false ? (
          <div className="card shadow border-0 p-3 mt-1">      
            <h3 className="hd mt-2 pb-0">Hi, {user?.firstName}</h3>
          </div>
        ) : null
      }
        
      {/* Schedule Section */}
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd">Schedule</h3>

        {/* Schedule Table */}
        <div className="mt-3">
          <Paper elevation={3} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
            <TableContainer>
              <Table aria-label="schedule table">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Time</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Instructor Name</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Subject</TableCell>
                    <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Building</TableCell>
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
                        <TableCell>7:00 - 9:00</TableCell>
                        <TableCell>Mr. Vladimir Figueroa</TableCell>
                        <TableCell>SIA102</TableCell>
                        <TableCell>Computer Laboratory</TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell>9:00 - 11:00</TableCell>
                        <TableCell>Mr. Elizor Villanueva</TableCell>
                        <TableCell>IAS102</TableCell>
                        <TableCell>Computer Laboratory</TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell>11:00 - 1:00</TableCell>
                        <TableCell>Mr. Jonathan Alberto</TableCell>
                        <TableCell>NET102</TableCell>
                        <TableCell>Computer Laboratory</TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell>1:00 - 3:00</TableCell>
                        <TableCell>Mr. Jerick Barnatia</TableCell>
                        <TableCell>SPT2</TableCell>
                        <TableCell>Computer Laboratory</TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell>3:00 - 5:00</TableCell>
                        <TableCell>Mr. Joel Altura</TableCell>
                        <TableCell>WS101</TableCell>
                        <TableCell>Computer Laboratory</TableCell>
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

export default StuDashboard;
