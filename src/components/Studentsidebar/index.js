import Button from '@mui/material/Button';
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { FaBookOpen } from "react-icons/fa6";
import { PiStudentBold } from "react-icons/pi";
import { IoDocuments } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { useState, useContext } from 'react';
import { HiOutlineLogout } from "react-icons/hi";
import { MyContext } from '../../App';
import { GiPapers } from "react-icons/gi";


const StudentSidebar = () => {
  const [activeTab, setActiveTab] = useState(0);
  // eslint-disable-next-line
  const context = useContext(MyContext);

  const handleTabClick = (index) => {
    setActiveTab(index);
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
      </ul>

      <div className='logoutWrap'>
        <Link to="/homepage">
          <div className='logoutBox'>
            <Button variant="contained">
              <HiOutlineLogout /> Logout
            </Button>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default StudentSidebar;
