import React, { useEffect, useContext, useState } from 'react';
import { MyContext } from '../../App';
import homepagebg from '../../asset/images/olshcohomebg.jpg';
import schoolbg from '../../asset/images/olshcodiamond.jpg';
import schoolbgg from '../../asset/images/olshcoold.jpg';
import educ from '../../asset/images/pineduc.jpg';
import educc from '../../asset/images/pineducc.jpg';
import it from '../../asset/images/pinit.jpg';
import hm from '../../asset/images/pinhm.jpg';
import crim from '../../asset/images/pincrimm.jpg';
import oad from '../../asset/images/pinoad.jpg';
import courses from '../../asset/images/courses.png';
import { Link } from "react-router-dom";
import logo from '../../asset/images/olshco-logo1.png';
import announcement from '../../asset/images/anno.png';
import { Modal, Button, Box, TextField, MenuItem, Checkbox, FormControlLabel, Grid, Typography, Select, FormControl } from "@mui/material";
import axios from "axios";

const Homepage = () => {
    /* eslint-disable no-unused-vars */
  const { setIsHideComponents } = useContext(MyContext);

    useEffect(() => {
        // Ensure header and sidebar are visible for this page
        setIsHideComponents(true);

        // Clean up when leaving the component
        return () => setIsHideComponents(true);
    }, [setIsHideComponents]);

    const [showModal, setShowModal] = useState(false);
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to manage sidebar visibility

    // Toggle the sidebar visibility
    const toggleSidebar = () => {
        setIsSidebarOpen(prevState => !prevState);
    };

   /* const handleFileChange = (e) => {
        const { name, files } = e.target;
    
        if (files && files[0]) {
            setFormData({ ...formData, [name]: files[0] });
        }
    };*/

    const [formData, setFormData] = useState({
        userName: '',
        password: '',
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: '',
        sex: '',
        birthdate: '',
        age: '',
        placeOfBirth: '',
        religion: '',
        email: '',
        number: '',
        street_text: '',
        guardianName: '',
        guardianContactNo: '',
      });
    
      const handleInputChange = (e) => {
        let { name, value } = e.target;
    
        if (name === 'birthdate') {
            const today = new Date();
            const selectedDate = new Date(value);
    
            // Check if the selected date is in the future
            if (selectedDate > today) {
                alert('Birthdate cannot be in the future');
                return; // Prevent updating the birthdate field if the date is in the future
            }
    
            // Calculate the age based on the birthdate
            let birthYear = selectedDate.getFullYear();
            let currentYear = today.getFullYear();
            let age = currentYear - birthYear;
    
            // Ensure age calculation accounts for whether the birthday has passed this year
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

            // Set the form data with the new birthdate and calculated age
            setFormData({ ...formData, birthdate: value, age: age }); 
        } 
        // Restrict non-numeric inputs for first name, middle name, last name, suffix, place of birth, and religion
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
        // For other fields, no restriction
        else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const [statusMessage, setStatusMessage] = useState({ message: "", type: "" });
    const [isVisible, setIsVisible] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach((key) => {
                formDataToSend.append(key, formData[key]);
            });
    
            const response = await axios.post("http://localhost:4000/register", formDataToSend, {
                headers: { "Content-Type": "multipart/form-data" },
            });
    
            // Show success message
            setStatusMessage({ message: "Registration successful!", type: "success" });
            setIsVisible(true);
            setOpen(true);
            setIsRegistered(true);
    
            // Clear form fields
            setFormData({
                userName: "",
                password: "",
                firstName: "",
                middleName: "",
                lastName: "",
                suffix: "",
                sex: "",
                birthdate: "",
                age: "",
                placeOfBirth: "",
                religion: "",
                email: "",
                number: "",
                street_text: "",
                guardianName: "",
                guardianContactNo: "",
            });
        } catch (error) {
            console.error(error);
    
            // Show error message
            setStatusMessage({ message: "Registration failed. Please try again.", type: "error" });
            setIsVisible(true);
        } finally {
            // Hide the notification after 3 seconds
            setTimeout(() => {
                setIsVisible(false);
                setOpen(false);
            }, 4000);
        }
    };

      useEffect(() => {
        console.log(formData); // Log the state to check if it's properly populated
      }, [formData]);

  return (
    <>
            <header className="d-flex align-items-center">
                <div className="container-fluid w-100">
                <div className="row d-flex align-items-center w-100">
                    <div className="col-sm-2 part1">
                    <Link to="/" className="d-flex align-items-center logo">
                        <img src={logo} alt="OLSHCO Logo" />
                        <span className="ml-2">OLSHCO</span>
                    </Link>
                    </div>
                    <div className="col-sm-6 ml-auto d-flex align-items-center part2">
                    
                    <nav>
                        <ul className="nav-list d-flex">
                        <li>
                            <a href="#home">Home</a>
                        </li>
                        <li>
                            <a href="#school">School</a>
                        </li>
                        <li>
                            <a href="#courses">Offered Course</a>
                        </li>
                        <li>
                            <a href="#announcement">Announcement</a>
                        </li>
                        <li>
                            <a href="#contact">Contact</a>
                        </li>
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                        </ul>
                    </nav>
                    </div>
                </div>
                </div>
                    {/* Sidebar */}
                    <div className={`msidebar ${isSidebarOpen ? 'show' : ''}`}>
                        
                        <ul className="nav-list">
                            <li>
                            <a href="#home">Home</a>
                            </li>
                            <li>
                            <a href="#school">School</a>
                            </li>
                            <li>
                            <a href="#courses">Offered Course</a>
                            </li>
                            <li>
                            <a href="#announcement">Announcement</a>
                            </li>
                            <li>
                            <a href="#contact">Contact</a>
                            </li>
                            <li>
                            <Link to="/login">Login</Link>
                            </li>
                        </ul>                        
                    </div>
                    <div className="part3">
                        <div className="menu-icon" onClick={toggleSidebar}>
                            &#9776; {/* Hamburger icon */}
                        </div>
                    </div>
            </header>
            <div className="homepage">
                
                {/* Section 1: Home */}
                <section id="home" className="homesec" 
                    style={{backgroundImage: `url(${homepagebg})`, backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center',}}>
                        <div className='intro col-sm-7'>
                            <h2>Welcome to OLSHCO Sacrademia: Your Gateway to Academic Excellence</h2>
                            <p>
                                OLSHCO Sacrademia, the official student portal of Our Lady of the Sacred Heart College of Guimba Inc. 
                                This platform is designed to empower students by providing easy access to essential academic tools, resources, 
                                and updates. Whether you're exploring your courses, monitoring your grades, or staying updated on the latest 
                                announcements, OLSHCO Sacrademia ensures a seamless and interactive experience.
                            </p>
                            <p>
                                If you are incoming 1st year college you can register now.
                            </p>
                            <button className="btn btn-danger btn-expanded" onClick={handleOpen}>
                                REGISTER NOW!
                            </button>
                            <p>
                                Already have an account? Proceed to <a href="/login" className="text-primary">Login</a> to continue to enrollment.
                            </p>

                            {/* Modal */}
                            <Modal open={open} onClose={setOpen}>
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
                                maxHeight: "90vh", // Restrict the height of the modal
                                overflowY: "auto", // Enable scrolling
                            }}
                            >
                            {/* Close Button */}
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

                            <h2 style={{ textAlign: "center", marginBottom: "20px", }}>
                                Registration Form
                            </h2>
                            {!isRegistered ? (    
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
                                                value={formData.userName}
                                                onChange={handleInputChange}                                       
                                                required
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                type='password'
                                                label="Password"
                                                fullWidth
                                                margin="normal"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required
                                                />
                                            </Grid>                                    
                                        </Grid>
                                    </div>
                                    {/* Student Information */}
                                    <h4>Student Information</h4>
                                    <div className="mb-3">
                                    <Grid container spacing={2}>
                                        <Grid item xs={3}>
                                            <TextField
                                            label="First Name"
                                            fullWidth
                                            margin="normal"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                            />
                                        </Grid>
                                        <Grid item xs={3}>
                                            <TextField
                                            label="Middle Name"
                                            fullWidth
                                            margin="normal"
                                            name="middleName"
                                            value={formData.middleName}
                                            onChange={handleInputChange}
                                            />
                                        </Grid>
                                        <Grid item xs={3}>
                                            <TextField
                                            label="Last Name"
                                            fullWidth
                                            margin="normal"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            required
                                            />
                                        </Grid>
                                        <Grid item xs={3}>
                                            <TextField
                                            label="Suffix"
                                            fullWidth
                                            margin="normal"
                                            name="suffix"
                                            value={formData.suffix}
                                            onChange={handleInputChange}
                                            />
                                        </Grid>
                                    </Grid>
                                    </div>
                                    {/* Sex Information */}
                                    <h4>Sex</h4>
                                    <div className="mb-3">
                                        <FormControl fullWidth margin="normal" required>
                                            <Select
                                                name="sex"
                                                value={formData.sex}
                                                onChange={handleInputChange}
                                            >
                                                <MenuItem value="Male">Male</MenuItem>
                                                <MenuItem value="Female">Female</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <h4>Birthday</h4>
                                    <div className="mb-3">
                                    <TextField                                    
                                        fullWidth
                                        margin="normal"
                                        name="birthdate"
                                        type="date"
                                        value={formData.birthdate ? formData.birthdate.split('/').reverse().join('-') : ''}
                                        onChange={handleInputChange}
                                        required                                    
                                    />
                                    <TextField
                                        label="Age"
                                        fullWidth
                                        margin="normal"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        disabled
                                    />
                                    <TextField
                                        label="Place of Birth"
                                        fullWidth
                                        margin="normal"
                                        name="placeOfBirth"
                                        value={formData.placeOfBirth}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <TextField
                                        label="Religion"
                                        fullWidth
                                        margin="normal"
                                        name="religion"
                                        value={formData.religion}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    </div>                                
                                    <div className="mb-3">
                                    <TextField
                                        label="Email"
                                        fullWidth
                                        margin="normal"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <TextField
                                        label="Contact Number"
                                        fullWidth
                                        margin="normal"
                                        name="number"
                                        value={formData.number}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    </div>
                                    
                                    <div className="mb-3">
                                    <h4>Address</h4>                                
                                        <TextField
                                        label="Full Address"
                                        fullWidth
                                        margin="normal"
                                        name="street_text"
                                        id="street-text"
                                        value={formData.street_text}
                                        onChange={handleInputChange}
                                        placeholder='Example: Purok 2, Narvacan II, Guimba, Nueva Ecija'
                                        />                                                                            
                                    </div>

                                    {/* Guardian Information */}
                                    <h4>Guardian Information</h4>
                                    <div className="mb-3">
                                    <TextField
                                        label="Guardian Name"
                                        fullWidth
                                        margin="normal"
                                        name="guardianName"
                                        value={formData.guardianName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <TextField
                                        label="Guardian Contact"
                                        fullWidth
                                        margin="normal"
                                        name="guardianContactNo"
                                        value={formData.guardianContactNo}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    </div>
                                    {/* Privacy Policy Agreement */}
                                    <FormControlLabel
                                    control={<Checkbox required />}
                                    label={
                                        <>
                                        I agree with the Privacy Policy
                                        </>
                                    } 
                                    />

                                    {/* Submit Button */}
                                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                                    <Button variant="contained" color="primary" type="submit">
                                        Register
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
                </section>

                {/* Section 2: School */}
                <section id="school" className="section"
                style={{backgroundImage: `url(${schoolbgg})`, backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden', opacity: 0.9,}}>
                    <header className="header-bar">
                        <div >
                            <h1>Our School</h1>
                        </div>
                    </header>
                    <img src={schoolbg} alt="School Background" style={{width: '100%', height: '80%', objectFit: 'contain', position: 'absolute', zIndex: -1, marginTop: '100px',}}/>
                </section>

                {/* Section 3: Offered Course */}
                <section id="courses" className="section"
                style={{backgroundImage: `url(${courses})`, backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1}}>
                    <header className="header-bar">
                        <div >
                            <h1>Courses We Offer</h1>
                        </div>
                    </header>
                    <div className="course-grid">
                        {/* BSIT */}
                        <div className="course-item">
                        <img
                            src={it}
                            alt="Bachelor of Science in Information Technology"
                            
                        />
                        <h3>BS Information Technology</h3>
                        </div>

                        {/* BSHM */}
                        <div className="course-item">
                        <img
                            src={hm}
                            alt="Bachelor of Science in Hospitality Management"
                        />
                        <h3>BS Hospitality Management</h3>
                        </div>

                        {/* BEED */}
                        <div className="course-item">
                        <img
                            src={educ}
                            alt="Bachelor of Elementary Education"
                        />
                        <h3>Bachelor of Elementary Education</h3>
                        </div>

                        {/* BSEd */}
                        <div className="course-item">
                        <img
                            src={educc}
                            alt="Bachelor of Secondary Education"
                        />
                        <h3>Bachelor of Secondary Education</h3>
                        </div>

                        {/* BSCrim */}
                        <div className="course-item">
                        <img
                            src={crim}
                            alt="Bachelor of Science in Criminology"
                        />
                        <h3>BS Criminology</h3>
                        </div>

                        {/* BSOAd */}
                        <div className="course-item">
                        <img
                            src={oad}
                            alt="Bachelor of Science in Office Administration"
                        />
                        <h3>BS Office Administration</h3>
                        </div>
                    </div>
                </section>

                {/* Section 4: Announcement */}
                <section id="announcement" className="section"
                style={{backgroundImage: `url(${announcement})`, backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative'}}>
                    
                    <header className="header-bar">
                        <div >
                            <h1>Announcements</h1>
                        </div>
                    </header>

                    <div className="announcements-container d-flex flex-wrap">
                        <div className="announcement-card">
                        <h3>No Tuition Fee Increase</h3>
                        <p>June 22, 2021</p>
                        <p>PS-GS & JUNIOR HIGH SCHOOL (Enroll Now!) click Read more to register</p>
                        <button className="btn btn-primary">Read More</button>
                        </div>

                        <div className="announcement-card">
                        <h3>No Tuition Fee Increase</h3>
                        <p>June 22, 2021</p>
                        <p>SENIOR HIGH SCHOOL - ABM / HUMSS / STEM / TECHVOC (Enroll Now!) click Read more to register</p>
                        <button className="btn btn-primary">Read More</button>
                        </div>

                        <div className="announcement-card">
                        <h3>Upcoming Events</h3>
                        <p>June 28, 2021</p>
                        <p>OLSHCO ENROLLMENT IS ONGOING!</p>
                        <button className="btn btn-primary">Read More</button>
                        </div>
                    </div>
                </section>                
            </div>

            <footer id="contact" className="footer-section">
            <h2>Contact Us</h2>
                <p>
                    Have questions or need assistance? Feel free to reach out to us:
                </p>
                <ul>
                    <li>Email: olshco.acesschools.ph</li>
                    <li>Tel. No.: 0956-2774029</li>
                    <li>2024 by OUR LADY OF THE SACRED HEART COLLEGE OF GUIMBA, INC..
                    Created by BSIT-3B Von Mamaid, Dianne Paderan, Aileen Rigor</li>
                </ul>
            </footer>
    </>
  );
};

export default Homepage;