import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { FaSchool } from "react-icons/fa";
import { FaUserEdit } from "react-icons/fa";
import { MenuItem, Select, FormControl } from "@mui/material";



const StudentProfile = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openEnrollment, setOpenEnrollment] = useState(false);
  const [formData, setFormData] = useState({});
  /* eslint-disable no-unused-vars */
  const [_isEditing, setIsEditing] = useState(false); // Flag to check if editing is in progress
  const navigate = useNavigate();
  const [formDataa, setFormDataa] = useState({
    idpic: '',
    birthCertificateDoc: '',
    form137Doc: '',
    programs: '',
    yearLevel: '',
  });
  
  const [statusMessage, setStatusMessage] = useState({ message: "", type: "" });
  const [_isVisible, setIsVisible] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const token = localStorage.getItem('token'); 
  
  const fetchStudentData = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:4000/student/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudentData(response.data);
      setFormData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching student data:", error);
      setLoading(false);
    }
  }, [token]);
  
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchStudentData();
    }
  }, [token, navigate, fetchStudentData]);

  const handleOpen = () => {
    setOpen(true);
    setIsEditing(true); // Set editing flag
  };

  const handleOpenEnrollment = () => {
    setOpenEnrollment(true);    
  };

  const handleCloseEnrollment = () => {
    setOpenEnrollment(false);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'birthdate') {
        const today = new Date();
        const selectedDate = new Date(value);

        // Check if the selected date is in the future
        if (selectedDate > today) {
            alert('Birthdate cannot be in the future');
            return; // Prevent updating the birthdate field if the date is in the future
        }

        // Calculate the age based on the birthdate
        const birthYear = selectedDate.getFullYear();
        const currentYear = today.getFullYear();
        let age = currentYear - birthYear;

        // Adjust age calculation if the birthday hasn't passed this year
        const birthMonth = selectedDate.getMonth();
        const currentMonth = today.getMonth();
        const birthDay = selectedDate.getDate();
        const currentDay = today.getDate();

        if (
            currentMonth < birthMonth ||
            (currentMonth === birthMonth && currentDay < birthDay)
        ) {
            age -= 1;
        }

        // Update form data with the new birthdate and calculated age
        setFormData({ ...formData, birthdate: value, age: age });
    } 
    // Restrict non-numeric inputs for first name, middle name, last name, suffix, place of birth, religion, and guardian name
    else if (['firstName', 'middleName', 'lastName', 'suffix', 'placeOfBirth', 'religion', 'guardianName'].includes(name)) {
        const validValue = value.replace(/[^a-zA-Z\s-]/g, '');
        setFormData({ ...formData, [name]: validValue });
    } 
    // Allow only numbers for the contact number, guardian contact, and age
    else if (name === 'number' || name === 'guardianContactNo') {
        let validNumber = value.replace(/[^0-9]/g, ''); // Remove non-numeric characters

        // Ensure the number starts with "09" and restrict to 11 digits
        if (validNumber.length > 11) {
            validNumber = validNumber.slice(0, 11); // Restrict to 11 digits
        }

        if (validNumber.length === 1 && validNumber !== '0') {
            validNumber = ''; // If the first digit is not 0, clear the field
        }

        if (validNumber.length === 2 && validNumber !== '09') {
            validNumber = '09'; // Ensure the number starts with "09"
        }

        setFormData({ ...formData, [name]: validNumber });

    } 
     // Handle dropdown selections (Material-UI Select) for `formDataa`
     else if (['programs', 'yearLevel'].includes(name)) {
      setFormDataa({ ...formDataa, [name]: value });  // ✅ Updating `formDataa`
    } 
    // Handle file uploads separately
    else if (['idpic', 'birthCertificateDoc', 'form137Doc'].includes(name)) {
        const file = e.target.files[0] || null; // Get selected file
        setFormDataa({ ...formDataa, [name]: file });
    } 
    // For other fields, no restriction
    else {
        setFormData({ ...formData, [name]: value });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("http://localhost:4000/student/profile", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentData(response.data); // Update studentData with the latest data
      setOpen(false); // Close the modal
      setIsEditing(false);
      fetchStudentData(); // Reset editing flag
    } catch (error) {
      console.error('Error updating student data:', error);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();

      try {
        const formDataToSend = new FormData();
        Object.keys(formDataa).forEach((key) => {
            if (formDataa[key] !== null && formDataa[key] !== "") {
                formDataToSend.append(key, formDataa[key]);
            }
        });

          const response = await axios.put("http://localhost:4000/enroll", formDataToSend, {
              headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
          });

          // Show success message
          setStatusMessage({ message: "Enrollment successful!", type: "success" });
          setIsVisible(true);
          setOpenEnrollment(true);
          setIsEnrolled(true);

          // Clear form fields
          setFormDataa({
              programs: "",
              yearLevel: "",
              idpic: null,
              birthCertificateDoc: null,
              form137Doc: null,
          });
      } catch (error) {
          console.error(error);

          // Show error message
          setStatusMessage({ message: "Enrollment failed. Please try again.", type: "error" });
          setIsVisible(true);
      } finally {
          // Hide the notification after 3 seconds
          setTimeout(() => {
              setIsVisible(false);
              setOpen(false);
          }, 4000);
      }
  };
  

  if (loading) {
    return <p>Loading your profile...</p>;
  }

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-1" style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
        <h3 className="hd mt-2 pb-0" style={{ margin: 0 }}>Student Profile</h3>
        <Button variant="contained" className='enrollbut' color="primary" onClick={handleOpenEnrollment}>
          <FaSchool/>Enroll Now!
        </Button>
      </div>
      <div className="d-flex justify-content-end mb-3">
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleOpen} 
          className="edit-profile-button" 
          style={{ backgroundColor: '#c70202', color: 'white' }} // Adding background color here
        >
          <FaUserEdit style={{ fontSize: '18px', marginRight: '10px' }} />
          Edit Profile
        </Button>
      </div>
      <div className="card shadow border-0 p-3 mt-1">
        <h3 className="hd">My Profile</h3>
        <div className="profile-container">
          <div className="profile-card">
            {studentData ? (
              <div className="student-details">
                <div className="profile-field mt-3">
                  <strong>Name:</strong> {studentData.firstName} {studentData.middleName} {studentData.lastName} {studentData.suffix}
                </div>
                <div className="profile-field mt-3">
                  <strong>Birthdate:</strong>{" "}
                  {studentData.birthdate ? new Date(studentData.birthdate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }) : "N/A"}
                </div>
                <div className="profile-field mt-3">
                  <strong>Age:</strong> {studentData.age}
                </div>
                <div className="profile-field mt-3">
                  <strong>Place of Birth:</strong> {studentData.placeOfBirth}
                </div>
                <div className="profile-field mt-3">
                  <strong>Religion:</strong> {studentData.religion}
                </div>
                <div className="profile-field mt-3">
                  <strong>Email:</strong> {studentData.email}
                </div>
                <div className="profile-field mt-3">
                  <strong>Contact Number:</strong> {studentData.number}
                </div>
                <div className="profile-field mt-3">
                  <strong>Address:</strong> {studentData.street_text}
                </div>
                <div className="profile-field mt-3">
                  <strong>Guardian Name:</strong> {studentData.guardianName}
                </div>
                <div className="profile-field mt-3">
                  <strong>Guardian Contact No:</strong> {studentData.guardianContactNo}
                </div>               
              </div>
            ) : (
              <p>No student data found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Editing Profile */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "relative",
            width: "90%",
            maxWidth: "600px",
            margin: "50px auto",
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: 24,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Button
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: "10px",
              right: "10px",
              minWidth: "30px",
              minHeight: "30px",
              padding: "5px",
              fontSize: "1rem",
              backgroundColor: "transparent",
              color: "#000",
              border: "none",
              cursor: "pointer",
            }}
          >
            &times;
          </Button>

          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            Edit Profile
          </h2>

          <form onSubmit={handleSubmit}>
            <h4>Account</h4>
            <div className="mb-3">
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Username"
                    fullWidth
                    margin="normal"
                    name="userName"
                    value={formData.userName || ''}
                    onChange={handleInputChange}
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    type="password"
                    label="Password"
                    fullWidth
                    margin="normal"
                    name="password"
                    value={formData.password || ''}
                    onChange={handleInputChange}
                    disabled
                  />
                </Grid>
              </Grid>
            </div>
            <h4>Student Information</h4>
            <div className="mb-3">
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <TextField
                    label="First Name"
                    fullWidth
                    margin="normal"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Middle Name"
                    fullWidth
                    margin="normal"
                    name="middleName"
                    value={formData.middleName || ''}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Last Name"
                    fullWidth
                    margin="normal"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Suffix"
                    fullWidth
                    margin="normal"
                    name="suffix"
                    value={formData.suffix || ''}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
            </div>
            <h4>Birthday</h4>
            <div className="mb-3">
              <TextField
                fullWidth
                margin="normal"
                name="birthdate"
                type="date"
                value={formData.birthdate ? formData.birthdate.split('-').reverse().join('-') : ''}
                onChange={handleInputChange}
                disabled
              />
              <TextField
                label="Age"
                fullWidth
                margin="normal"
                name="age"
                value={formData.age || ''}
                onChange={handleInputChange}
                disabled
              />
              <TextField
                label="Place of Birth"
                fullWidth
                margin="normal"
                name="placeOfBirth"
                value={formData.placeOfBirth || ''}
                onChange={handleInputChange}
                disabled
              />
              <TextField
                label="Religion"
                fullWidth
                margin="normal"
                name="religion"
                value={formData.religion || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleInputChange}
              />
              <TextField
                label="Contact Number"
                fullWidth
                margin="normal"
                name="number"
                value={formData.number || ''}
                onChange={handleInputChange}
              />
            </div>
            <h4>Address</h4>
            <div className="mb-3">
              <TextField
                label="Full Address"
                fullWidth
                margin="normal"
                name="street_text"
                value={formData.street_text || ''}
                onChange={handleInputChange}
                placeholder="Example: Purok 2, Narvacan II, Guimba, Nueva Ecija"
              />
            </div>
            <h4>Guardian Information</h4>
            <div className="mb-3">
              <TextField
                label="Guardian Name"
                fullWidth
                margin="normal"
                name="guardianName"
                value={formData.guardianName || ''}
                onChange={handleInputChange}
              />
              <TextField
                label="Guardian Contact"
                fullWidth
                margin="normal"
                name="guardianContactNo"
                value={formData.guardianContactNo || ''}
                onChange={handleInputChange}
              />
            </div>                    
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <Button variant="contained" color="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Box>
      </Modal>
      <Modal open={openEnrollment} onClose={handleCloseEnrollment}>
        <Box
          sx={{
            position: "relative",
            width: "90%",
            maxWidth: "600px",
            margin: "50px auto",
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: 24,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Button
            onClick={handleCloseEnrollment}
            sx={{
              position: "absolute",
              top: "10px",
              right: "10px",
              minWidth: "30px",
              minHeight: "30px",
              padding: "5px",
              fontSize: "1rem",
              backgroundColor: "transparent",
              color: "#000",
              border: "none",
              cursor: "pointer",
            }}
          >
            &times;
          </Button>

          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            Enrollment
          </h2>
          {!isEnrolled ? (
          <form onSubmit={handleEnroll}>
            <h4>Program</h4>
            <div className="mb-3">
              <FormControl fullWidth margin="normal" required>
                  <Select
                      name="programs"
                      value={formDataa.programs}
                      onChange={handleInputChange}
                      >
                      <MenuItem value="BEEd">Bacherlor of Elementary Education</MenuItem>
                      <MenuItem value="BSEd">Bacherlor of Secondary Education</MenuItem>
                      <MenuItem value="BSHM">Bacherlor of Science in Hospitality Management</MenuItem>
                      <MenuItem value="BSIT">Bacherlor of Science in Information Technolgy</MenuItem>
                      <MenuItem value="BSCrim">Bacherlor of Science in Criminology</MenuItem>
                  </Select>
              </FormControl>
            </div>
            <h4>Year Level</h4>
            <div className="mb-3">
              <FormControl fullWidth margin="normal" required>
                  <Select
                      name="yearLevel"
                      value={formDataa.yearLevel}
                      onChange={handleInputChange}
                      >
                      <MenuItem value="1st">1st Year</MenuItem>
                      <MenuItem value="2nd">2nd Year</MenuItem>
                      <MenuItem value="3rd">3rd Year</MenuItem>
                      <MenuItem value="4th">4th Year</MenuItem>
                  </Select>
              </FormControl>
            </div>
            <h4>Documents</h4>
            <div className="mb-3">
                <label htmlFor="idpic">Picture:</label>
                <input
                    type="file"
                    accept=".jpeg, .jpg"
                    className="form-control"
                    id="idpic"
                    name="idpic"
                    onChange={(e) => setFormDataa({ ...formDataa, idpic: e.target.files[0] })}
                    required
                    style={{ marginBottom: "20px" }}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="birthCertificateDoc">Birth Certificate:</label>
                <input
                    type="file"
                    accept=".pdf, .jpeg, .jpg, .png"
                    className="form-control"
                    name="birthCertificateDoc"
                    onChange={(e) => setFormDataa({ ...formDataa, birthCertificateDoc: e.target.files[0] })}
                    required
                    style={{ marginBottom: "20px" }}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="form137Doc">Form 137:</label>
                <input
                    type="file"
                    accept=".pdf, .jpeg, .jpg, .png"
                    className="form-control"
                    name="form137Doc"
                    onChange={(e) => setFormDataa({ ...formDataa, form137Doc: e.target.files[0] })}
                    required
                    style={{ marginBottom: "20px" }}
                />
            </div>                    
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <Button variant="contained" color="primary" type="submit">
                Enroll
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
        </Box>
      </Modal>
    </div>
  );
};

export default StudentProfile;
