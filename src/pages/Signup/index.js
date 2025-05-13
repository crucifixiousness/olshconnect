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

  const { isLogin, setIsLogin, setUser, setRole, setToken } = useContext(MyContext);

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

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('/api/loginstaff', credentials);
      const { token, user } = response.data;
  
      // Clear any existing data first
      localStorage.clear();
      
      // Set token first and wait for it to be set
      await new Promise(resolve => {
        localStorage.setItem('token', token);
        context.setToken(token); // Add setToken to your context destructuring
        resolve();
      });

      // Set remaining data
      localStorage.setItem('role', user.role);
      localStorage.setItem('program_id', user.program_id);
      localStorage.setItem('staff_id', user.staff_id);
      localStorage.setItem('user', JSON.stringify(user));

      // Update context states in order
      await new Promise(resolve => {
        setRole(user.role);
        setTimeout(() => {
          setUser(user);
          setTimeout(() => {
            setIsLogin(true);
            resolve();
          }, 100);
        }, 100);
      });

      // Navigate after all states are confirmed set
      const paths = {
        'admin': '/dashboard',
        'instructor': '/instructor-dashboard',
        'registrar': '/registrar-dashboard',
        'finance': '/finance-dashboard',
        'program head': '/programhead-dashboard'
      };

      const redirectPath = paths[user.role] || '/dashboard';
      window.location.href = redirectPath; // Using direct navigation instead of React Router

    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update the submit button in the form

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
                  <Button 
                    className="btn-blue btn-lg w-100 btn-big" 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </Button>
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
