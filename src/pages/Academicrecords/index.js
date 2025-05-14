import { useContext, useEffect, useState } from 'react';
import { MyContext } from "../../App";
import { Button, CircularProgress } from '@mui/material';

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
        <div className="card shadow border-0 p-3 mt-1">
          <h3 className="hd mt-2 pb-0" data-testid="page-title">Academic Records</h3>
          <p className="text-muted">Welcome to your Academic Records, {user?.firstName}</p>
        </div>
      )}

      {/* Academic Records Section */}
      <div className="card shadow border-0 p-3 mt-3">
        <h3 className="hd">Academic Records</h3>

        {/* Personal Information */}
        <div className="mt-3">
          <h4>Personal Information</h4>
          <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
          <p><strong>Student No:</strong> {user?.id}</p>
          <p><strong>Program:</strong> BSIT</p>
          <p><strong>Year Level:</strong> 3rd Year</p>
          <p><strong>Status:</strong> Active</p>
        </div>

        {/* Grades Overview */}
        <div className="mt-3">
          <h4>Grades Overview</h4>
          <table className="table table-bordered">
            <thead className="thead-dark">
              <tr>
                <th>Subject Code</th>
                <th>Subject Title</th>
                <th>Units</th>
                <th>Grade</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>IT101</td>
                <td>Introduction to IT</td>
                <td>3</td>
                <td>85</td>
                <td>Passed</td>
              </tr>
              <tr>
                <td>ENG102</td>
                <td>English Communication</td>
                <td>3</td>
                <td>87</td>
                <td>Passed</td>
              </tr>
              <tr>
                <td>MATH101</td>
                <td>College Algebra</td>
                <td>3</td>
                <td>80</td>
                <td>Passed</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* GPA Overview */}
        <div className="mt-3">
          <h4>GPA Overview</h4>
          <p><strong>Semester GPA:</strong> 3.5</p>
          <p><strong>Cumulative GPA:</strong> 3.2</p>
        </div>

        {/* Enrollment History */}
        <div className="mt-3">
          <h4>Enrollment History</h4>
          <table className="table table-bordered">
            <thead className="thead-dark">
              <tr>
                <th>Academic Year</th>
                <th>Semester</th>
                <th>Status</th>
                <th>Units Enrolled</th>
                <th>Units Earned</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2024-2025</td>
                <td>1st Semester</td>
                <td>Enrolled</td>
                <td>21</td>
                <td>18</td>
              </tr>
              <tr>
                <td>2023-2024</td>
                <td>2nd Semester</td>
                <td>Completed</td>
                <td>18</td>
                <td>18</td>
              </tr>
              <tr>
                <td>2023-2024</td>
                <td>1st Semester</td>
                <td>Completed</td>
                <td>21</td>
                <td>21</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <h5>Transcript Request</h5>
          <Button variant="contained" color="primary">
            Request TOR
          </Button>
        </div>        
      </div>
    </div>
  );
};

export default AcademicRecords;
