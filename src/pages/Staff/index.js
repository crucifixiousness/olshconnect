import { Modal, Button, TextField, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import { useState, useEffect } from 'react';
import axios from 'axios';

import { FaEye } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const Staff = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const handleOpen = () => setShowAddStaffModal(true);
  const handleClose = () => setShowAddStaffModal(false);
  const [newStaff, setNewStaff] = useState({
    full_name: "",
    staff_username: "",
    staff_password: "",
    role: "",
  });

  // Fetch staff data on component mount
  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      const response = await axios.get("http://localhost:4000/staff");
      setStaffList(response.data);
    } catch (error) {
      console.error("Error fetching staff data:", error);
    }
  };

  // Handle new staff input changes
  const handleInputChange = (e) => {
    setNewStaff({ ...newStaff, [e.target.name]: e.target.value });
  };

  const [statusMessage, setStatusMessage] = useState({ message: "", type: "" });
  const [isVisible, setIsVisible] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  // Add new staff
  const handleAddStaff = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Check if the required fields are filled
    const { full_name, staff_username, staff_password, role } = newStaff; // Destructure from newStaff
    if (!full_name || !staff_username || !staff_password || !role) {
      alert('Please fill in all the fields.');
      return;
    }
  
    // Prepare the data to send to the backend
    const requestData = {
      full_name,
      staff_username,
      staff_password,
      role,
    };
  
    try {
      // Make the fetch request to the backend API
      const response = await fetch('http://localhost:4000/registerStaff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
  
      // eslint-disable-next-line
      const result = await response.json();
  
      // Check for successful response
      if (response.ok) {
        // Handle successful registration (e.g., show a success message, redirect)
        setStatusMessage({ message: "Account Added!", type: "success" });
        setIsVisible(true);
        setShowAddStaffModal(true);
        setIsCreated(true);
        fetchStaffData(); // Optionally reload the staff list after adding new staff
      } else {
        // Handle error (e.g., show error message)
        setStatusMessage({ message: "Registration failed. Please try again.", type: "error" });
        setIsVisible(true);
      }
    } catch (error) {
      // Catch and handle any network or server errors
      console.error('Error during the request:', error);
      alert('Server error. Please try again later.');
    } finally {
        setTimeout(() => {
          setIsVisible(false);
          setShowAddStaffModal(false);
      }, 2000);
      setIsLoading(false);
    }
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd mt-2 pb-0">Staff Management</h3>
      </div>

      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd">Staff List</h3>

        {/* Add Staff Button */}
        <div className="d-flex justify-content-end mb-3">
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
          >
            + Add Staff
          </Button>
        </div>

        {/* Staff Table */}
        <div className="table-responsive mt-3">
          <table className="table table-bordered v-align">
            <thead className="thead-dark">
              <tr>
                <th>NAME</th>
                <th>ROLE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {staffList.length > 0 ? (
                staffList.map((staff) => (
                  <tr key={staff.staff_id}>
                    <td>{staff.full_name}</td>
                    <td>{staff.role}</td>
                    <td>
                      <div className="actions d-flex align-items-center">
                        <Button className="secondary" color="secondary"><FaEye /></Button>
                        <Button className="success" color="success"><FaPencilAlt /></Button>
                        <Button className="error" color="error"><MdDelete /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No staff data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="d-flex tableFooter">
            <Pagination count={10} color="primary" className="pagination" showFirstButton showLastButton />
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal
        open={showAddStaffModal}
        onClose={handleClose}
        BackdropProps={{ style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' } }}
      >
        <div
          className="modal-container p-4"
          style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: '500px', width: '100%',
          }}>
          <h3>Create Staff Account</h3>
          {!isCreated ? (
          <form onSubmit={handleAddStaff}>
            <TextField label="Full Name" name="full_name" value={newStaff.full_name} onChange={handleInputChange} fullWidth margin="normal"/>
            <TextField label="Username" name="staff_username" value={newStaff.staff_username} onChange={handleInputChange} fullWidth margin="normal"/>
            <TextField label="Password" name="staff_password" type="password" value={newStaff.staff_password} onChange={handleInputChange} fullWidth margin="normal"/>
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Role</InputLabel>
              <Select labelId="role-label" name="role" value={newStaff.role} onChange={handleInputChange} label="Role">
                <MenuItem value="admin">admin</MenuItem>
                <MenuItem value="instructor">instructor</MenuItem>
                <MenuItem value="registrar">registrar</MenuItem>
                <MenuItem value="finance">finance</MenuItem>
              </Select>
            </FormControl>

            {isVisible && (
              <Typography
                variant="body1"
                align="center"
                sx={{ color: statusMessage.type === "success" ? "green" : "red", mt: 2 }}
              >
                {statusMessage.message}
              </Typography>
            )}

            <div className="d-flex justify-content-end mt-3">
              <Button onClick={() => setShowAddStaffModal(false)}>Cancel</Button>
              <Button type="submit" color="primary" variant="contained" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
          ) : (
            <Typography
                variant="h6"
                align="center"
                sx={{ color: "green", fontWeight: "bold", mt: 4 }}
            >
                {statusMessage.message}
            </Typography>
        )}
        </div>
      </Modal>

    </div>
  );
};

export default Staff;
