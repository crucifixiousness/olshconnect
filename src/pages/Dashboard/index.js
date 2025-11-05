import { useState, useEffect, useContext, useCallback } from 'react';
import { Card, Typography, CircularProgress } from '@mui/material';
import { GiBookshelf } from "react-icons/gi";
import { RiPoliceBadgeFill } from "react-icons/ri";
import { MdTour } from "react-icons/md";
import { FaComputer } from "react-icons/fa6";
import { PiComputerTowerFill } from "react-icons/pi";
import { IoIosPeople } from "react-icons/io";
import { TbCircleNumber1Filled, TbCircleNumber2Filled, TbCircleNumber3Filled, TbCircleNumber4Filled } from "react-icons/tb";
import { MyContext } from "../../App";

const Dashboard = () => {
  const context = useContext(MyContext);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    programStats: {
      education: 0,
      bscrim: 0,
      bshm: 0,
      bsit: 0,
      bsoad: 0
    },
    totalStudents: 0,
    yearLevelStats: {
      firstYear: 0,
      secondYear: 0,
      thirdYear: 0,
      fourthYear: 0
    }
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin-dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setDashboardData({
            programStats: data.data.programStats || {
              education: 0,
              bscrim: 0,
              bshm: 0,
              bsit: 0,
              bsoad: 0
            },
            totalStudents: data.data.totalStudents || 0,
            yearLevelStats: data.data.yearLevelStats || {
              firstYear: 0,
              secondYear: 0,
              thirdYear: 0,
              fourthYear: 0
            }
          });
        }
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    context.setIsHideComponents(false);
    window.scrollTo(0, 0);
    fetchDashboardData();
  }, [context, fetchDashboardData]);

  const programCards = [
    {
      title: 'Total Education',
      value: dashboardData.programStats.education,
      icon: <GiBookshelf size={30} />,
      color: '#1976d2',
      gradient: 'linear-gradient(135deg, #1976d2, #42a5f5)'
    },
    {
      title: 'Total BSCrim',
      value: dashboardData.programStats.bscrim,
      icon: <RiPoliceBadgeFill size={30} />,
      color: '#c70202',
      gradient: 'linear-gradient(135deg, #c70202, #f44336)'
    },
    {
      title: 'Total BSHM',
      value: dashboardData.programStats.bshm,
      icon: <MdTour size={30} />,
      color: '#ff9800',
      gradient: 'linear-gradient(135deg, #ff9800, #ffb74d)'
    },
    {
      title: 'Total BSIT',
      value: dashboardData.programStats.bsit,
      icon: <FaComputer size={30} />,
      color: '#4caf50',
      gradient: 'linear-gradient(135deg, #4caf50, #81c784)'
    },
    {
      title: 'Total BSOAd',
      value: dashboardData.programStats.bsoad,
      icon: <PiComputerTowerFill size={30} />,
      color: '#9c27b0',
      gradient: 'linear-gradient(135deg, #9c27b0, #ba68c8)'
    }
  ];

  const yearLevelData = [
    { year: 'First Year', count: dashboardData.yearLevelStats.firstYear, icon: <TbCircleNumber1Filled />, color: '#1976d2' },
    { year: 'Second Year', count: dashboardData.yearLevelStats.secondYear, icon: <TbCircleNumber2Filled />, color: '#388e3c' },
    { year: 'Third Year', count: dashboardData.yearLevelStats.thirdYear, icon: <TbCircleNumber3Filled />, color: '#f57c00' },
    { year: 'Fourth Year', count: dashboardData.yearLevelStats.fourthYear, icon: <TbCircleNumber4Filled />, color: '#d32f2f' }
  ];

  if (loading) {
    return (
      <div className="right-content w-100">
        <div className="card shadow border-0 p-3 mt-1">
          <h3 className="mb-4">Admin Dashboard</h3>
          <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
            <CircularProgress sx={{ color: '#c70202' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="mb-4">Admin Dashboard</h3>
        
        {/* Program Statistics */}
        <div className="row mb-4">
          {programCards.map((card, index) => (
            <div key={index} className="col-md-4 col-lg-2 mb-3">
              <Card 
                className="h-100 p-3" 
                sx={{ 
                  background: card.gradient,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { 
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  },
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                <div className="d-flex align-items-center mb-3">
                  <div style={{ color: 'white' }}>{card.icon}</div>
                  <Typography variant="h6" className="ms-2 text-white" sx={{ fontSize: '0.9rem' }}>
                    {card.title}
                  </Typography>
                </div>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {card.value}
                </Typography>
              </Card>
            </div>
          ))}
        </div>

        {/* Total Students Overview */}
        <div className="row">
          <div className="col-md-12 mb-4">
            <Card className="h-100 p-4" sx={{ 
              background: 'linear-gradient(135deg, #c70202, #f44336)',
              color: 'white'
            }}>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Total Enrolled Students
                </Typography>
                <IoIosPeople size={40} style={{ color: 'white' }} />
              </div>
              
              <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold', mb: 4 }}>
                {dashboardData.totalStudents}
              </Typography>

              <div className="row">
                {yearLevelData.map((level, index) => (
                  <div key={index} className="col-md-6 mb-3">
                    <div className="d-flex align-items-center justify-content-between p-2" 
                         style={{ 
                           backgroundColor: 'rgba(255,255,255,0.1)', 
                           borderRadius: '8px',
                           border: '1px solid rgba(255,255,255,0.2)'
                         }}>
                      <div className="d-flex align-items-center">
                        <span style={{ color: level.color, marginRight: '8px' }}>
                          {level.icon}
                        </span>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          {level.year}
                        </Typography>
                      </div>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {level.count}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
