import { useState, useEffect, useCallback } from "react";
import { Button, FormControl, InputLabel, Select, MenuItem, Pagination } from "@mui/material";
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { TextField, InputAdornment } from '@mui/material';
import { FaSearch } from 'react-icons/fa';

const StudentBalance = () => {
  const [students, setStudents] = useState([]);
  const [program_id, setProgramId] = useState(null);
  //eslint-disable-next-line
  const [program_name, setProgramName] = useState("");
  const [searchParams] = useSearchParams();
  const yearLevel = searchParams.get('year');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [selectedSemester, setSelectedSemester] = useState('');
  
  const [loading, setLoading] = useState(true);
  
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching with params:', { program_id, yearLevel, selectedSemester }); // Debug log

      const response = await axios.get('/api/student-balances', {
        params: {
          program_id: program_id,
          year_level: yearLevel,
          semester: selectedSemester
        }
      });
      
      console.log('API Response:', response.data); // Debug log
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error.response || error);
    } finally {
      setLoading(false);
    }
  }, [program_id, yearLevel, selectedSemester]);

  useEffect(() => {
    const storedProgramId = localStorage.getItem("program_id");
    if (storedProgramId) {
      setProgramId(parseInt(storedProgramId));
    }
  }, []);

  useEffect(() => {
    if (program_id) {
      fetchStudents();
    }
  }, [fetchStudents, program_id]);

  // Add this state for search
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student => {
    const yearMatch = yearLevel ? student.year_level === parseInt(yearLevel) : true;
    const semesterMatch = selectedSemester ? student.semester === selectedSemester : true;
    const searchMatch = searchTerm.toLowerCase() === '' ? true : 
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.program_name.toLowerCase().includes(searchTerm.toLowerCase());
    return yearMatch && semesterMatch && searchMatch;
  });

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
  const pageCount = Math.ceil(filteredStudents.length / rowsPerPage);

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0">Student Balance Management</h3>
      </div>

      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd">
          Students Balance {yearLevel ? `- Year ${yearLevel}` : ''}
        </h3>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex gap-3">
            <TextField
              size="small"
              placeholder="Search by ID, name, or program"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                width: '300px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#c70202',
                  },
                  '&:hover fieldset': {
                    borderColor: '#a00000',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#c70202',
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <FaSearch style={{ color: '#c70202' }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="semester-filter-label">Filter by Semester</InputLabel>
              <Select
                labelId="semester-filter-label"
                value={selectedSemester}
                onChange={handleSemesterChange}
                label="Filter by Semester"
              >
                <MenuItem value="">All Semesters</MenuItem>
                <MenuItem value="1st">1st Semester</MenuItem>
                <MenuItem value="2nd">2nd Semester</MenuItem>
                <MenuItem value="Summer">Summer</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="table-responsive mt-3">
          <table className="table table-bordered v-align">
            <thead className="thead-dark">
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Year Level</th>
                <th>Program</th>
                <th>Total Balance</th>
                <th>Last Payment Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>Loading...</td>
                </tr>
              ) : paginatedStudents.length > 0 ? (
                paginatedStudents.map((student, index) => (
                  <tr key={student.student_id || index}>
                    <td>{student.student_id}</td>
                    <td>{`${student.first_name} ${student.last_name}`}</td>
                    <td>{student.year_level}</td>
                    <td>{student.program_name}</td>
                    <td>₱{parseFloat(student.balance).toLocaleString()}</td>
                    <td>{student.last_payment_date ? new Date(student.last_payment_date).toLocaleDateString() : 'No payments yet'}</td>
                    <td>
                      <span className={`badge ${parseFloat(student.balance) > 0 ? 'bg-danger' : 'bg-success'}`}>
                        {parseFloat(student.balance) > 0 ? 'With Balance' : 'Cleared'}
                      </span>
                    </td>
                    <td>
                      <div className="actions d-flex align-items-center gap-2">
                        <Button 
                          variant="contained" 
                          color="primary" 
                          size="small"
                        >
                          View Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No students with balance found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="d-flex tableFooter">
            <Pagination 
              count={pageCount}
              page={page}
              onChange={handlePageChange}
              color="primary" 
              className="pagination"
              showFirstButton 
              showLastButton 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentBalance;
