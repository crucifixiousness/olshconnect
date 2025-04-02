import Button from '@mui/material/Button';
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { FaAnglesRight } from "react-icons/fa6";
import { PiStudentBold } from "react-icons/pi";
import { FaCashRegister } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { HiOutlineLogout } from "react-icons/hi";
import { IoDocuments } from "react-icons/io5";


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
            <li>
                <Link to="/student-balance">            
                  <Button className={`w-100 ${activeTab===1  && isToggleStudentMenu===true ? 'active' : ''}`} onClick={()=>isOpenStudentMenu(1)}>
                    <span className='icon'><PiStudentBold /></span>
                      Students Balance 
                    <span className='arrow'><FaAnglesRight />
                    </span>             
                  </Button>
                </Link>
                <div className={`studentMenuWrap ${activeTab===1 && isToggleStudentMenu===true ? 'colapse' : 'colapsed'}`}>
                  <ul className="studentMenu">
                    <li><Link to="#">Bachelor of Science in Education</Link></li>
                    <li><Link to="#">Bachelor of Science in Criminology</Link></li>
                    <li><Link to="#">Bachelor of Science in Hospitality Management</Link></li>
                    <li><Link to="#">Bachelor of Science in Information Technology</Link></li>
                    <li><Link to="#">Bachelor of Science in Office Administration</Link></li>
                  </ul>
                </div>                             
            </li>
            <li>
              <Link to="/tuition-management">
                <Button 
                  className={`w-100 ${activeTab === 2 ? 'active' : ''}`} 
                  onClick={() => handleTabClick(2)}
                >
                  <span className='icon'><FaCashRegister /></span>
                  Tuition Management
                  <span className='arrow'><FaAnglesRight /></span> 
                </Button>
              </Link>
            </li>
            <li>
              <Link to="/payment-verification">
                <Button className={`w-100 ${activeTab===2 ? 'active' : ''}`} onClick={()=>handleTabClick(2)}>
                  <span className='icon'><IoDocuments />
                  </span>
                    Payment Verification
                  <span className='arrow'><FaAnglesRight />
                  </span>
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
