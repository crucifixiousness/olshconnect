import Button from '@mui/material/Button';
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { FaAnglesRight } from "react-icons/fa6";
import { PiStudentBold } from "react-icons/pi";
import { IoDocuments } from "react-icons/io5";
import { IoIosPeople } from "react-icons/io";
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { HiOutlineLogout } from "react-icons/hi";


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
              <Link to="/">
                <Button className={`w-100 ${activeTab===0 ? 'active' : ''}`} onClick={()=>handleTabClick(0)}>
                  <span className='icon'><RiDashboardHorizontalLine /></span>
                    Finance Dashboard 
                  <span className='arrow'><FaAnglesRight />
                  </span>
                </Button>
              </Link>              
            </li>
            <li>
                <Link to="/studentlist">            
                  <Button className={`w-100 ${activeTab===1  && isToggleStudentMenu===true ? 'active' : ''}`} onClick={()=>isOpenStudentMenu(1)}>
                    <span className='icon'><PiStudentBold /></span>
                      Student List 
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
              <Link to="/">
                <Button className={`w-100 ${activeTab===2 ? 'active' : ''}`} onClick={()=>handleTabClick(2)}>
                  <span className='icon'><IoDocuments />
                  </span>
                    Records 
                  <span className='arrow'><FaAnglesRight />
                  </span>
                </Button>
              </Link>              
            </li>
            <li>
              <Link to="/staffs">
                <Button className={`w-100 ${activeTab===3 ? 'active' : ''}`} onClick={()=>handleTabClick(3)}>
                  <span className='icon'><IoIosPeople />
                  </span>
                    Manage Staffs
                  <span className='arrow'><FaAnglesRight />
                  </span>
                </Button>
              </Link>              
            </li>
            <li>
              <Link to="/document-request">
                <Button className={`w-100 ${activeTab===4 ? 'active' : ''}`} onClick={()=>handleTabClick(4)}>
                  <span className='icon'><IoIosPeople />
                  </span>
                    Document Request
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
