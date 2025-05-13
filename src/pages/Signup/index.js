import logo from '../../asset/images/olshco-logo1.png';
import loginbackground from '../../asset/images/login-background.jpg';
import { MyContext } from '../../App';
import React, { useContext, useEffect, useState } from 'react';
import { FaRegUserCircle } from "react-icons/fa";
import { RiLockPasswordLine } from "react-icons/ri";
import { VscEye } from "react-icons/vsc";
import { VscEyeClosed } from "react-icons/vsc";
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [inputIndex, setInputIndex] = useState(null);
  const [isShowPass, setIsShowPass] = useState(false);
  const [credentials, setCredentials] = useState({ staff_username: '', staff_password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const { isLogin, setIsLogin, setUser, setRole } = useContext(MyContext);

  const context = useContext(MyContext);

  useEffect(() => {
      context.setIsHideComponents(true);
      window.scrollTo(0, 0);
  }, [context]);

  const focusInput = (index) => {
      setInputIndex(index);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/loginstaff', credentials);
      const { token, user } = response.data;
  
      // Store complete user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('program_id', user.program_id);
      localStorage.setItem('staff_id', user.staff_id); // Add this line
      localStorage.setItem('user', JSON.stringify(user)); // Store complete user object
  
      setUser(user);
      setRole(user.role);
      setIsLogin(true);
  
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/dashboard');
      } else if (user.role === 'instructor') {
        navigate('/instructor-dashboard');
      } else if (user.role === 'registrar') {
        navigate('/registrar-dashboard');
      } else if (user.role === 'finance') {
        navigate('/finance-dashboard');
      } else if (user.role === 'program head') {
        navigate('/programhead-dashboard');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };
  

  return (
    <>
      <img src={loginbackground} className='loginBg' alt="Login Background" />
      <section className='loginSection signupSection'>
        <div className='row'>
          <div className='col-md-8 d-flex align-items-center flex-column justify-content-center part1'>
            <h1>
              WELCOME TO <span className='text-sky'>OLSHCOnnect</span>, MAINLY FOR 
              <span className='text-sky'> ADMIN</span> AND <span className='text-sky'>STAFFS</span>
            </h1>
            <p>
              In the OLSHCOnnect's Portal, the Admin manages user access and system operations to ensure smooth functionality. 
              The Registrar oversees enrollment by reviewing applications and documents, finalizing enrollment once Finance confirms payment. 
              Finance handles tuition processing, updating payment status so the Registrar can complete official registration. 
              Instructors also have access to input calculated student grades, allowing students to view their academic progress. 
              This coordinated system ensures each role efficiently manages its tasks, creating a seamless enrollment and academic tracking process.
            </p>
          </div>

          <div className='col-md-4 pr-0'>
            <div className='loginBox'>
              <div className='logo text-center'>
                <img src={logo} width="60px" className='pb-1' alt="Logo" />
                <h5 className='loginHeader'>Staff Login</h5>
              </div>

              <div className='loginWrap card border'>
                <form onSubmit={handleLogin}>
                  {errorMessage && (
                    <div className='alert alert-danger'>
                      {errorMessage}
                    </div>
                  )}
                  <div className={`form-group position-relative ${inputIndex === 0 && 'focus'}`}>
                    <span className='icon'><FaRegUserCircle /></span>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Username'
                      name='staff_username'
                      value={credentials.staff_username}
                      onChange={handleInputChange}
                      onFocus={() => focusInput(0)}
                      onBlur={() => setInputIndex(null)}
                      autoFocus
                    />
                  </div>

                  <div className={`form-group position-relative ${inputIndex === 1 && 'focus'}`}>
                    <span className='icon'><RiLockPasswordLine /></span>
                    <input
                      type={isShowPass ? 'text' : 'password'}
                      className='form-control'
                      placeholder='Password'
                      name='staff_password'
                      value={credentials.staff_password}
                      onChange={handleInputChange}
                      onFocus={() => focusInput(1)}
                      onBlur={() => setInputIndex(null)}
                    />
                    <span className='showPass' onClick={() => setIsShowPass(!isShowPass)}>
                      {isShowPass ? <VscEye /> : <VscEyeClosed />}
                    </span>
                  </div>

                  <div className='form-group'>
                    <Button className="btn-blue btn-lg w-100 btn-big" type="submit">Sign in</Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
};

export default Signup;
