import logo from '../../asset/images/olshco-logo1.png';
import loginbackground from '../../asset/images/login-background.jpg';
import { MyContext } from '../../App';
import React, { useContext, useEffect, useState } from 'react';
import { FaRegUserCircle } from "react-icons/fa";
import { RiLockPasswordLine } from "react-icons/ri";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import Button from '@mui/material/Button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';

const Login = () => {
  const [inputIndex, setInputIndex] = useState(null);
  const [isShowPass, setIsShowPass] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const context = useContext(MyContext);
  const navigate = useNavigate();
  const { isLogin, setIsLogin, setUser, setRole, setToken } = context;

  useEffect(() => {
    context.setIsHideComponents(true);
  }, [context]);

  useEffect(() => {
    if (isLogin) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const redirectPath = userData.enrollment_status === 'Officially Enrolled'
        ? '/student-dashboard'
        : '/student-profile';
      window.location.href = redirectPath;
    }
  }, [isLogin]);

  const focusInput = (index) => setInputIndex(index);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const isSuspiciousInput = (text) => {
    const suspiciousPatterns = [
      /('|--|;|=|%27|%3D)/i,
      /(\bOR\b|\bAND\b).*=.*/i,
      /<script.*?>.*?<\/script>/i,
      /UNION\s+SELECT/i,
      /sleep\(/i
    ];
    return suspiciousPatterns.some((pattern) => pattern.test(text));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { username, password } = credentials;

    if (isSuspiciousInput(username) || isSuspiciousInput(password)) {
      console.warn(`⚠️ Suspicious Login Attempt: ${username}:${password}`);
      navigate('/log1n');
      return;
    }

    try {
      console.log(`Login Attempted (Username / Password): ${username}:${password}`);
      const response = await axios.post('/api/loginstudent', credentials);
      const { token, user } = response.data;

      localStorage.clear();
      localStorage.setItem('isLogin', 'true');
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('student_id', user.student_id);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setRole(user.role);
      setUser(user);
      setIsLogin(true);

    } catch (error) {
      let errorMsg = 'Login failed. Please try again.';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <img src={loginbackground} alt="login background" className='loginBg' />
      <section className='loginSection'>
        <div className='loginBox'>
          <div className='loginWrap mt-5 card border'>
            <div className='logo text-center'>
              <img src={logo} alt="logo" width="60px" className='pb-1' />
              <h5 className='loginHeader'>Login to OLSHCOnnect</h5>
            </div>

            <form onSubmit={handleLogin}>
              {errorMessage && <div className='alert alert-danger'>{errorMessage}</div>}

              <div className={`form-group position-relative mt-5 ${inputIndex === 0 ? 'focus' : ''}`}>
                <span className='icon'><FaRegUserCircle /></span>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Username'
                  name='username'
                  value={credentials.username}
                  onChange={handleInputChange}
                  onFocus={() => focusInput(0)}
                  onBlur={() => setInputIndex(null)}
                  autoFocus
                />
              </div>

              <div className={`form-group position-relative ${inputIndex === 1 ? 'focus' : ''}`}>
                <span className='icon'><RiLockPasswordLine /></span>
                <input
                  type={isShowPass ? 'text' : 'password'}
                  className='form-control'
                  placeholder='Password'
                  name='password'
                  value={credentials.password}
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
                  sx={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}
                >
                  {isLoading && <CircularProgress size={20} color="inherit" />}
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>

              <div className='form-group text-center mb-0'>
                <Link to={'/forgot-password'} className='link'>FORGOT PASSWORD</Link>
              </div>
            </form>
          </div>

          <div className='loginWrap mt-3 card border footer p-3'>
            <span className='text-center'>
              Don't have an account? <Link to={'/homepage'} className='link color'>Register</Link>
            </span>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
