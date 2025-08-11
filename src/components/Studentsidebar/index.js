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
  // Remove the initial 0 value since we'll set it in useEffect
  const [activeTab, setActiveTab] = useState(null);
  const [isOfficiallyEnrolled, setIsOfficiallyEnrolled] = useState(false);
  const [canAccessPayment, setCanAccessPayment] = useState(false);
  // eslint-disable-next-line
  const context = useContext(MyContext);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const isEnrolled = userData?.enrollment_status === 'Officially Enrolled';
    const isVerified = userData?.enrollment_status === 'Verified';
    const canAccessFeatures = isEnrolled; // Only Officially Enrolled can access all features
    const canPay = isEnrolled || isVerified; // Payment available for both verified and enrolled
    
    setIsOfficiallyEnrolled(canAccessFeatures);
    setCanAccessPayment(canPay);
    // Set initial active tab based on enrollment status
    setActiveTab(canAccessFeatures ? 0 : 3); // 0 for Dashboard, 3 for My Profile
  }, []);

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

    // Logout function to remove user data and redirect
  const handleLogout = () => {
    console.log('🔒 [STUDENT SIDEBAR] Logging out...');
    // Use the context logout function for consistent behavior
    context.logout();
  };

  const renderLink = (to, button, requiresEnrollment = true, requiresPayment = false) => {
    if (requiresPayment) {
      // For payment, check if user can access payment
      if (!canAccessPayment) {
        return button;
      }
      return <Link to={to}>{button}</Link>;
    }
    
    if (requiresEnrollment && !isOfficiallyEnrolled) {
      return button;
    }
    return <Link to={to}>{button}</Link>;
  };

  return (
    <div className="sidebar">
      <ul>
        <li>
          {renderLink("/student-dashboard",
            <Button 
              className={`w-100 ${activeTab === 0 ? 'active' : ''}`} 
              onClick={() => handleTabClick(0)}
              disabled={!isOfficiallyEnrolled}
              sx={{ 
                opacity: !isOfficiallyEnrolled ? 0.6 : 1,
                color: !isOfficiallyEnrolled ? '#666 !important' : 'inherit',
                backgroundColor: !isOfficiallyEnrolled ? '#f5f5f5' : 'inherit',
                cursor: !isOfficiallyEnrolled ? 'not-allowed' : 'pointer',
                '&:hover': {
                  backgroundColor: !isOfficiallyEnrolled ? '#f5f5f5' : 'inherit',
                }
              }}
            >
              <span className='icon'><RiDashboardHorizontalLine /></span>
              Dashboard
            </Button>
          )}
        </li>
        <li>
          {renderLink("/student-profile",
            <Button 
              className={`w-100 ${activeTab === 3 ? 'active' : ''}`} 
              onClick={() => handleTabClick(3)}
            >
              <span className='icon'><PiStudentBold /></span>
              My Profile
            </Button>
          , false)} {/* false means this doesn't require enrollment */}
        </li>
        <li>
          {renderLink("/student-courses",
            <Button 
              className={`w-100 ${activeTab === 1 ? 'active' : ''}`} 
              onClick={() => handleTabClick(1)}
              disabled={!isOfficiallyEnrolled}
              sx={{ 
                opacity: !isOfficiallyEnrolled ? 0.6 : 1,
                color: !isOfficiallyEnrolled ? '#666 !important' : 'inherit',
                backgroundColor: !isOfficiallyEnrolled ? '#f5f5f5' : 'inherit',
                cursor: !isOfficiallyEnrolled ? 'not-allowed' : 'pointer',
                '&:hover': {
                  backgroundColor: !isOfficiallyEnrolled ? '#f5f5f5' : 'inherit',
                }
              }}
            >
              <span className='icon'><FaBookOpen /></span>
              My Courses
            </Button>
          )}
        </li>
        {/* Apply the same sx prop to other disabled buttons */}
        {/* Apply the same pattern to other menu items */}
        <li>
          {renderLink("/academic-records",
            <Button 
              className={`w-100 ${activeTab === 2 ? 'active' : ''}`} 
              onClick={() => handleTabClick(2)}
              disabled={!isOfficiallyEnrolled}
              sx={{ 
                opacity: !isOfficiallyEnrolled ? 0.6 : 1,
                color: !isOfficiallyEnrolled ? '#666 !important' : 'inherit',
                backgroundColor: !isOfficiallyEnrolled ? '#f5f5f5' : 'inherit',
                cursor: !isOfficiallyEnrolled ? 'not-allowed' : 'pointer',
                '&:hover': {
                  backgroundColor: !isOfficiallyEnrolled ? '#f5f5f5' : 'inherit',
                }
              }}
            >
              <span className='icon'><IoDocuments /></span>
              Academic Records
            </Button>
          )}
        </li>
        <li>
          {renderLink("/request-document",
            <Button 
              className={`w-100 ${activeTab === 4 ? 'active' : ''}`} 
              onClick={() => handleTabClick(4)}
              disabled={!isOfficiallyEnrolled}
              sx={{ 
                opacity: !isOfficiallyEnrolled ? 0.6 : 1,
                color: !isOfficiallyEnrolled ? '#666 !important' : 'inherit',
                backgroundColor: !isOfficiallyEnrolled ? '#f5f5f5' : 'inherit',
                cursor: !isOfficiallyEnrolled ? 'not-allowed' : 'pointer',
                '&:hover': {
                  backgroundColor: !isOfficiallyEnrolled ? '#f5f5f5' : 'inherit',
                }
              }}
            >
              <span className='icon'><GiPapers /></span>
              Request Document
            </Button>
          )}
        </li>
        <li>
          {renderLink("/student-payment",
            <Button 
              className={`w-100 ${activeTab === 5 ? 'active' : ''}`} 
              onClick={() => handleTabClick(5)}
              disabled={!canAccessPayment}
              sx={{ 
                opacity: !canAccessPayment ? 0.6 : 1,
                color: !canAccessPayment ? '#666 !important' : 'inherit',
                backgroundColor: !canAccessPayment ? '#f5f5f5' : 'inherit',
                cursor: !canAccessPayment ? 'not-allowed' : 'pointer',
                '&:hover': {
                  backgroundColor: !canAccessPayment ? '#f5f5f5' : 'inherit',
                }
              }}
            >
              <span className='icon'><FaMoneyBillWave /></span>
              Payment
            </Button>
          , false, true)} {/* false for requiresEnrollment, true for requiresPayment */}
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
