import DashboardBox from "./components/dashboardBox";
import { GiBookshelf } from "react-icons/gi";
import { RiPoliceBadgeFill } from "react-icons/ri";
import { MdTour } from "react-icons/md";
import { FaComputer } from "react-icons/fa6";
import { PiComputerTowerFill } from "react-icons/pi";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React,{ useContext, useEffect, useState } from "react";
import { TbCircleNumber1Filled } from "react-icons/tb";
import { TbCircleNumber2Filled } from "react-icons/tb";
import { TbCircleNumber3Filled } from "react-icons/tb";
import { TbCircleNumber4Filled } from "react-icons/tb";
import { BsThreeDotsVertical } from "react-icons/bs";
import Button from '@mui/material/Button';
import { IoIosPeople } from "react-icons/io";
import { MyContext } from "../../App";


export const data = [
  ["Task", "Hours per Day"],
  ["Work", 10],
  ["Eat", 2],
  ["Commute", 2],
  ["Sleep", 8],
];

export const options = {
  title: "My Daily Activities",
};

const Dashboard = ()=>{

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const ITEM_HEIGHT = 48;

  const context = useContext(MyContext);

  useEffect(() => {
    context.setIsHideComponents(false);
    window.scrollTo(0,0);
  }, [context]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  return(
    <>
      <div className="right-content w-100">
        <div className="row dashboardBoxWrapperRow">
          <div className="col-md-8">
            <div className="dashboardBoxWrapper d-flex">
              <DashboardBox color={["#092985", "#0097ff"]} icon={<GiBookshelf />} grow="true" title="Total BEED" value="262" />
              <DashboardBox color={["#092985", "#0097ff"]} icon={<GiBookshelf />} grow="true" title="Total BSEd" value="250" />
              <DashboardBox color={["#6a0000", "#ff2f2f"]} icon={<RiPoliceBadgeFill />} grow="false" title="Total BSCrim" value="225" />
              <DashboardBox color={["#b6b62a", "#dbff00"]} icon={<MdTour />} grow="extra" title="Total BSHM" value=" 247" />
              <DashboardBox color={["#006a13", "#11f000"]} icon={<FaComputer />} grow="medium" title="Total BSIT" value=" 221" />
              <DashboardBox color={["#006a13", "#11f000"]} icon={<PiComputerTowerFill />} grow="small" title="Total BSOAd" value="230" />               
            </div>
          </div>

          <div className="col-md-4 pl-0 topPart2">
            <div className="box">
              <div className="d-flex align-items-center w-100 bottomEle">
                <h6 className="text-white mb-0 mt-0">Total Enrolled Student</h6>
                <div className="ml-auto">
                  <Button className="toggleIcon" onClick={handleClick} ><BsThreeDotsVertical/>
                  </Button>

                  
                  <Menu
                  className="year_dropdown"
                  MenuListProps={{
                    'aria-labelledby': 'long-button',
                  }}
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  PaperProps={{
                    style: {
                      maxHeight: ITEM_HEIGHT * 4.5,
                      width: '20ch',
                    },
                  }}
                >
                  
                    <MenuItem onClick={handleClose}>
                      <TbCircleNumber1Filled/> 1st Year
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                      <TbCircleNumber2Filled/> 2nd Year
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                      <TbCircleNumber3Filled/> 3rd Year
                    </MenuItem>
                    <MenuItem onClick={handleClose}>
                      <TbCircleNumber4Filled/> 4th Year
                    </MenuItem>
                  
                </Menu>
                </div>
                
              </div>

              <div className="d-flex align-items-center totalStudentCount">
                <IoIosPeople/>
                <h4 className="text-white font-weight-bold mb-0">1435</h4>
              </div>

              <div className="additional-info mt-3">
                <div className="d-flex align-items-center mb-4 headerPerYear">
                  <h6 className="text-white mb-0">Per Year Level</h6>
                </div>
                <div className="d-flex align-items-center mb-4">
                  <TbCircleNumber1Filled /> <span className="text-white">First Year : </span>
                  <span id="totalCountPerYear" className="ml-auto text-white font-weight-bold">344</span>
                </div>
                <div className="d-flex align-items-center mb-4">
                  <TbCircleNumber2Filled/> <span className="text-white">Second Year : </span>
                  <span id="totalCountPerYear" className="ml-auto text-white font-weight-bold">352</span>
                </div>
                <div className="d-flex align-items-center mb-4">
                  <TbCircleNumber3Filled/> <span className="text-white">Third Year : </span>
                  <span id="totalCountPerYear" className="ml-auto text-white font-weight-bold">367</span>
                </div>
                <div className="d-flex align-items-center mb-4">
                  <TbCircleNumber4Filled/> <span className="text-white">Fourth Year : </span>
                  <span id="totalCountPerYear" className="ml-auto text-white font-weight-bold">372</span>
                </div>               
              </div>

            </div>
          </div>
        </div>        
      </div>
    </>    
  )
}
export default Dashboard;