import { useState, useEffect, useContext } from 'react';
import { Card, Typography, CircularProgress } from '@mui/material';
import { GiBookshelf } from "react-icons/gi";
import { RiPoliceBadgeFill } from "react-icons/ri";
import { MdTour } from "react-icons/md";
import { FaComputer } from "react-icons/fa6";
import { PiComputerTowerFill } from "react-icons/pi";
import { IoIosPeople } from "react-icons/io";
import { MyContext } from "../../App";
import axios from 'axios';
import { TbNumber1, TbNumber2, TbNumber3, TbNumber4 } from "react-icons/tb";

// Add this at the top with other imports
const programMapping = {
  1: "BSIT",
  2: "BSHM",
  3: "Education",
  4: "BSOAd",
  5: "BSCrim"
};
const programIcons = {
  1: <FaComputer size={40} style={{ color: '#006a13' }}/>,
  2: <MdTour size={40} style={{ color: '#b6b62a' }}/>,             
  3: <GiBookshelf size={40} style={{ color: '#092985' }}/>,          
  4: <PiComputerTowerFill size={40} style={{ color: '#11f000' }}/>,
  5: <RiPoliceBadgeFill size={40} style={{ color: '#6a0000' }}/>
};           
            
const ProgramHeadDashboard = () => {
  const [loading, setLoading] = useState(true);
  const context = useContext(MyContext);
  const [program_id, setProgramId] = useState(null);
  const [program_name, setProgramName] = useState("");
  const [programData, setProgramData] = useState({
    total_students: 0,
    students_per_year: {
      first: 0,
      second: 0,
      third: 0,
      fourth: 0
    }
  });

  // Fetch program_id and set program_name from localStorage
  useEffect(() => {
    const storedProgramId = localStorage.getItem("program_id");
    if (storedProgramId) {
      const programId = parseInt(storedProgramId, 10);
      if (!isNaN(programId)) {
        setProgramId(programId);
        setProgramName(programMapping[programId] || "Unknown");
      }
    }
  }, []);

  // Fetch student data when program_id is available
  useEffect(() => {
    const fetchProgramData = async () => {
      if (!program_id) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        const response = await axios.get(`/api/program-head-dashboard?program_id=${program_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProgramData(response.data);
      } catch (error) {
        console.error('Error fetching program data:', error);
      } finally {
        setLoading(false);
      }
    };

    context.setIsHideComponents(false);
    window.scrollTo(0,0);
    fetchProgramData();
  }, [context, program_id]);

  // Update statCards to use program_name
  // Update statCards array
  const statCards = [
    {
      title: 'st Year Students',
      value: programData.students_per_year.first || 0,
      icon: <TbNumber1 size={30} />,
      color: '#1976d2'
    },
    {
      title: 'nd Year Students',
      value: programData.students_per_year.second,
      icon: <TbNumber2 size={30} />,
      color: '#2e7d32'
    },
    {
      title: 'rd Year Students',
      value: programData.students_per_year.third,
      icon: <TbNumber3 size={30} />,
      color: '#ed6c02'
    },
    {
      title: 'th Year Students',
      value: programData.students_per_year.fourth,
      icon: <TbNumber4 size={30} />,
      color: '#9c27b0'
    }
  ];
  
  useEffect(() => {
    context.setIsHideComponents(false);
    window.scrollTo(0,0);
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, [context]);

  // Replace the current loading state
  if (loading) {
    return (
      <div className="right-content w-100">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
          <CircularProgress style={{ color: '#c70202' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="mb-4">{program_name} Program Head Dashboard</h3>
        <div className="row">
          {statCards.map((card, index) => (
            <div key={index} className="col-md-3 mb-4">
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

        {/* Program Statistics Section */}
        <div className="row mt-4">
          <div className="col-md-6 mb-4">
            <Card className="h-100 p-3">
              <Typography variant="h6" className="mb-3">Total {program_name} Students</Typography>
              <div className="d-flex align-items-center mb-3">
                {programIcons[program_id] || <IoIosPeople size={40} style={{ color: '#1976d2' }}/>}
                <Typography variant="h4" className="ms-2">{programData.total_students}</Typography>
              </div>
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>First Year {programData.program_name}</span>
                  <strong>{programData.students_per_year.first}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Second Year {programData.program_name}</span>
                  <strong>{programData.students_per_year.second}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Third Year {programData.program_name}</span>
                  <strong>{programData.students_per_year.third}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Fourth Year {programData.program_name}</span>
                  <strong>{programData.students_per_year.fourth}</strong>
                </div>
              </div>
            </Card>
          </div>
          <div className="col-md-6 mb-4">
            <Card className="h-100 p-3">
              <Typography variant="h6" className="mb-3">Recent Activities</Typography>
              {/* Add activities list here */}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramHeadDashboard;
