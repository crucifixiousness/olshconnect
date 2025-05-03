import { useContext, useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
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
    <div className="right-content w-100" data-testid="student-courses">
      <div className="card shadow border-0 p-3 mt-1">      
        <h3 className="hd mt-2 pb-0">My Courses</h3>
      </div>
 
      {/* Course List Section */}
      <div className="card shadow border-0 p-3 mt-1">
        {/* Course Table */}
        <div className="table-responsive mt-3">
          <table className="table table-bordered v-align" data-testid="courses-table">
            <thead className="thead-dark">
              <tr>
                <th data-testid="header-course-title">COURSE TITLE</th>
                <th data-testid="header-code">CODE</th>
                <th data-testid="header-units">UNIT/S</th>
                <th data-testid="header-prerequisite">PRE-REQUISITE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Application Development and Emerging Technologies</td>
                <td>CC106</td>
                <td>3</td>
                <td>*</td>
              </tr>
              <tr>
                <td>Cybersecuirity Principles 1</td>
                <td>SPT1-CYBER1</td>
                <td>3</td>
                <td>*</td>
              </tr>
              <tr>
                <td>Information Assurance and Security</td>
                <td>IAS102</td>
                <td>3</td>
                <td>*</td>
              </tr>
              <tr>
                <td>Web Systems Technology 2</td>
                <td>WS102</td>
                <td>3</td>
                <td>*</td>
              </tr>
              <tr>
                <td>Project Management for IT</td>
                <td>SPT3</td>
                <td>3</td>
                <td>--</td>
              </tr>
              <tr>
                <td>Internet of Things</td>
                <td>SPT4</td>
                <td>3</td>
                <td>--</td>
              </tr>
              <tr>
                <td>Capstone Project and Research 1</td>
                <td>CAP101</td>
                <td>3</td>
                <td>*</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentCourses;
