import { useContext, useEffect, useState } from 'react';
import Pagination from '@mui/material/Pagination';

import { MyContext } from "../../App";

const StuDashboard = () => {
  /* eslint-disable no-unused-vars */
  const [showBy, setshowBy] = useState('');
  const [showCourseBy, setCourseBy] = useState('');
  const { user } = useContext(MyContext);
  /* eslint-disable no-unused-vars */
  const context = useContext(MyContext);

  useEffect(() => {
    context.setIsHideComponents(false);
    window.scrollTo(0, 0);
  }, [context]);

  return (
    <div className="right-content w-100">
      {
        user.username && user.firstName && (
          <div className="card shadow border-0 p-3 mt-1">      
            <h3 className="hd mt-2 pb-0">Hi, {user.firstName}</h3>
            <p className="text-muted">Welcome back, @{user.username}</p>
          </div>
        )
      }
        

      {/* Enrolled Student List Section */}
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd">Schedule</h3>

        {/* Student Table */}
        <div className="table-responsive mt-3">
          <table className="table table-bordered v-align">
            <thead className="thead-dark">
              <tr>
                <th>TIME</th>
                <th>INSTRUCTOR NAME</th>
                <th>SUBJECT</th>
                <th>BUILDING</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>7:00 - 9:00</td>
                <td>Mr. Vladimir Figueroa</td>
                <td>SIA102</td>
                <td>Computer Laboratory</td>
              </tr>
              <tr>
                <td>9:00 - 11:00</td>
                <td>Mr. Elizor Villanueva</td>
                <td>IAS102</td>
                <td>Computer Laboratory</td>
              </tr>
              <tr>
                <td>11:00 - 1:00</td>
                <td>Mr. Jonathan Alberto</td>
                <td>NET102</td>
                <td>Computer Laboratory</td>
              </tr>
              <tr>
                <td>1:00 - 3:00</td>
                <td>Mr. Jerick Barnatia</td>
                <td>SPT2</td>
                <td>Computer Laboratory</td>
              </tr>
              <tr>
                <td>3:00 - 5:00</td>
                <td>Mr. Joel Altura</td>
                <td>WS101</td>
                <td>Computer Laboratory</td>
              </tr>
            </tbody>
          </table>
          <div className="d-flex tableFooter">
            <Pagination count={10} color="primary" className="pagination" showFirstButton showLastButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StuDashboard;
