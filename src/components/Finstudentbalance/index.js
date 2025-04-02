import { useState, useEffect, useCallback } from "react";
import { Button, FormControl, InputLabel, Select, MenuItem, Pagination } from "@mui/material";
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

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

  // Fetch students with balance
  const fetchStudents = useCallback(async () => {
    if (!program_id) return;
    try {
      const response = await axios.get(`http://localhost:4000/students/balance/${program_id}`);
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  }, [program_id]);

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

  const filteredStudents = students.filter(student => {
    const yearMatch = yearLevel ? student.year_level === parseInt(yearLevel) : true;
    const semesterMatch = selectedSemester ? student.semester === selectedSemester : true;
    return yearMatch && semesterMatch;
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
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student, index) => (
                  <tr key={index}>
                    <td>{student.student_id}</td>
                    <td>{`${student.first_name} ${student.last_name}`}</td>
                    <td>{student.year_level}</td>
                    <td>{student.program_name}</td>
                    <td>₱{student.balance.toLocaleString()}</td>
                    <td>{student.last_payment_date || 'No payments yet'}</td>
                    <td>
                      <span className={`badge ${student.balance > 0 ? 'bg-danger' : 'bg-success'}`}>
                        {student.balance > 0 ? 'With Balance' : 'Cleared'}
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
                    No students with balance found{yearLevel ? ` for Year ${yearLevel}` : ''}.
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