import { useState, useEffect } from 'react';
import { Button, FormControl, Select, MenuItem, Pagination } from '@mui/material';
import { FaEye } from "react-icons/fa";
import Searchbar from '../../components/Searchbar';
import axios from 'axios';

const ProgramStudentList = () => {
  const [yearLevel, setYearLevel] = useState('');
  const [block, setBlock] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [programId, setProgramId] = useState(null);
  const [programName, setProgramName] = useState('');

  // Add program mapping
  const programMapping = {
    1: 'BSIT',
    2: 'BSED',
    3: 'BSHM',
    4: 'BSOA',
    5: 'BSCRIM'
    // Add more programs as needed
  };

  useEffect(() => {
    const storedProgramId = localStorage.getItem("program_id");
    
    if (storedProgramId) {
      const programId = parseInt(storedProgramId, 10);
      if (!isNaN(programId)) {
        setProgramId(programId);
        setProgramName(programMapping[programId] || "Unknown Program");
      }
    }
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!programId) return;
      
      try {
        const response = await axios.get(`/api/program-students`, {
          params: {
            program_id: programId,
            yearLevel,
            block
          }
        });
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [programId, yearLevel, block]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0">Program Students</h3>      
      </div>

      <div className="card shadow border-0 p-3 mt-1">
        <div className="card shadow border-0 p-3 mt-1">
          <Searchbar/>
          <h3 className="hd">Student List - {programName}</h3>

          <div className="row cardFilters mt-3">
            <div className="col-md-3">
              <h4>YEAR LEVEL</h4>
              <FormControl size='small' className='w-100'>
                <Select
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  displayEmpty
                  className='w-100'
                >
                  <MenuItem value="">All Years</MenuItem>
                  <MenuItem value="1">1st Year</MenuItem>
                  <MenuItem value="2">2nd Year</MenuItem>
                  <MenuItem value="3">3rd Year</MenuItem>
                  <MenuItem value="4">4th Year</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="col-md-3">
              <h4>BLOCK</h4>
              <FormControl size='small' className='w-100'>
                <Select
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  displayEmpty
                  className='w-100'
                >
                  <MenuItem value="">All Blocks</MenuItem>
                  <MenuItem value="A">Block A</MenuItem>
                  <MenuItem value="B">Block B</MenuItem>
                  <MenuItem value="C">Block C</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          <div className='table-responsive mt-3'>
            <table className='table table-bordered v-align'>
              <thead className='thead-dark'>
                <tr>
                  <th>STUDENT ID</th>
                  <th>STUDENT NAME</th>
                  <th className="text-center">YEAR LEVEL</th>
                  <th className="text-center">BLOCK</th>
                  <th className="text-center">STATUS</th>
                  <th className="text-center">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center">Loading...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">No students found</td>
                  </tr>
                ) : (
                  students
                    .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                    .map((student) => (
                      <tr key={student.id}>
                        <td>{student.student_id}</td>
                        <td>{student.student_name}</td>
                        <td className="text-center">{student.year_level}</td>
                        <td className="text-center">{student.block}</td>
                        <td className="text-center">
                          <span className={`badge ${student.status === 'Regular' ? 'bg-success' : 'bg-warning'}`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="text-center">
                          <Button 
                            variant="contained"
                            size="small"
                            startIcon={<FaEye/>}
                            sx={{
                              bgcolor: '#0d6efd',
                              '&:hover': { bgcolor: '#0b5ed7' }
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
            <div className='d-flex tableFooter'>
              <Pagination 
                count={Math.ceil(students.length / rowsPerPage)} 
                page={page}
                onChange={handlePageChange}
                color="primary" 
                className='pagination' 
                showFirstButton 
                showLastButton 
              />
            </div>
          </div>          
        </div>
      </div>
    </div>
  );
};

export default ProgramStudentList;