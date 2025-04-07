import logo from '../../asset/images/olshco-logo1.png';
import loginbackground from '../../asset/images/login-background.jpg';
import { MyContext } from '../../App';
import React, { useContext, useEffect, useState } from 'react';
import { FaRegUserCircle } from "react-icons/fa";
import { RiLockPasswordLine } from "react-icons/ri";
import { VscEye } from "react-icons/vsc";
import { VscEyeClosed } from "react-icons/vsc";
import Button from '@mui/material/Button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [inputIndex, setInputIndex] = useState(null);
  const [isShowPass, setIsShowPass] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const { setUser, setIsLogin, setRole } = useContext(MyContext);

  useEffect(() => {
      context.setIsHideComponents(true);
  }, [context]);
  
  const focusInput = (index) => {
      setInputIndex(index);
  }

    const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://olshconnect-server.vercel.app/api/auth/student/login', credentials);
            console.log('Login response:', response);
    
            const { token, user } = response.data;
    
            if (!user.role) {
                console.error('Role is undefined in the API response.');
                setErrorMessage('Unexpected error occurred. Please contact support.');
                return;
            }
    
            localStorage.setItem('token', token);
            localStorage.setItem('role', user.role);
            localStorage.setItem('user', JSON.stringify(user));
    
            setUser(user);
            setRole(user.role);
            setIsLogin(true);
    
            console.log('App State Update:', {
                token,
                role: user.role,
                user,
                isHideComponents: context.isHideComponents,
            });
    
            navigate(user.role === 'student' ? '/student-dashboard' : '/dashboard');
        } catch (error) {
            console.error('Login Error:', error.response?.data);
            setErrorMessage(error.response?.data?.error || 'Login failed. Please try again.');
        }
    };
    

  return (
    <>
        <img src={loginbackground} alt="samp" className='loginBg' />
        <section className='loginSection'>
            <div className='loginBox'>
                <div className='loginWrap mt-5 card border'>
                    {/* Moved logo and header inside the loginWrap */}
                    <div className='logo text-center'>
                      <img src={logo} alt="samp" width="60px" className='pb-1' />
                      <h5 className='loginHeader'>Login to OLSHCOnnect</h5>
                    </div>

                    <form onSubmit={handleLogin}>
                        {errorMessage && (
                            <div className='alert alert-danger'>
                                {errorMessage}
                            </div>
                        )}                        
                        <div className={`form-group position-relative mt-5 ${inputIndex === 0 && 'focus'}`}>
                            <span className='icon'><FaRegUserCircle /></span>
                            <input type='text' className='form-control' placeholder='Username' onFocus={() => focusInput(0)} onBlur={() => setInputIndex(null)} name='username' value={credentials.username} onChange={handleInputChange} autoFocus />
                        </div>

                        <div className={`form-group position-relative ${inputIndex === 1 && 'focus'}`}>
                            <span className='icon'><RiLockPasswordLine /></span>
                            <input type={`${isShowPass === true ? 'text' : 'password'}`} className='form-control' placeholder='Password' onFocus={() => focusInput(1)} onBlur={() => setInputIndex(null)} name='password' value={credentials.password} onChange={handleInputChange} />

                            <span className='showPass' onClick={() => setIsShowPass(!isShowPass)}>
                                {isShowPass === true ? <VscEye /> : <VscEyeClosed />}
                            </span>
                        </div>

                        <div className='form-group'>
                              <Button className="btn-blue btn-lg w-100 btn-big" type="submit">Sign in</Button>
                        </div>

                        <div className='form-group text-center mb-0'>                        
                            <Link to={'/forgot-password'} className='link'>FORGOT PASSWORD</Link>
                        </div>
                    </form>
                </div>

                <div className='loginWrap mt-3 card border footer p-3'>
                    <span className='text-center'>
                        Don't have an account?
                        <Link to={'/homepage'} className='link color'>Register</Link>
                    </span>
                </div>
            </div>
        </section>
    </>
  );
}

export default Login;
