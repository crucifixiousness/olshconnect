import { Link, useNavigate } from "react-router-dom";
import logo from '../../asset/images/olshco-logo1.png';
import Button from '@mui/material/Button';
import { MdOutlineMenu } from "react-icons/md";
import { MdMenuOpen } from "react-icons/md";
import { IoMenu } from "react-icons/io5";
import { IoShieldHalfSharp } from "react-icons/io5";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Logout from '@mui/icons-material/Logout';
import { MyContext } from "../../App";
import React, { useState, useContext } from 'react';

const formatFullName = (userData) => {
  if (!userData) return 'N/A';
  
  // For staff roles (instructors, program_head, etc.)
  if (userData.role !== 'student') {
    return userData.fullName || 'N/A';
  }
  
  // For students - using snake_case format from database
  let fullName = userData.first_name || "";
  
  if (userData.middle_name && userData.middle_name.trim()) {
    fullName += ` ${userData.middle_name.charAt(0)}.`;
  }
  
  if (userData.last_name) {
    fullName += ` ${userData.last_name}`;
  }
  
  if (userData.suffix && userData.suffix.trim()) {
    fullName += ` ${userData.suffix}`;
  }
  
  return fullName || 'N/A';
};

const Header = () => {
  /* eslint-disable no-unused-vars */
  const [anchorEl, setAnchorEl] =  useState(null);
  const openmyAcc = Boolean(anchorEl); 
  const [isOpenNotifDrop, setOpenNotifsDrop] =  useState(false);
  const openmyNotifs = Boolean(isOpenNotifDrop);
  const { user } = useContext(MyContext);
  const navigate = useNavigate();

  const context = useContext(MyContext);
  
  const handleOpenAccDrop = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseAccDrop = () => {
    setAnchorEl(null);
  };
  const handleOpenNotifsDrop = (event) => {
    setOpenNotifsDrop(true);
  };
  const handleCloseNotifsDrop = (event) => {
    setOpenNotifsDrop(false);
  };

  // Add this function to handle image display
  const getProfileImage = () => {
    if (user?.idpic) {
      // Check if idpic is already a base64 string
      const imageData = user.idpic.startsWith('data:image') 
        ? user.idpic 
        : `data:image/jpeg;base64,${user.idpic}`;
      
      return (
        <img
          src={imageData}
          alt="User"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
          }}
        />
      );
    }
    
    return (
      <img
        src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
        alt="Default Profile"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '50%'
        }}
      />
    );
  };

  return(
    <>
      <header className="d-flex align-items-center">
        <div className="container-fluid w-100">
          <div className="row d-flex align-items-center w-100">
            <div className="col-sm-2 part1">
              <Link to={'/'} className="d-flex align-items-center logo">
                <img alt="logu" src={logo}/>
                <span className="ml-2">OLSHCONNECT</span>
              </Link>              
            </div>

            {
              context.windowWidth>992 &&
              <div className="col-sm-3 d-flex align-items-center part2 res-hide">
                <Button className="rounded-circle" onClick={()=>context.setIsToggleSidebar(!context.isToggleSidebar)}>
                  {
                    context.isToggleSidebar === false ? <MdMenuOpen/> : <MdOutlineMenu/>
                  }
                </Button>
              </div>
            }

            

            <div className="col-sm-7 d-flex align-items-center justify-content-end part3">              

              <div className="notifWrapper position-relative">
                {
                  context.windowWidth <= 992 && (
                    <Button className="rounded-circle mr-3" onClick={() => context.openNav()}>
                      <IoMenu />
                    </Button>
                  )
                }
              </div>
              
              {
                context.isLogin !== false ? (
                  <div className="myAccWrapper">
                    <Button className="myAcc d-flex align-items-center" onClick={handleOpenAccDrop}>
                      <div className="userImg">
                        <span className="rounded-circle">
                          {getProfileImage()}
                        </span>
                      </div>

                      <div className="userInfo res-hide">
                        <h4>{user?.role === 'student' ? formatFullName(user) : user?.fullName || "Student Acc"}</h4>
                        <p className="md-0">
                          @{user?.username || user?.staff_username}
                        </p>
                      </div>
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      id="account-menu"
                      open={openmyAcc}
                      onClose={handleCloseAccDrop}
                      onClick={handleCloseAccDrop}
                      slotProps={{
                        paper: {
                          elevation: 0,
                          sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                              width: 32,
                              height: 32,
                              ml: -0.5,
                              mr: 1,
                            },
                            '&::before': {
                              content: '""',
                              display: 'block',
                              position: 'absolute',
                              top: 0,
                              right: 14,
                              width: 10,
                              height: 10,
                              bgcolor: 'background.paper',
                              transform: 'translateY(-50%) rotate(45deg)',
                              zIndex: 0,
                            },
                          },
                        },
                      }}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                      <MenuItem onClick={handleCloseAccDrop}>
                        <ListItemIcon>
                          <PersonAdd fontSize="small" />
                        </ListItemIcon>
                        My Profile
                      </MenuItem>
                      <MenuItem onClick={handleCloseAccDrop}>
                        <ListItemIcon>
                          <IoShieldHalfSharp />
                        </ListItemIcon>
                        Reset Password
                      </MenuItem>
                      <MenuItem  onClick={() => {handleCloseAccDrop(); navigate('/homepage');}}>
                        <ListItemIcon>
                          <Logout fontSize="small" />
                        </ListItemIcon>
                        Logout
                      </MenuItem>
                    </Menu>
                  </div>
                ) : null
              }             
            </div>
          </div>                                                 
        </div>
      </header>
    </>
  )
}
export default Header;
