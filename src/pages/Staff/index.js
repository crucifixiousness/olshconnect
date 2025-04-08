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
    program_id: "", // Add this to track selected program
  });

  // Fetch staff data on component mount
  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      const response = await axios.get("/api/stafflist");
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
  
    const { full_name, staff_username, staff_password, role, program_id } = newStaff;
  
    // Ensure program is selected when role is "Program Head"
    if (role === "program head" && !program_id) {
      alert("Please select a program for the Program Head.");
      setIsLoading(false);
      return;
    }
  
    // Prepare the request data
    const requestData = {
      full_name,
      staff_username,
      staff_password,
      role,
      program_id: role === "program head" ? program_id : null  // Set null for non-program head roles
    };
  
    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
  
      if (response.ok) {
        setStatusMessage({ message: "Account Added!", type: "success" });
        setIsVisible(true);
        setShowAddStaffModal(true);
        setIsCreated(true);
        fetchStaffData(); // Reload the staff list
      } else {
        setStatusMessage({ message: "Registration failed. Please try again.", type: "error" });
        setIsVisible(true);
      }
    } catch (error) {
      console.error("Error during the request:", error);
      alert("Server error. Please try again later.");
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
            <TextField label="Full Name" name="full_name" value={newStaff.full_name} onChange={handleInputChange} fullWidth margin="normal" data-testid="input-full_name"/>
            <TextField label="Username" name="staff_username" value={newStaff.staff_username} onChange={handleInputChange} fullWidth margin="normal" data-testid="input-staff_username"/>
            <TextField label="Password" name="staff_password" type="password" value={newStaff.staff_password} onChange={handleInputChange} fullWidth margin="normal" data-testid="input-staff_password"/>
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Role</InputLabel>
              <Select labelId="role-label" name="role" value={newStaff.role} onChange={handleInputChange} label="Role" data-testid="input-role">
                <MenuItem value="admin">admin</MenuItem>
                <MenuItem value="instructor">instructor</MenuItem>
                <MenuItem value="registrar">registrar</MenuItem>
                <MenuItem value="finance">finance</MenuItem>
                <MenuItem value="program head">program head</MenuItem>
              </Select>
            </FormControl>
            {newStaff.role === "program head" && (
              <FormControl fullWidth margin="normal">
                <InputLabel id="program-label">Program</InputLabel>
                <Select
                  labelId="program-label"
                  name="program_id"
                  value={newStaff.program_id}
                  onChange={handleInputChange}
                  label="Program"
                >
                  <MenuItem value="1">BSIT</MenuItem>
                  <MenuItem value="2">BSHM</MenuItem>
                  <MenuItem value="3">Education</MenuItem>
                  <MenuItem value="4">BSOAd</MenuItem>
                  <MenuItem value="5">BSCrim</MenuItem>
                </Select>
              </FormControl>
            )}

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
              <Button type="submit" color="primary" variant="contained" disabled={isLoading} data-testid="submit-button">
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
