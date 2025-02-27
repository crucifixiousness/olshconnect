import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';

import { FaEye } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Searchbar from '../../components/Searchbar';


const Enrollment  = () => {
  const [showBy, setshowBy] = useState('')
  const [showCourseBy, setCourseBy] = useState('')

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
          <h3 className="hd mt-2 pb-0">Enrollment</h3>      
      </div>

      <div className="card shadow border-0 p-3 mt-1">
          <div className="card shadow border-0 p-3 mt-1">
            <Searchbar/>
              <h3 className="hd">List</h3>

              <div className="row cardFilters mt-3">
                <div className="col-md-3">
                    <h4>SHOW BY</h4>
                    <FormControl size='small' className='w-100'>
                        <Select
                          value={showBy}
                          onChange={(e)=>setshowBy(e.target.value)}
                          displayEmpty
                          inputProps={{ 'aria-label': 'Without label' }}
                          labelId="demo-simple-select-label"
                          className='w-100'
                        >
                          <MenuItem value="">
                            <em>Default</em>
                          </MenuItem>
                          <MenuItem value={10}>A - Z</MenuItem>
                          <MenuItem value={20}>Z - A</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                <div className="col-md-3">
                    <h4>PROGRAM</h4>
                    <FormControl size='small' className='w-100'>
                      <Select
                        value={showCourseBy}
                        onChange={(e)=>setCourseBy(e.target.value)}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                        labelId="demo-simple-select-label"
                        className='w-100'
                      >
                        <MenuItem value="">
                          <em>Program</em>
                        </MenuItem>
                        <MenuItem value={10}>BSeD</MenuItem>
                        <MenuItem value={20}>BSIT</MenuItem>
                        <MenuItem value={30}>BSHM</MenuItem>
                        <MenuItem value={30}>BSOAd</MenuItem>
                        <MenuItem value={30}>BSCRIM</MenuItem>
                      </Select>
                    </FormControl>
                </div>
              </div>

              <div className='table-responsive mt-3'>
                  <table className='table table-bordered v-align'>
                        <thead className='thead-dark'>
                            <tr>
                                <th>STUDENT NAME</th>
                                <th>YEAR LEVEL</th>
                                <th>PROGRAM</th>
                                <th>SEX</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Cee Jay P. Madayag</td>
                                <td>3rd Year</td>
                                <td>BSIT</td>
                                <td>Male</td>
                                <td className='action'>
                                    <div className='actions d-flex align-items-center'>
                                        <Button className="secondary" color="secondary"><FaEye/></Button>
                                        <Button className="success" color="success">< FaPencilAlt/></Button>
                                        <Button className="error" color="error"><MdDelete/></Button>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Ken L. Magno</td>
                                <td>3rd Year</td>
                                <td>BSIT</td>
                                <td>Male</td>
                                <td className='action'>
                                    <div className='actions d-flex align-items-center'>
                                        <Button className="secondary" color="secondary"><FaEye/></Button>
                                        <Button className="success" color="success">< FaPencilAlt/></Button>
                                        <Button className="error" color="error"><MdDelete/></Button>
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
          
    </div>
  );
};

export default Enrollment;