import { Link, useNavigate } from "react-router-dom";
import logo from '../../asset/images/olshco-logo1.png';
import Button from '@mui/material/Button';
import { MdOutlineMenu } from "react-icons/md";
import { MdMenuOpen } from "react-icons/md";
import { FaBell } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";
import { IoShieldHalfSharp } from "react-icons/io5";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Logout from '@mui/icons-material/Logout';
import { MyContext } from "../../App";
import React, { useState, useContext } from 'react';


const Header = ()=>{
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

  return(
    <>
      <header className="d-flex align-items-center">
        <div className="container-fluid w-100">
          <div className="row d-flex align-items-center w-100">
            <div className="col-sm-2 part1">
              <Link to={'/'} className="d-flex align-items-center logo">
                <img alt="logu" src={logo}/>
                <span className="ml-2">SACRADEMIA</span>
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
                <Button className="rounded-circle mr-3" onClick={handleOpenNotifsDrop}><FaBell /></Button>
                {
                  context.windowWidth <= 992 && (
                    <Button className="rounded-circle mr-3" onClick={() => context.openNav()}>
                      <IoMenu />
                    </Button>
                  )
                }
                  <Menu
                    isOpenNotifDrop={isOpenNotifDrop}
                    className="notifs dropdown_list"
                    id="notifs"
                    open={openmyNotifs}
                    onClose={handleCloseNotifsDrop}
                    onClick={handleCloseNotifsDrop}
                    slotProps={{
                      paper: {
                        elevation: 0,
                        sx: {
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
                    <div className='head'>
                        <h4>Notifications (100)</h4>
                    </div> 
                    <Divider className="notifDD"/>
                      <div className="scroll">
                          <MenuItem onClick={handleCloseNotifsDrop}>
                          <div className="d-flex align-items-center">
                            <div>
                              <div className="userImg">
                                  <span className="rounded-circle">
                                      <img alt="dp" src=""/>
                                  </span>
                              </div>

                              <div className="notifInfoDD">
                                  <h4>
                                    <span>
                                      <b>DEAN</b>
                                      currently enrolling
                                      <b>sampling sampling</b>
                                    </span>
                                    <p className="text-sky">few seconds ago</p>
                                  </h4>
                              </div>
                            </div>                                                                        
                          </div>
                          </MenuItem>
                      </div>
                      <div className="btn-blue-container">
                          <Button className="btn-blue w-100">View All Notifications</Button>
                      </div>                      
                  </Menu>
              </div>
              
              {
                context.isLogin !== false ? (
                  <div className="myAccWrapper">
                    <Button className="myAcc d-flex align-items-center" onClick={handleOpenAccDrop}>
                      <div className="userImg">
                        <span className="rounded-circle">
                        <img
                          src={user?.idpic ? `data:image/jpeg;base64,${user.idpic}` : "default_image_path.jpg"}
                          alt="User"
                        /> {/* Provide the image source here */}
                        </span>
                      </div>

                      <div className="userInfo res-hide">
                        <h4>{user?.fullName || "Student Acc"}</h4>
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