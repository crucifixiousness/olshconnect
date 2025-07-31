import Button from '@mui/material/Button';
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { FaAnglesRight } from "react-icons/fa6";
import { PiStudentBold } from "react-icons/pi";
import { IoDocuments } from "react-icons/io5";
import { BsCalendar3 } from "react-icons/bs";
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { HiOutlineLogout } from "react-icons/hi";

const InstructorSidebar = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isClassMenuOpen, setIsClassMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  const toggleClassMenu = (index) => {
    setActiveTab(index);
    setIsClassMenuOpen(!isClassMenuOpen);
  };

  const handleLogout = () => {
    // Clear all local storage data
    localStorage.clear();
    // Redirect to homepage
    navigate('/homepage');
  };

  return (
    <>
      <div className="sidebar">
        <ul>
          <li>
            <Link to="/instructor-dashboard">
              <Button className={`w-100 ${activeTab === 0 ? 'active' : ''}`} onClick={() => handleTabClick(0)}>
                <span className='icon'><RiDashboardHorizontalLine /></span>
                Dashboard
                <span className='arrow'><FaAnglesRight /></span>
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/instructor-classes">
              <Button className={`w-100 ${activeTab === 1 && isClassMenuOpen ? 'active' : ''}`} onClick={() => toggleClassMenu(1)}>
                <span className='icon'><IoDocuments /></span>
                Class Management
                <span className='arrow'><FaAnglesRight /></span>
              </Button>
            </Link>
            <div className={`studentMenuWrap ${isClassMenuOpen ? 'colapse' : 'colapsed'}`}>
              <ul className="studentMenu">
                <li><Link to="/instructor-classes/grades">Grade Entry</Link></li>
                <li><Link to="/instructor-classes/reports">Class Reports</Link></li>
              </ul>
            </div>
          </li>
          <li>
            <Link to="/instructor-schedule">
              <Button className={`w-100 ${activeTab === 2 ? 'active' : ''}`} onClick={() => handleTabClick(2)}>
                <span className='icon'><BsCalendar3 /></span>
                Schedule
                <span className='arrow'><FaAnglesRight /></span>
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/instructor-students">
              <Button className={`w-100 ${activeTab === 3 ? 'active' : ''}`} onClick={() => handleTabClick(3)}>
                <span className='icon'><PiStudentBold /></span>
                Student Records
                <span className='arrow'><FaAnglesRight /></span>
              </Button>
            </Link>
          </li>
        </ul>

        <br />
        <div className='logoutWrap'>
          <div className='logoutBox'>
            <Button variant="contained" onClick={handleLogout}>
              <HiOutlineLogout />Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default InstructorSidebar;
