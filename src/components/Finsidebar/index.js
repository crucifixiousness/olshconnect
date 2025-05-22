import Button from '@mui/material/Button';
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { FaAnglesRight } from "react-icons/fa6";
import { PiStudentBold } from "react-icons/pi";
import { FaCashRegister } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { HiOutlineLogout } from "react-icons/hi";
import { IoDocuments } from "react-icons/io5";
import { FaMoneyBillTransfer } from "react-icons/fa6"; // Add this import


const FinanceSidebar = () =>{
  // eslint-disable-next-line
  const [activeTab, setActiveTab] = useState(0);
  const [isToggleStudentMenu, setIsToggleStudentMenu] = useState(false);

  const isOpenStudentMenu = (index) => {
    setActiveTab(index);
    setIsToggleStudentMenu(!isToggleStudentMenu);
  };

  const handleTabClick = (index) => {
    setActiveTab(index);
  };


    return(
      <>
        <div className="sidebar">
          <ul>
            <li>
              <Link to="/finance-dashboard">
                <Button className={`w-100 ${activeTab===0 ? 'active' : ''}`} onClick={()=>handleTabClick(0)}>
                  <span className='icon'><RiDashboardHorizontalLine /></span>
                    Finance Dashboard 
                  <span className='arrow'><FaAnglesRight />
                  </span>
                </Button>
              </Link>              
            </li>
            
            {/* Add new Counter Payment menu item */}
            <li>
              <Link to="/counter-payment">
                <Button className={`w-100 ${activeTab===1 ? 'active' : ''}`} onClick={()=>handleTabClick(1)}>
                  <span className='icon'><FaMoneyBillTransfer /></span>
                    Counter Payment
                  <span className='arrow'><FaAnglesRight /></span>
                </Button>
              </Link>
            </li>

            {/* Move Student Balance to index 2 */}
            <li>
              <Link to="/student-balance">            
                <Button className={`w-100 ${activeTab===2 && isToggleStudentMenu===true ? 'active' : ''}`} onClick={()=>isOpenStudentMenu(2)}>
                  <span className='icon'><PiStudentBold /></span>
                    Students Balance 
                  <span className='arrow'><FaAnglesRight /></span>             
                </Button>
              </Link>
              <div className={`studentMenuWrap ${activeTab===2 && isToggleStudentMenu===true ? 'colapse' : 'colapsed'}`}>
                <ul className="studentMenu">
                  <li><Link to="#">Bachelor of Science in Education</Link></li>
                  <li><Link to="#">Bachelor of Science in Criminology</Link></li>
                  <li><Link to="#">Bachelor of Science in Hospitality Management</Link></li>
                  <li><Link to="#">Bachelor of Science in Information Technology</Link></li>
                  <li><Link to="#">Bachelor of Science in Office Administration</Link></li>
                </ul>
              </div>                             
            </li>

            {/* Adjust other menu indices */}
            <li>
              <Link to="/tuition-management">
                <Button className={`w-100 ${activeTab===3 ? 'active' : ''}`} onClick={()=>handleTabClick(3)}>
                  <span className='icon'><FaCashRegister /></span>
                    Tuition Management
                  <span className='arrow'><FaAnglesRight /></span>
                </Button>
              </Link>              
            </li>

            <li>
              <Link to="/payment-verification">
                <Button className={`w-100 ${activeTab===4 ? 'active' : ''}`} onClick={()=>handleTabClick(4)}>
                  <span className='icon'><IoDocuments /></span>
                    Payment Verification
                  <span className='arrow'><FaAnglesRight /></span>
                </Button>
              </Link>              
            </li>
          </ul>

          <br/>
          <div className='logoutWrap'>
              <Link to={"/homepage"}>
              <div className='logoutBox'>
                  <Button variant="contained"><HiOutlineLogout/>Logout</Button>
              </div>
              </Link>
          </div>
        </div>
      </>
    )
}

export default FinanceSidebar;
