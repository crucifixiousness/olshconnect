import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Stepper, Step, StepLabel, Paper, CircularProgress } from '@mui/material';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { FaSchool } from "react-icons/fa";
import { FaUserEdit } from "react-icons/fa";
import { MenuItem, Select, FormControl } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material';
import { Snackbar, Alert } from '@mui/material';

const formatFullName = (studentData) => {
  if (!studentData) return "N/A";
  
  let fullName = studentData.firstName || "";
  
  if (studentData.middleName && studentData.middleName.trim()) {
    fullName += ` ${studentData.middleName.charAt(0)}.`;
  }
  
  if (studentData.lastName) {
    fullName += ` ${studentData.lastName}`;
  }
  
  if (studentData.suffix && studentData.suffix.trim()) {
    fullName += ` ${studentData.suffix}`;
  }
  
  return fullName;
};

const StudentProfile = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const generateAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 2; i++) {
      const academicYear = `${currentYear + i}-${currentYear + i + 1}`;
      years.push(academicYear);
    }
    return years;
  };
  const theme = createTheme({
    palette: {
      primary: {
        main: '#c70202',
      },
    },
  });
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
    semester: '',           // Add this
    academic_year: ''       // Add this
  });

  const [isEnrolled, setIsEnrolled] = useState(false);
  
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    'Registration',
    'Enrollment',
    'Verify Enrollment',
    'Payment',
    'Officially Enrolled'
  ];

  useEffect(() => {
    if (studentData?.enrollment) {
      switch (studentData.enrollment.status) {
        case 'Registered':
          setActiveStep(0);
          break;
        case 'Pending':
          setActiveStep(1);
          break;
        case 'Verified':
          setActiveStep(2);
          break;
        case 'For Payment':
          setActiveStep(3);
          break;
        case 'Officially Enrolled':
          setActiveStep(4);
          break;
        default:
          setActiveStep(0);
      }
    }
  }, [studentData]);

  const token = localStorage.getItem('token'); 
  
  const fetchStudentData = useCallback(async () => {
    try {
      // Check cache first
      const cachedData = localStorage.getItem('studentProfileData');
      const cacheTimestamp = localStorage.getItem('studentProfileTimestamp');
      const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : null;
      
      // Use cache if it's less than 5 minutes old
      if (cachedData && cacheAge && cacheAge < 300000) {
        const parsedData = JSON.parse(cachedData);
        setStudentData(parsedData);
        setFormData(parsedData);
        setLoading(false);
        return;
      }

      const response = await axios.get("/api/studentprofile", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      // Cache the new data
      localStorage.setItem('studentProfileData', JSON.stringify(response.data));
      localStorage.setItem('studentProfileTimestamp', Date.now().toString());
      
      setStudentData(response.data);
      setFormData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching student data:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setSnackbar({
        open: true,
        message: `Failed to load profile: ${error.response?.data?.error || error.message}`,
        severity: 'error'
      });
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
     else if (['programs', 'yearLevel', 'semester', 'academic_year'].includes(name)) {
      setFormDataa({ ...formDataa, [name]: value });
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
      const dataToSubmit = {
        ...formData,
        suffix: formData.suffix || null,
      };

      const response = await axios.put("/api/updatestudentprofile", dataToSubmit, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Clear cache after successful update
      localStorage.removeItem('studentProfileData');
      localStorage.removeItem('studentProfileTimestamp');
      
      setStudentData(response.data);
      setOpen(false);
      setIsEditing(false);
      await fetchStudentData();
      
      // Add success notification
      setSnackbar({
        open: true,
        message: "Profile updated successfully!",
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating student data:', error);
      // Add error notification
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to update profile. Please try again.",
        severity: 'error'
      });
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // ✅ Stricter required field check
      const requiredFields = ['programs', 'yearLevel', 'semester', 'academic_year'];
      const missingFields = requiredFields.filter(
        field => formDataa[field] === undefined || formDataa[field] === null || formDataa[field] === ''
      );
  
      if (missingFields.length > 0) {
        setSnackbar({
          open: true,
          message: `Required fields missing: ${missingFields.join(', ')}`,
          severity: 'error'
        });
        setLoading(false);
        return;
      }
  
      // ✅ Semester validation
      const validSemesters = ['1st', '2nd', 'Summer'];
      if (!validSemesters.includes(formDataa.semester)) {
        setSnackbar({
          open: true,
          message: "Invalid semester selected.",
          severity: 'error'
        });
        setLoading(false);
        return;
      }
  
      // ✅ Validate files
      const maxSize = 50 * 1024 * 1024; // 50MB
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  
      const files = {
        idpic: formDataa.idpic,
        birthCertificateDoc: formDataa.birthCertificateDoc,
        form137Doc: formDataa.form137Doc
      };
  
      for (const [key, file] of Object.entries(files)) {
        if (file && (!allowedTypes.includes(file.type) || file.size > maxSize)) {
          throw new Error(`${key}: Must be JPG, PNG or PDF under 50MB`);
        }
      }
  
      // ✅ Optional debug log
      console.log("Submitting enrollment:", {
        programs: formDataa.programs,
        yearLevel: formDataa.yearLevel,
        semester: formDataa.semester,
        academic_year: formDataa.academic_year
      });
  
      const formDataToSend = new FormData();
      formDataToSend.append('programs', Number(formDataa.programs));
      formDataToSend.append('yearLevel', Number(formDataa.yearLevel));
      formDataToSend.append('semester', formDataa.semester);
      formDataToSend.append('academic_year', formDataa.academic_year);
  
      if (formDataa.idpic) formDataToSend.append('idpic', formDataa.idpic);
      if (formDataa.birthCertificateDoc) formDataToSend.append('birthCertificateDoc', formDataa.birthCertificateDoc);
      if (formDataa.form137Doc) formDataToSend.append('form137Doc', formDataa.form137Doc);
  
      const response = await axios.put("/api/enroll", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.data) {
        setSnackbar({
          open: true,
          message: response.data.message || "Enrollment successful!",
          severity: 'success'
        });
        setIsEnrolled(true);
        setOpenEnrollment(false);
  
        setFormDataa({
          programs: "",
          yearLevel: "",
          semester: "",
          academic_year: "",
          idpic: null,
          birthCertificateDoc: null,
          form137Doc: null,
        });
  
        await fetchStudentData();
      }
    } catch (error) {
      console.error('Enrollment Error:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.error || "Enrollment failed. Please try again.",
          severity: 'error'
        });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="right-content w-100">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
          <CircularProgress style={{ color: '#c70202' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="right-content w-100" data-testid="student-profile">
      <ThemeProvider theme={theme}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel data-testid="enrollment-stepper">
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </ThemeProvider>
      <div className="card shadow border-0 p-3 mt-1" style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
        <h3 className="hd mt-2 pb-0" style={{ margin: 0 }}>Student Profile</h3>
        <Button 
          variant="contained" 
          className='enrollbut' 
          color="primary" 
          onClick={handleOpenEnrollment}
          data-testid="enroll-button"
        >
          <FaSchool/>Enroll Now!
        </Button>
      </div>
      <div className="d-flex justify-content-end mb-3">
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleOpen} 
          className="edit-profile-button"
          data-testid="edit-profile-button"
          style={{ backgroundColor: '#c70202', color: 'white' }}
        >
          <FaUserEdit style={{ fontSize: '18px', marginRight: '10px' }} />
          Edit Profile
        </Button>
      </div>

      <div className="card shadow border-0 p-3 mt-1">
        <div className="profile-container">
          <div className="profile-card">
            <div className="row">
              {/* Profile Picture Section */}
              <div className="col-md-4 text-center">
                <div className="profile-picture-container mb-4" style={{
                  width: '200px',
                  height: '200px',
                  border: '3px solid #c70202',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  margin: '0 auto',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}>
                  {studentData?.enrollment?.idpic ? (
                    <img
                      src={`data:image/jpeg;base64,${studentData.enrollment.idpic}`}
                      alt="Student ID"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f8f9fa',
                      color: '#6c757d'
                    }}>
                      <span>No Photo</span>
                    </div>
                  )}
                </div>
                <h4 className="mt-3" style={{ color: '#c70202' }}>
                  {formatFullName(studentData)}
                </h4>
                <p className="text-muted">Student</p>
              </div>

              {/* Student Details Section */}
              <div className="col-md-8">
                <div className="profile-details p-3">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="info-group mb-4" style={{
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        transition: 'transform 0.2s',
                        cursor: 'pointer'
                      }}>
                        <h5 style={{ color: '#c70202' }} className="mb-3">Personal Information</h5>
                        <div className="info-item mb-2">
                          <strong>Birthdate:</strong><br/>
                          {studentData?.birthdate ? new Date(studentData.birthdate).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }) : "N/A"}
                        </div>
                        <div className="info-item mb-2">
                          <strong>Age:</strong><br/>
                          {studentData?.age}
                        </div>
                        <div className="info-item mb-2">
                          <strong>Religion:</strong><br/>
                          {studentData?.religion}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="info-group mb-4" style={{
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        transition: 'transform 0.2s',
                        cursor: 'pointer'
                      }}>
                        <h5 style={{ color: '#c70202' }} className="mb-3">Contact Information</h5>
                        <div className="info-item mb-2">
                          <strong>Email:</strong><br/>
                          {studentData?.email}
                        </div>
                        <div className="info-item mb-2">
                          <strong>Phone:</strong><br/>
                          {studentData?.number}
                        </div>
                        <div className="info-item mb-2">
                          <strong>Address:</strong><br/>
                          {studentData?.street_text}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="info-group mb-4" style={{
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    transition: 'transform 0.2s',
                    cursor: 'pointer'
                  }}>
                    <h5 style={{ color: '#c70202' }} className="mb-3">Guardian Information</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="info-item mb-2">
                          <strong>Guardian Name:</strong><br/>
                          {studentData?.guardianName}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-item mb-2">
                          <strong>Guardian Contact:</strong><br/>
                          {studentData?.guardianContactNo}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Editing Profile */}
      <Modal open={open} onClose={handleClose} data-testid="edit-profile-modal">
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

          <form onSubmit={handleSubmit} data-testid="edit-profile-form">
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
                data-testid="religion-input"
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
                inputProps={{ 'aria-label': 'Email' }}
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
              <Button variant="contained" color="primary" type="submit" data-testid="save-profile-button">
                Save Changes
              </Button>
            </div>
          </form>
        </Box>
      </Modal>
      <Modal open={openEnrollment} onClose={handleCloseEnrollment} data-testid="enrollment-modal">
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: "90%",
          maxWidth: "600px",
          margin: "50px auto",
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "30px",
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          maxHeight: "90vh",
          overflowY: "auto",
        }}>
          <Button
            onClick={handleCloseEnrollment}
            sx={{
              position: "absolute",
              top: "10px",
              right: "10px",
              minWidth: "30px",
              minHeight: "30px",
              padding: "5px",
              fontSize: "1.2rem",
              color: "#c70202",
              '&:hover': {
                backgroundColor: 'rgba(199, 2, 2, 0.1)',
              },
            }}
          >
            &times;
          </Button>

          <Typography variant="h5" sx={{ 
            textAlign: "center", 
            marginBottom: "20px",
            color: '#c70202',
            fontWeight: 'bold'
          }}>
            Enrollment Form
          </Typography>
            <form onSubmit={handleEnroll} data-testid="enrollment-form">
              <div className="registration-section">
                <Typography variant="h6" className="section-title">
                  Program Selection
                </Typography>
                <FormControl fullWidth margin="normal" required>
                  <Select
                    name="programs"
                    value={formDataa.programs}
                    onChange={handleInputChange}
                    inputProps={{ 'aria-label': 'programs' }}
                    data-testid="program-select"
                  >
                    <MenuItem value={2}>Bachelor of Elementary Education</MenuItem>
                    <MenuItem value={2}>Bachelor of Secondary Education</MenuItem>
                    <MenuItem value={3}>Bachelor of Science in Hospitality Management</MenuItem>
                    <MenuItem value={1}>Bachelor of Science in Information Technology</MenuItem>
                    <MenuItem value={4}>Bachelor of Science in Office Administration</MenuItem>
                    <MenuItem value={5}>Bachelor of Science in Criminology</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div className="registration-section">
                <Typography variant="h6" className="section-title">
                  Year Level
                </Typography>
                <FormControl fullWidth margin="normal" required>
                  <Select
                    name="yearLevel"
                    value={formDataa.yearLevel}
                    onChange={handleInputChange}
                    inputProps={{ 'aria-label': 'yearLevel' }}
                    data-testid="year-level-select"
                  >
                    <MenuItem value={1}>1st Year</MenuItem>
                    <MenuItem value={2}>2nd Year</MenuItem>
                    <MenuItem value={3}>3rd Year</MenuItem>
                    <MenuItem value={4}>4th Year</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div className="registration-section">
                <Typography variant="h6" className="section-title">
                  Semester
                </Typography>
                <FormControl fullWidth margin="normal" required>
                  <Select
                    name="semester"
                    value={formDataa.semester || ''}
                    onChange={handleInputChange}
                    inputProps={{ 'aria-label': 'semester' }}
                    data-testid="semester-select"
                  >
                    <MenuItem value="1st">1st Semester</MenuItem>
                    <MenuItem value="2nd">2nd Semester</MenuItem>
                    <MenuItem value="Summer">Summer</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div className="registration-section">
                <Typography variant="h6" className="section-title">
                  Academic Year
                </Typography>
                <FormControl fullWidth margin="normal" required>
                  <Select
                    name="academic_year"
                    value={formDataa.academic_year || ''}
                    onChange={handleInputChange}
                  >
                    {generateAcademicYears().map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <div className="registration-section">
                <Typography variant="h6" className="section-title">
                  Required Documents
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>ID Picture (JPEG/JPG)</Typography>
                    <input
                      type="file"
                      accept=".jpeg, .jpg"
                      className="form-control"
                      id="idpic"
                      name="idpic"
                      onChange={(e) => setFormDataa({ ...formDataa, idpic: e.target.files[0] })}
                      required
                      aria-label="ID Picture (JPEG/JPG)"
                      data-testid="id-pic-input"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, color: '#666' }}>Birth Certificate</Typography>
                    <input
                      type="file"
                      accept=".pdf, .jpeg, .jpg, .png"
                      className="form-control"
                      name="birthCertificateDoc"
                      onChange={(e) => setFormDataa({ ...formDataa, birthCertificateDoc: e.target.files[0] })}
                      required
                      aria-label="Birth Certificate (JPEG/JPG)"
                      data-testid="birth-cert-input"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, color: '#666' }}>Form 137</Typography>
                    <input
                      type="file"
                      accept=".pdf, .jpeg, .jpg, .png"
                      className="form-control"
                      name="form137Doc"
                      onChange={(e) => setFormDataa({ ...formDataa, form137Doc: e.target.files[0] })}
                      required
                      aria-label="Form 137 (JPEG/JPG)"
                      data-testid="form137-input"
                    />
                  </Grid>
                </Grid>
              </div>

              <Button 
                variant="contained" 
                type="submit"
                fullWidth
                sx={{ 
                  mt: 3,
                  bgcolor: '#c70202',
                  '&:hover': {
                    bgcolor: '#a00000',
                  },
                  height: '45px',
                  fontWeight: 'bold'
                }}
                data-testid="submit-enrollment-button"
              >
                Submit Enrollment
              </Button>
            </form>      
        </Box>
      </Modal>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default StudentProfile;
