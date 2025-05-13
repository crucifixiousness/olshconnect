import Button from '@mui/material/Button';
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { FaBookOpen } from "react-icons/fa6";
import { PiStudentBold } from "react-icons/pi";
import { IoDocuments } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { HiOutlineLogout } from "react-icons/hi";
import { MyContext } from '../../App';
import { GiPapers } from "react-icons/gi";
import { FaMoneyBillWave } from "react-icons/fa";


const StudentSidebar = () => {
  const [activeTab, setActiveTab] = useState(0);
  // eslint-disable-next-line
  const context = useContext(MyContext);
  const navigate = useNavigate();

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

    // Logout function to remove user data and redirect
  const handleLogout = () => {
    // Clear all cached data
    localStorage.clear();
    // Redirect to homepage
    navigate('/homepage');
  };

  return (
    <div className="sidebar">
      <ul>
        <li>
          <Link to="/student-dashboard">
            <Button 
              className={`w-100 ${activeTab === 0 ? 'active' : ''}`} 
              onClick={() => handleTabClick(0)}
            >
              <span className='icon'><RiDashboardHorizontalLine /></span>
              Dashboard
            </Button>
          </Link>
        </li>
        <li>
          <Link to="/student-profile">
            <Button 
              className={`w-100 ${activeTab === 3 ? 'active' : ''}`} 
              onClick={() => handleTabClick(3)}
            >
              <span className='icon'><PiStudentBold /></span>
              My Profile
            </Button>
          </Link>
        </li>
        <li>
          <Link to="/student-courses">
            <Button 
              className={`w-100 ${activeTab === 1 ? 'active' : ''}`} 
              onClick={() => handleTabClick(1)}
            >
              <span className='icon'><FaBookOpen /></span>
              My Courses
            </Button>
          </Link>
        </li>

        <li>
          <Link to="/academic-records">
            <Button 
              className={`w-100 ${activeTab === 2 ? 'active' : ''}`} 
              onClick={() => handleTabClick(2)}
            >
              <span className='icon'><IoDocuments /></span>
              Academic Records
            </Button>
          </Link>
        </li>
        <li>
          <Link to="/request-document">
            <Button 
              className={`w-100 ${activeTab === 4 ? 'active' : ''}`} 
              onClick={() => handleTabClick(4)}
            >
              <span className='icon'><GiPapers /></span>
              Request Document
            </Button>
          </Link>
        </li>
        <li>
          <Link to="/student-payment">
            <Button 
              className={`w-100 ${activeTab === 5 ? 'active' : ''}`} 
              onClick={() => handleTabClick(5)}
            >
              <span className='icon'><FaMoneyBillWave /></span>
              Payment
            </Button>
          </Link>
        </li>
      </ul>

      <div className='logoutWrap'>
          <div className='logoutBox'>
            <Button variant="contained" onClick={handleLogout}>
              <HiOutlineLogout /> Logout
            </Button>
          </div>
      </div>
    </div>
  );
};

export default StudentSidebar;
