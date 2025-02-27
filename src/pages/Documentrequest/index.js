import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';
import { FaCheck } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";



const DocumentRequests = () => {
  // eslint-disable-next-line
  const [requests, setRequests] = useState([]);
  const [filterBy, setFilterBy] = useState('');

  useEffect(() => {
    // Fetch requests from API (replace URL with your API endpoint)
    fetch('/api/document-requests')
      .then((response) => response.json())
      .then((data) => setRequests(data));
  }, []);

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0">Document Requests</h3>
      </div>

      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd">Requested Documents</h3>

        <div className="row cardFilters mt-3">
          <div className="col-md-3">
            <h4>FILTER BY DOCUMENT</h4>
            <FormControl size='small' className='w-100'>
              <Select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                displayEmpty
                inputProps={{ 'aria-label': 'Without label' }}
                className='w-100'
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                <MenuItem value="Certificate of Grades">Certificate of Grades</MenuItem>
                <MenuItem value="Good Moral">Good Moral</MenuItem>
                <MenuItem value="Diploma">Diploma</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <div className='table-responsive mt-3'>
          <table className='table table-bordered v-align'>
            <thead className='thead-dark'>
              <tr>
                <th>STUDENT NAME</th>
                <th>DOCUMENT TYPE</th>
                <th>REQUEST DATE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>              
                  <tr>
                    <td>Cee Jay P. Madayag</td>
                    <td>Certification of Grades</td>
                    <td>07-17-2024</td>
                    <td>Pending</td>
                    <td className='action'>
                      <div className='actions d-flex align-items-center'>
                        <Button className="success" color="success"><FaCheck/></Button>
                        <Button className="error" color="error"><FaXmark/></Button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Ken L. Magno</td>
                    <td>Good Moral</td>
                    <td>12-13-2024</td>
                    <td>Pending</td>
                    <td className='action'>
                      <div className='actions d-flex align-items-center'>
                        <Button className="success" color="success"><FaCheck/></Button>
                        <Button className="error" color="error"><FaXmark/></Button>
                      </div>
                    </td>
                  </tr>
            </tbody>
          </table>
          <div className='d-flex tableFooter'>
            <Pagination count={10} color="primary" className='pagination' showFirstButton showLastButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentRequests;
