import { useState, useEffect } from 'react';
import { Button, FormControl, Select, MenuItem, Pagination } from '@mui/material';
import { FaEye } from "react-icons/fa";
import Searchbar from '../../components/Searchbar';
import axios from 'axios';

const ProgramStudentList = () => {
  const [showBy, setshowBy] = useState('');
  const [block, setBlock] = useState('');
  const [yearLevel, setYearLevel] = useState('');
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
      setProgramId(storedProgramId);
      setProgramName(programMapping[storedProgramId] || "Unknown Program");
    }
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!programId) return;
      
      try {
        // Only include non-empty filter values and ensure year_level is a number
        const params = {
          program_id: programId,
          ...(yearLevel && yearLevel !== '' && { year_level: parseInt(yearLevel) }),
          ...(block && block !== '' && { block_name: block })
        };

        const response = await axios.get('/api/get-program-students', { params });
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [programId, yearLevel, block, showBy]);

  const getYearSuffix = (year) => {
    switch (year) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      case 4: return 'th';
      default: return '';
    }
  };

  return (
    <div className="right-content w-100" data-testid="student-list">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0">Student List</h3>      
      </div>
  
      <div className="card shadow border-0 p-3 mt-1">
        <div className="card shadow border-0 p-3 mt-1">
          <Searchbar/>
          <h3 className="hd">Student List - {programName}</h3>
  
          <div className="row cardFilters mt-3">
            <div className="col-md-3">
              <h4>SHOW BY</h4>
              <FormControl size='small' className='w-100'>
                <Select
                  value={showBy}
                  onChange={(e) => setshowBy(e.target.value)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Show by filter' }}
                  className='w-100'
                >
                  <MenuItem value=""><em>Default</em></MenuItem>
                  <MenuItem value="asc">A - Z</MenuItem>
                  <MenuItem value="desc">Z - A</MenuItem>
                </Select>
              </FormControl>
            </div>
  
            <div className="col-md-3">
              <h4>YEAR LEVEL</h4>
              <FormControl size='small' className='w-100'>
                <Select
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  displayEmpty
                  className='w-100'
                >
                  <MenuItem value=""><em>All Years</em></MenuItem>
                  <MenuItem value={1}>1st Year</MenuItem>
                  <MenuItem value={2}>2nd Year</MenuItem>
                  <MenuItem value={3}>3rd Year</MenuItem>
                  <MenuItem value={4}>4th Year</MenuItem>
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
                  <MenuItem value=""><em>All Blocks</em></MenuItem>
                  <MenuItem value="A">Block A</MenuItem>
                  <MenuItem value="B">Block B</MenuItem>
                  <MenuItem value="C">Block C</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
  
          <div className='table-responsive mt-3'>
            <table className='table table-bordered v-align' data-testid="student-table">
              <thead className='thead-dark'>
                <tr>
                  <th>STUDENT NAME</th>
                  <th className="text-center">YEAR LEVEL</th>
                  <th className="text-center">BLOCK</th>
                  <th className="text-center">SEX</th>
                  <th className="text-center">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center">Loading...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">No enrolled students found</td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.student_name}</td>
                      <td className="text-center">
                        {student.year_level === 0 ? 
                          <span className="text-muted">N/A</span> : 
                          `${student.year_level}${getYearSuffix(student.year_level)} Year`
                        }
                      </td>
                      <td className="text-center">
                        {student.block === 'N/A' ? 
                          <span className="text-muted">N/A</span> : 
                          `Block ${student.block}`
                        }
                      </td>
                      <td className="text-center">
                        {student.sex === 'N/A' ? 
                          <span className="text-muted">N/A</span> : 
                          student.sex
                        }
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
              <Pagination count={10} color="primary" className='pagination' showFirstButton showLastButton />
            </div>
          </div>          
        </div>
      </div>
    </div>
  );
};

export default ProgramStudentList;
