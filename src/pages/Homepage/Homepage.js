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
import { Modal, Button, Box, TextField, MenuItem, Typography, Checkbox, FormControlLabel, Grid, Snackbar, Alert, Select, FormControl } from "@mui/material";
import axios from "axios";
import { regions, provinces, cities, barangays } from 'select-philippines-address';

// Honeypot detection for registration
const detectMaliciousRegistration = (fields) => {
  const suspiciousUsernames = [
    'admin', 'root', 'administrator', 'test', 'guest', 'user', 'demo',
    'sqlmap', 'hacker', 'attacker', 'malware', 'virus', 'backdoor'
  ];
  const suspiciousPasswords = [
    'admin', '123456', 'password', 'root', 'toor', 'test', 'guest',
    '123456789', 'qwerty', 'abc123', 'password123', 'admin123'
  ];
  const sqlInjectionPatterns = [
    "' OR '1'='1", "' OR 1=1--", "admin'--", "admin'/*", 
    "' UNION SELECT", "'; DROP TABLE", "'; INSERT INTO",
    "1' OR '1'='1", "1' OR 1=1#", "admin' #"
  ];
  const xssPatterns = [
    "<script>", "javascript:", "onload=", "onerror=", "onclick=",
    "<img src=x onerror=", "<svg onload=", "alert(", "confirm("
  ];

  // Check all fields for suspicious patterns
  for (const [key, value] of Object.entries(fields)) {
    if (!value) continue;
    
    // Ensure value is a string before calling toLowerCase()
    const stringValue = String(value);
    const val = stringValue.toLowerCase();
    
    if (suspiciousUsernames.some(susp => val.includes(susp))) {
      return { detected: true, type: 'Suspicious Username', pattern: value, field: key };
    }
    if (suspiciousPasswords.some(susp => val.includes(susp))) {
      return { detected: true, type: 'Suspicious Password', pattern: value, field: key };
    }
    if (sqlInjectionPatterns.some(pattern => val.includes(pattern.toLowerCase()))) {
      return { detected: true, type: 'SQL Injection Attempt', pattern: value, field: key };
    }
    if (xssPatterns.some(pattern => val.includes(pattern.toLowerCase()))) {
      return { detected: true, type: 'XSS Attempt', pattern: value, field: key };
    }
  }
  return { detected: false };
};

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

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
      });
    
    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
      };

    

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

    // Address state for select-philippines-address
    const [address, setAddress] = useState({
        region: '',
        province: '',
        city: '',
        barangay: ''
    });

    // Address display names for the full address text
    const [addressNames, setAddressNames] = useState({
        region: '',
        province: '',
        city: '',
        barangay: ''
    });

    // Dropdown data state
    const [regionData, setRegionData] = useState([]);
    const [provinceData, setProvinceData] = useState([]);
    const [cityData, setCityData] = useState([]);
    const [barangayData, setBarangayData] = useState([]);

    // Load regions on component mount
    useEffect(() => {
        const loadRegions = async () => {
            try {
                const regionsList = await regions();
                setRegionData(regionsList);
            } catch (error) {
                console.error('Error loading regions:', error);
            }
        };
        loadRegions();
    }, []);

    // Load provinces when region changes
    useEffect(() => {
        const loadProvinces = async () => {
            if (address.region) {
                try {
                    const provincesList = await provinces(address.region);
                    setProvinceData(provincesList);
                } catch (error) {
                    console.error('Error loading provinces:', error);
                }
            } else {
                setProvinceData([]);
            }
        };
        loadProvinces();
    }, [address.region]);

    // Load cities when province changes
    useEffect(() => {
        const loadCities = async () => {
            if (address.province) {
                try {
                    const citiesList = await cities(address.province);
                    setCityData(citiesList);
                } catch (error) {
                    console.error('Error loading cities:', error);
                }
            } else {
                setCityData([]);
            }
        };
        loadCities();
    }, [address.province]);

    // Load barangays when city changes
    useEffect(() => {
        const loadBarangays = async () => {
            if (address.city) {
                try {
                    const barangaysList = await barangays(address.city);
                    setBarangayData(barangaysList);
                } catch (error) {
                    console.error('Error loading barangays:', error);
                }
            } else {
                setBarangayData([]);
            }
        };
        loadBarangays();
    }, [address.city]);

    // Update form data when address selections change
    useEffect(() => {
        const addressParts = [
            addressNames.barangay,
            addressNames.city,
            addressNames.province
        ].filter(Boolean); // Remove empty values
        
        const fullAddress = addressParts.join(', ');
        
        setFormData(prev => ({
            ...prev,
            street_text: fullAddress
        }));
    }, [addressNames]);

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
    
            // Set error for contact number if less than 11 digits  
            if (name === 'number') {
                if (validNumber.length > 0 && validNumber.length < 11) {
                    setContactNumberError("Contact number must be 11 digits");
                } else {
                    setContactNumberError("");
                }
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
    const [contactNumberError, setContactNumberError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // 🚨 HONEYPOT: Check for malicious registration attempt
        const maliciousCheck = detectMaliciousRegistration(formData);

        if (maliciousCheck.detected) {
            // Log the malicious attempt
            await axios.post('/api/login-honeypot-log', {
                timestamp: new Date().toLocaleString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2'),
                activityType: maliciousCheck.type,
                exploitPayload: maliciousCheck.pattern,
                honeypotPath: '/registration',
                action: 'attempt',
                vulnerabilityType: maliciousCheck.type,
                pageType: 'student_registration',
                field: maliciousCheck.field,
                ...formData // Optionally include all form data for context
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            setSnackbar({
                open: true,
                message: "Registration failed. Please try again.",
                severity: 'error'
            });
            return;
        }

        // Validate required fields
        if (!formData.userName || !formData.password || !formData.firstName || 
            !formData.lastName || !formData.sex || !formData.birthdate) {
            setSnackbar({
                open: true,
                message: "Please fill in all required fields",
                severity: 'error'
            });
            return;
        }
        // Validate contact number length
        if (formData.number.length !== 11) {
            setSnackbar({
                open: true,
                message: "Contact number must be exactly 11 digits",
                severity: 'error'
            });
            return;
        }

        try {
            // Clean the form data to ensure no undefined values
            const cleanFormData = {
                userName: formData.userName || null,
                password: formData.password || null,
                firstName: formData.firstName || null,
                middleName: formData.middleName || null,
                lastName: formData.lastName || null,
                suffix: formData.suffix || null,
                sex: formData.sex || null,
                birthdate: formData.birthdate || null,
                age: formData.age || null,
                placeOfBirth: formData.placeOfBirth || null,
                religion: formData.religion || null,
                email: formData.email || null,
                number: formData.number || null,
                street_text: formData.street_text || null,
                guardianName: formData.guardianName || null,
                guardianContactNo: formData.guardianContactNo || null
            };

            const response = await axios.post("/api/registerstudent", cleanFormData);
    
            setSnackbar({
                open: true,
                message: response.data.message || "Registration successful!",
                severity: 'success'
            });
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
            console.error("Registration error:", error.response?.data || error.message);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || "Registration failed. Please try again.",
                severity: 'error'
            });
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
                            <h2>Welcome to OLSHCOnnect: Your Gateway to Academic Excellence</h2>
                            <p>
                                OLSHCOnnect, the official student portal of Our Lady of the Sacred Heart College of Guimba Inc. 
                                This platform is designed to empower students by providing easy access to essential academic tools, resources, 
                                and updates. Whether you're exploring your courses, monitoring your grades, or staying updated on the latest 
                                announcements, OLSHCOnnect ensures a seamless and interactive experience.
                            </p>
                            <p>
                                If you are incoming 1st year college you can register now.
                            </p>
                            <button className="btn btn-danger btn-expanded" onClick={handleOpen} data-testid="open-modal-button">
                                REGISTER NOW!
                            </button>
                            <p>
                                Already have an account? Proceed to <a href="/login" className="text-primary">Login</a> to continue to enrollment.
                            </p>

                            {/* Modal */}
                            <Modal 
                                open={open} 
                                onClose={handleClose}
                                aria-labelledby="registration-modal-title"
                                data-testid="registration-modal"
                            >
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: "90%",
                                        maxWidth: "600px",
                                        margin: "50px auto",
                                        backgroundColor: "white",
                                        borderRadius: "10px",
                                        padding: 4,
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                        maxHeight: "90vh", // Restrict the height of the modal
                                        overflowY: "auto", // Enable scrolling
                                    }}
                                    data-testid="modal-content"
                                >
                                    {/* Close Button */}
                                    <div className="registration-details">
                                        <Button
                                            onClick={handleClose}
                                            data-testid="modal-close-button"
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
                                    </div>

                                    <Typography variant="h5" sx={{ 
                                        textAlign: "center", 
                                        marginBottom: "20px",
                                        color: '#c70202',
                                        fontWeight: 'bold'
                                    }}>
                                        Registration Form
                                    </Typography>

                                    {!isRegistered ? (    
                                        <form onSubmit={handleSubmit} data-testid="registration-form">
                                            <div className="registration-section">
                                                <Typography variant="h6" className="section-title">
                                                    Account Details
                                                </Typography>
                                                <div className="mb-3">
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={6}>
                                                            <TextField
                                                            label="Username"
                                                            fullWidth
                                                            margin="normal"
                                                            name="userName"
                                                            data-testid="input-userName"
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
                                                            data-testid="input-password"
                                                            value={formData.password}
                                                            onChange={handleInputChange}
                                                            required
                                                            />
                                                        </Grid>                                    
                                                    </Grid>
                                                </div>
                                            </div>
                                            {/* Student Information */}
                                            <div className="registration-section">
                                                <Typography variant="h6" className="section-title">
                                                    Personal Information
                                                </Typography>
                                                <div className="mb-3">
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12}>
                                                            <TextField
                                                                label="First Name"
                                                                fullWidth
                                                                margin="normal"
                                                                name="firstName"
                                                                data-testid="input-firstName"
                                                                value={formData.firstName}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <TextField
                                                                label="Middle Name"
                                                                fullWidth
                                                                margin="normal"
                                                                name="middleName"
                                                                data-testid="input-middleName"
                                                                value={formData.middleName}
                                                                onChange={handleInputChange}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <TextField
                                                                label="Last Name"
                                                                fullWidth
                                                                margin="normal"
                                                                name="lastName"
                                                                data-testid="input-lastName"
                                                                value={formData.lastName}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <TextField
                                                                label="Suffix"
                                                                fullWidth
                                                                margin="normal"
                                                                name="suffix"
                                                                data-testid="input-suffix"
                                                                value={formData.suffix}
                                                                onChange={handleInputChange}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </div>
                                            </div>
                                            {/* Sex Information */}
                                            <div className="registration-section">
                                                <Typography variant="h6" className="section-title">
                                                    Additional Information
                                                </Typography>
                                                <div className="mb-3">                                                
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12}>
                                                            <FormControl fullWidth margin="normal" required>
                                                            <h6>Sex</h6>
                                                                <Select
                                                                    name="sex"
                                                                    data-testid="input-sex"
                                                                    value={formData.sex}
                                                                    onChange={handleInputChange}
                                                                    displayEmpty
                                                                    label="Sex"
                                                                >
                                                                    <MenuItem value=""><em>Select Sex</em></MenuItem>
                                                                    <MenuItem value="Male">Male</MenuItem>
                                                                    <MenuItem value="Female">Female</MenuItem>
                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <TextField                                    
                                                                fullWidth
                                                                margin="normal"
                                                                name="birthdate"
                                                                label="Birthday"
                                                                data-testid="input-birthdate"
                                                                type="date"
                                                                value={formData.birthdate ? formData.birthdate.split('/').reverse().join('-') : ''}
                                                                onChange={handleInputChange}
                                                                required
                                                                InputLabelProps={{ shrink: true }}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <TextField
                                                                label="Age"
                                                                fullWidth
                                                                margin="normal"
                                                                name="age"
                                                                data-testid="input-age"
                                                                value={formData.age}
                                                                onChange={handleInputChange}
                                                                disabled
                                                            />
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <TextField
                                                                label="Place of Birth"
                                                                fullWidth
                                                                margin="normal"
                                                                name="placeOfBirth"
                                                                data-testid="input-placeOfBirth"
                                                                value={formData.placeOfBirth}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <TextField
                                                                label="Religion"
                                                                fullWidth
                                                                margin="normal"
                                                                name="religion"
                                                                data-testid="input-religion"
                                                                value={formData.religion}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </div>
                                            </div>

                                            <div className="registration-section">
                                                <Typography variant="h6" className="section-title">
                                                    Contact Information
                                                </Typography>
                                                <div className="mb-3">
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={6}>
                                                            <TextField
                                                                label="Email"
                                                                fullWidth
                                                                margin="normal"
                                                                name="email"
                                                                data-testid="input-email"
                                                                type="email"
                                                                value={formData.email}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <TextField
                                                                label="Contact Number"
                                                                fullWidth
                                                                margin="normal"
                                                                name="number"
                                                                data-testid="input-number"
                                                                value={formData.number}
                                                                onChange={handleInputChange}
                                                                required
                                                                error={!!contactNumberError}
                                                                helperText={contactNumberError}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </div>
                                            </div>

                                            <div className="registration-section">
                                                <Typography variant="h6" className="section-title">
                                                    Address Information
                                                </Typography>
                                                <div className="mb-3">
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} sm={6}>
                                                            <Select
                                                                fullWidth
                                                                margin="normal"
                                                                name="region"
                                                                data-testid="input-region"
                                                                value={address.region}
                                                                onChange={(e) => {
                                                                    const selectedRegion = regionData.find(r => r.region_code === e.target.value);
                                                                    setAddress({ ...address, region: e.target.value, province: '', city: '', barangay: '' });
                                                                    setAddressNames({ ...addressNames, region: selectedRegion ? selectedRegion.region_name : '', province: '', city: '', barangay: '' });
                                                                }}
                                                                displayEmpty
                                                                label="Select Region"
                                                                required
                                                            >
                                                                <MenuItem value=""><em>Select Region</em></MenuItem>
                                                                {regionData.map((region) => (
                                                                    <MenuItem key={region.region_code} value={region.region_code}>
                                                                        {region.region_name}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <Select
                                                                fullWidth
                                                                margin="normal"
                                                                name="province"
                                                                data-testid="input-province"
                                                                value={address.province}
                                                                onChange={(e) => {
                                                                    const selectedProvince = provinceData.find(p => p.province_code === e.target.value);
                                                                    setAddress({ ...address, province: e.target.value, city: '', barangay: '' });
                                                                    setAddressNames({ ...addressNames, province: selectedProvince ? selectedProvince.province_name : '', city: '', barangay: '' });
                                                                }}
                                                                displayEmpty
                                                                label="Select Province"
                                                                required
                                                            >
                                                                <MenuItem value=""><em>Select Province</em></MenuItem>
                                                                {provinceData.map((province) => (
                                                                    <MenuItem key={province.province_code} value={province.province_code}>
                                                                        {province.province_name}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <Select
                                                                fullWidth
                                                                margin="normal"
                                                                name="city"
                                                                data-testid="input-city"
                                                                value={address.city}
                                                                onChange={(e) => {
                                                                    const selectedCity = cityData.find(c => c.city_code === e.target.value);
                                                                    setAddress({ ...address, city: e.target.value, barangay: '' });
                                                                    setAddressNames({ ...addressNames, city: selectedCity ? selectedCity.city_name : '', barangay: '' });
                                                                }}
                                                                displayEmpty
                                                                label="Select City"
                                                                required
                                                            >
                                                                <MenuItem value=""><em>Select City</em></MenuItem>
                                                                {cityData.map((city) => (
                                                                    <MenuItem key={city.city_code} value={city.city_code}>
                                                                        {city.city_name}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <Select
                                                                fullWidth
                                                                margin="normal"
                                                                name="barangay"
                                                                data-testid="input-barangay"
                                                                value={address.barangay}
                                                                onChange={(e) => {
                                                                    const selectedBarangay = barangayData.find(b => b.brgy_code === e.target.value);
                                                                    setAddress({ ...address, barangay: e.target.value });
                                                                    setAddressNames({ ...addressNames, barangay: selectedBarangay ? selectedBarangay.brgy_name : '' });
                                                                }}
                                                                displayEmpty
                                                                label="Select Barangay"
                                                                required
                                                            >
                                                                <MenuItem value=""><em>Select Barangay</em></MenuItem>
                                                                {barangayData.map((barangay) => (
                                                                    <MenuItem key={barangay.brgy_code} value={barangay.brgy_code}>
                                                                        {barangay.brgy_name}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <TextField
                                                                label="Full Address (Auto-generated)"
                                                                fullWidth
                                                                margin="normal"
                                                                name="street_text"
                                                                data-testid="input-street_text"
                                                                id="street-text"
                                                                value={formData.street_text}
                                                                InputProps={{
                                                                    readOnly: true,
                                                                }}
                                                                placeholder="Select province, city, and barangay to generate address"
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </div>
                                            </div>

                                            {/* Guardian Information */}
                                            <div className="registration-section">
                                            <Typography variant="h6" className="section-title">
                                                Guardian Information
                                            </Typography>
                                                <div className="mb-3">
                                                    <TextField
                                                        label="Guardian Name"
                                                        fullWidth
                                                        margin="normal"
                                                        name="guardianName"
                                                        data-testid="input-guardianName"
                                                        value={formData.guardianName}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                    <TextField
                                                        label="Guardian Contact"
                                                        fullWidth
                                                        margin="normal"
                                                        name="guardianContactNo"
                                                        data-testid="input-guardianContactNo"
                                                        value={formData.guardianContactNo}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Privacy Policy Agreement */}
                                            <FormControlLabel
                                                control={
                                                    <Checkbox 
                                                        required 
                                                        sx={{
                                                            color: '#c70202',
                                                            '&.Mui-checked': {
                                                                color: '#c70202',
                                                            },
                                                        }}
                                                    />
                                                }
                                                label="I agree with the Privacy Policy"
                                                sx={{ mt: 2 }}
                                            />

                                            {/* Submit Button */}
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
                                            >
                                                Register
                                            </Button>
                                        </form>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '20px' }}>
                                            <h3>Registration Successful!</h3>
                                            <p>You can now proceed to login.</p>
                                            <Button variant="contained" color="primary" onClick={handleClose}>
                                                Close
                                            </Button>
                                        </div>
                                    )}
                                </Box>
                                </Modal>
                                <Snackbar
                                    open={snackbar.open}
                                    autoHideDuration={4000}
                                    onClose={handleSnackbarClose}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    >
                                    <Alert 
                                        onClose={handleSnackbarClose} 
                                        severity={snackbar.severity}
                                        variant="filled"
                                        sx={{ width: '100%' }}
                                    >
                                        {snackbar.message}
                                    </Alert>
                                </Snackbar>                            
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
                        <div className="course-item" style={{ backgroundColor: '#28a745', color: 'white' }}>
                        <img
                            src={it}
                            alt="Bachelor of Science in Information Technology"
                            
                        />
                        <h3>BS Information Technology</h3>
                        </div>

                        {/* BSHM */}
                        <div className="course-item" style={{ backgroundColor: '#ffc107', color: 'black' }}>
                        <img
                            src={hm}
                            alt="Bachelor of Science in Hospitality Management"
                        />
                        <h3>BS Hospitality Management</h3>
                        </div>

                        {/* BEED */}
                        <div className="course-item" style={{ backgroundColor: '#007bff', color: 'white' }}>
                        <img
                            src={educ}
                            alt="Bachelor of Elementary Education"
                        />
                        <h3>Bachelor of Elementary Education</h3>
                        </div>

                        {/* BSEd */}
                        <div className="course-item" style={{ backgroundColor: '#0056b3', color: 'white' }}>
                        <img
                            src={educc}
                            alt="Bachelor of Secondary Education"
                        />
                        <h3>Bachelor of Secondary Education</h3>
                        </div>

                        {/* BSCrim */}
                        <div className="course-item" style={{ backgroundColor: '#dc3545', color: 'white' }}>
                        <img
                            src={crim}
                            alt="Bachelor of Science in Criminology"
                        />
                        <h3>BS Criminology</h3>
                        </div>

                        {/* BSOAd */}
                        <div className="course-item" style={{ backgroundColor: '#1e3a8a', color: 'white' }}>
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
                    Created by BSIT-3B Von Mamaid, Dianne Paderan, Aileen Rigor, Lorence Gamboa</li>
                </ul>
            </footer>
    </>
  );
};

export default Homepage;
