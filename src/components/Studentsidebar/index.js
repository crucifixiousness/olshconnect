import Button from '@mui/material/Button';
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { FaBookOpen } from "react-icons/fa6";
import { PiStudentBold } from "react-icons/pi";
import { IoDocuments } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { HiOutlineLogout } from "react-icons/hi";
import { MyContext } from '../../App';
import { GiPapers } from "react-icons/gi";
import { FaMoneyBillWave } from "react-icons/fa";


const StudentSidebar = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isOfficiallyEnrolled, setIsOfficiallyEnrolled] = useState(false);
  // eslint-disable-next-line
  const context = useContext(MyContext);
  const navigate = useNavigate();

  useEffect(() => {
    const checkEnrollmentStatus = () => {
      const userData = JSON.parse(localStorage.getItem('user'));
      setIsOfficiallyEnrolled(userData?.enrollment_status === 'Officially Enrolled');
    };
    checkEnrollmentStatus();
  }, []);

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

    // Logout function to remove user data and redirect
  const handleLogout = () => {
    // Clear all cached data
    localStorage.removeItem('paymentData');
    localStorage.removeItem('paymentDataTimestamp');
    localStorage.removeItem('studentProfileData');
    localStorage.removeItem('studentProfileTimestamp');
    // Clear auth data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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
              disabled={!isOfficiallyEnrolled}
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
              disabled={!isOfficiallyEnrolled}
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
              disabled={!isOfficiallyEnrolled}
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
              disabled={!isOfficiallyEnrolled}
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
              disabled={!isOfficiallyEnrolled}
            >
              <span className='icon'><FaMoneyBillWave /></span>
              Payment
            </Button>
          </Link>
        </li>
      </ul>

      <div className='logoutWrap'>
        <Link to="/homepage">
          <div className='logoutBox'>
            <Button variant="contained" onClick={handleLogout}>
              <HiOutlineLogout /> Logout
            </Button>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default StudentSidebar;
