import Button from '@mui/material/Button';
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { FaAnglesRight } from "react-icons/fa6";
import { PiStudentBold } from "react-icons/pi";
import { HiOutlineDesktopComputer } from "react-icons/hi";
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { HiOutlineLogout } from "react-icons/hi";

const ProgramHeadSidebar = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isStudentMenuOpen, setIsStudentMenuOpen] = useState(false);
  const [isCourseMenuOpen, setIsCourseMenuOpen] = useState(false);

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  const toggleStudentMenu = (index) => {
    setActiveTab(index);
    setIsStudentMenuOpen(!isStudentMenuOpen);
  };

  const toggleCourseMenu = (index) => {
    setActiveTab(index);
    setIsCourseMenuOpen(!isCourseMenuOpen);
  };

  return (
    <>
      <div className="sidebar">
        <ul>
          <li>
            <Link to="/programhead-dashboard">
              <Button className={`w-100 ${activeTab === 0 ? 'active' : ''}`} onClick={() => handleTabClick(0)}>
                <span className='icon'><RiDashboardHorizontalLine /></span>
                Dashboard
                <span className='arrow'><FaAnglesRight /></span>
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/studentlist">
              <Button className={`w-100 ${activeTab === 1 && isStudentMenuOpen ? 'active' : ''}`} onClick={() => toggleStudentMenu(1)}>
                <span className='icon'><PiStudentBold /></span>
                Student List
                <span className='arrow'><FaAnglesRight /></span>
              </Button>
            </Link>
            <div className={`studentMenuWrap ${isStudentMenuOpen ? 'colapse' : 'colapsed'}`}>
              <ul className="studentMenu">
                <li><Link to="#">First Year</Link></li>
                <li><Link to="#">Second Year</Link></li>
                <li><Link to="#">Third Year</Link></li>
                <li><Link to="#">Fourth Year</Link></li>
                <li><Link to="#">Fifth Year</Link></li>
              </ul>
            </div>
          </li>
          <li>
            <Link to="/course-assignments">
              <Button className={`w-100 ${activeTab === 2 && isCourseMenuOpen ? 'active' : ''}`} onClick={() => toggleCourseMenu(2)}>
                <span className='icon'><HiOutlineDesktopComputer /></span>
                Course Assignments
                <span className='arrow'><FaAnglesRight /></span>
              </Button>
            </Link>
            <div className={`studentMenuWrap ${isCourseMenuOpen ? 'colapse' : 'colapsed'}`}>
              <ul className="studentMenu">
                <li><Link to="/course-assignments?year=1">First Year</Link></li>
                <li><Link to="/course-assignments?year=2">Second Year</Link></li>
                <li><Link to="/course-assignments?year=3">Third Year</Link></li>
                <li><Link to="/course-assignments?year=4">Fourth Year</Link></li>
              </ul>
            </div>
          </li>
        </ul>

        <br />
        <div className='logoutWrap'>
          <Link to={"/homepage"}>
            <div className='logoutBox'>
              <Button variant="contained"><HiOutlineLogout />Logout</Button>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}

export default ProgramHeadSidebar;
