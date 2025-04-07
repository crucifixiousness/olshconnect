import React, { useContext, useEffect} from "react";
import { Card, Typography } from '@mui/material';
import { GiBookshelf } from "react-icons/gi";
import { RiPoliceBadgeFill } from "react-icons/ri";
import { MdTour } from "react-icons/md";
import { FaComputer } from "react-icons/fa6";
import { PiComputerTowerFill } from "react-icons/pi";
import { IoIosPeople } from "react-icons/io";
import { MyContext } from "../../App";

const RegistrarDashboard = () => {
  const context = useContext(MyContext);

  useEffect(() => {
    context.setIsHideComponents(false);
    window.scrollTo(0,0);
  }, [context]);

  const statCards = [
    {
      title: 'Total BEED',
      value: '300',
      icon: <GiBookshelf size={30} />,
      color: '#1976d2'
    },
    {
      title: 'Total BSEd',
      value: '250',
      icon: <GiBookshelf size={30} />,
      color: '#1976d2'
    },
    {
      title: 'Total BSCrim',
      value: '225',
      icon: <RiPoliceBadgeFill size={30} />,
      color: '#c70202'
    },
    {
      title: 'Total BSHM',
      value: '247',
      icon: <MdTour size={30} />,
      color: '#dbff00'
    },
    {
      title: 'Total BSIT',
      value: '221',
      icon: <FaComputer size={30} />,
      color: '#2e7d32'
    },
    {
      title: 'Total BSOAd',
      value: '230',
      icon: <PiComputerTowerFill size={30} />,
      color: '#2e7d32'
    }
  ];

  const yearLevelData = [
    { year: 'First Year', count: 344 },
    { year: 'Second Year', count: 352 },
    { year: 'Third Year', count: 367 },
    { year: 'Fourth Year', count: 372 }
  ];

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="mb-4">Registrar Dashboard</h3>
        <div className="row">
          {statCards.map((card, index) => (
            <div key={index} className="col-md-4 mb-4">
              <Card 
                className="h-100 p-3" 
                sx={{ 
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)' },
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                <div className="d-flex align-items-center mb-3">
                  <div style={{ color: card.color }}>{card.icon}</div>
                  <Typography variant="h6" className="ms-2">{card.title}</Typography>
                </div>
                <Typography variant="h3" style={{ color: card.color }}>
                  {card.value}
                </Typography>
              </Card>
            </div>
          ))}
        </div>

        <div className="row mt-4">
          <div className="col-md-6 mb-4">
            <Card className="h-100 p-4">
              <div className="d-flex align-items-center mb-4">
                <IoIosPeople size={30} style={{ color: '#1976d2' }} />
                <Typography variant="h5" className="ms-2">Total Enrolled Students</Typography>
              </div>
              <Typography variant="h2" style={{ color: '#1976d2', marginBottom: '20px' }}>
                1,435
              </Typography>
              <Typography variant="h6" className="mb-3">Per Year Level</Typography>
              {yearLevelData.map((data, index) => (
                <div key={index} className="d-flex align-items-center mb-3">
                  <Typography variant="body1">{data.year}</Typography>
                  <Typography 
                    variant="h6" 
                    className="ms-auto" 
                    style={{ fontWeight: 'bold' }}
                  >
                    {data.count}
                  </Typography>
                </div>
              ))}
            </Card>
          </div>
          <div className="col-md-6 mb-4">
            <Card className="h-100 p-4">
              {/* Additional statistics or charts can be added here */}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrarDashboard;