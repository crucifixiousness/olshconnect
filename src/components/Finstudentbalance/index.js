import { useState, useEffect, useCallback } from "react";
import { 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Pagination,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip
} from "@mui/material";
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import Searchbar from '../Searchbar';

const StudentBalance = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [searchParams] = useSearchParams();
  const yearLevel = searchParams.get('year');

  // Add CSS to override Searchbar margin
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .searchbar-container .searchBar {
        margin-bottom: 0 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/student-balances');
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = students.filter(student => {
    const semesterMatch = selectedSemester ? student.semester === selectedSemester : true;
    const searchMatch = searchTerm.toLowerCase() === '' ? true : 
      student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.program_name.toLowerCase().includes(searchTerm.toLowerCase());
    return semesterMatch && searchMatch;
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

  const getStatusColor = (balance) => {
    return parseFloat(balance) > 0 ? 'error' : 'success';
  };

  const getStatusText = (balance) => {
    return parseFloat(balance) > 0 ? 'With Balance' : 'Cleared';
  };

  if (loading) {
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
            <div className="d-flex align-items-center gap-2" style={{ width: '100%' }}>
              <div style={{ width: '850px' }}>
                <div className="searchbar-container" style={{ marginBottom: '0' }}>
                  <Searchbar value={searchTerm} onChange={setSearchTerm} />
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <FormControl sx={{ minWidth: 180, height: '40px' }}>
                  <InputLabel id="semester-filter-label" sx={{ fontSize: '0.875rem' }}>Filter by Semester</InputLabel>
                  <Select
                    labelId="semester-filter-label"
                    value={selectedSemester}
                    onChange={handleSemesterChange}
                    label="Filter by Semester"
                    size="small"
                    sx={{
                      height: '40px',
                      fontSize: '0.875rem',
                      '& .MuiOutlinedInput-root': {
                        height: '40px',
                        '&:hover fieldset': {
                          borderColor: '#c70202',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#c70202',
                        },
                      },
                      '& .MuiSelect-select': {
                        fontSize: '0.875rem',
                        paddingTop: '8px',
                        paddingBottom: '8px',
                      },
                    }}
                  >
                    <MenuItem value="" sx={{ fontSize: '0.875rem' }}>All Semesters</MenuItem>
                    <MenuItem value="1st" sx={{ fontSize: '0.875rem' }}>1st Semester</MenuItem>
                    <MenuItem value="2nd" sx={{ fontSize: '0.875rem' }}>2nd Semester</MenuItem>
                    <MenuItem value="Summer" sx={{ fontSize: '0.875rem' }}>Summer</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
          </div>

          {/* Loading State for Table */}
          <Paper elevation={3} className="p-4">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
              <CircularProgress style={{ color: '#c70202' }} />
            </div>
          </Paper>
        </div>
      </div>
    );
  }

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
          <div className="d-flex align-items-center gap-2" style={{ width: '100%' }}>
            <div style={{ width: '850px' }}>
              <div className="searchbar-container" style={{ marginBottom: '0' }}>
                <Searchbar value={searchTerm} onChange={setSearchTerm} />
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <FormControl sx={{ minWidth: 180, height: '40px' }}>
                <InputLabel id="semester-filter-label" sx={{ fontSize: '0.875rem' }}>Filter by Semester</InputLabel>
                <Select
                  labelId="semester-filter-label"
                  value={selectedSemester}
                  onChange={handleSemesterChange}
                  label="Filter by Semester"
                  size="small"
                  sx={{
                    height: '40px',
                    fontSize: '0.875rem',
                    '& .MuiOutlinedInput-root': {
                      height: '40px',
                      '&:hover fieldset': {
                        borderColor: '#c70202',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#c70202',
                      },
                    },
                    '& .MuiSelect-select': {
                      fontSize: '0.875rem',
                      paddingTop: '8px',
                      paddingBottom: '8px',
                    },
                  }}
                >
                  <MenuItem value="" sx={{ fontSize: '0.875rem' }}>All Semesters</MenuItem>
                  <MenuItem value="1st" sx={{ fontSize: '0.875rem' }}>1st Semester</MenuItem>
                  <MenuItem value="2nd" sx={{ fontSize: '0.875rem' }}>2nd Semester</MenuItem>
                  <MenuItem value="Summer" sx={{ fontSize: '0.875rem' }}>Summer</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </div>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Student ID</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Name</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Year Level</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Program</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Total Balance</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Last Payment Date</TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#c70202' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => (
                  <TableRow key={student.student_id}>
                    <TableCell>{student.student_id}</TableCell>
                    <TableCell>{student.student_name}</TableCell>
                    <TableCell>{student.year_level}</TableCell>
                    <TableCell>{student.program_name}</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>
                      ₱{parseFloat(student.balance).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {student.last_payment_date ? new Date(student.last_payment_date).toLocaleDateString() : 'No payments yet'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(student.balance)}
                        color={getStatusColor(student.balance)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="7" style={{ textAlign: "center" }}>
                    No students with balance found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {filteredStudents.length > 0 && (
          <div className="d-flex tableFooter">
            <Pagination 
              count={pageCount}
              page={page}
              onChange={handlePageChange}
              color="primary" 
              className="pagination"
              showFirstButton 
              showLastButton 
              sx={{
                '& .MuiPaginationItem-root': {
                  '&.Mui-selected': {
                    bgcolor: '#c70202',
                    '&:hover': {
                      bgcolor: '#a00000',
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentBalance;
