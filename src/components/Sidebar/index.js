import Button from '@mui/material/Button';
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { FaAnglesRight } from "react-icons/fa6";
import { PiStudentBold } from "react-icons/pi";
import { IoDocuments } from "react-icons/io5";
import { IoIosPeople } from "react-icons/io";
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { HiOutlineLogout } from "react-icons/hi";
import { MyContext } from '../../App';


const Sidebar = () =>{
// eslint-disable-next-line
  const [activeTab, setActiveTab] = useState(0);
  const [isToggleStudentMenu, setIsToggleStudentMenu] = useState(false);
  // eslint-disable-next-line
  const context = useContext(MyContext);
  const navigate = useNavigate();

  const isOpenStudentMenu = (index) => {
    setActiveTab(index);
    setIsToggleStudentMenu(!isToggleStudentMenu);
  };
  // eslint-disable-next-line
  const handleTabClick = (index) => {
    setActiveTab(index);
  };
  // eslint-disable-next-line

  const handleLogout = () => {
    // Clear all local storage data
    localStorage.clear();
    // Redirect to homepage
    navigate('/homepage');
  };

    return(
      <>
        <div className="sidebar">
          <ul>
            <li>
              <Link to="/">
                <Button className={`w-100 ${activeTab===0 ? 'active' : ''}`} onClick={()=>isOpenStudentMenu(0)}>
                  <span className='icon'><RiDashboardHorizontalLine /></span>
                    Dashboard 
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
                <Button className={`w-100 ${activeTab===2 ? 'active' : ''}`} onClick={()=>isOpenStudentMenu(2)}>
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
                <Button className={`w-100 ${activeTab===3 ? 'active' : ''}`} onClick={()=>isOpenStudentMenu(3)}>
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
                <Button className={`w-100 ${activeTab===4 ? 'active' : ''}`} onClick={()=>isOpenStudentMenu(4)}>
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
            <div className='logoutBox'>
              <Button variant="contained" onClick={handleLogout}>
                <HiOutlineLogout/>Logout
              </Button>
            </div>
          </div>
          


        </div>
      </>
    )
}

export default Sidebar;
