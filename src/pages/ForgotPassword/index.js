import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MyContext } from '../../App';
import { useContext, useEffect } from 'react';
import olshcoLogo from '../../asset/images/olshco-logo1.png';
import loginbackground from '../../asset/images/login-background.jpg';
import { FaRegUserCircle, FaRegEnvelope, FaPhone } from "react-icons/fa";
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    username: '',
    contactNumber: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [studentId, setStudentId] = useState(null);
  const [studentName, setStudentName] = useState('');
  const context = useContext(MyContext);

  useEffect(() => {
    context.setIsHideComponents(true);
  }, [context]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format contact number (ensure it starts with 09 and is 11 digits)
    if (name === 'contactNumber') {
      let formattedValue = value.replace(/[^0-9]/g, '');
      if (formattedValue.length > 11) {
        formattedValue = formattedValue.slice(0, 11);
      }
      if (formattedValue.length === 1 && formattedValue !== '0') {
        formattedValue = '';
      }
      if (formattedValue.length === 2 && formattedValue !== '09') {
        formattedValue = '09';
      }
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    // Validate inputs
    if (!formData.username || !formData.contactNumber || !formData.email) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (formData.contactNumber.length !== 11) {
      setError('Contact number must be exactly 11 digits');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/verify-forgot-password', formData);
      
      if (response.data && response.data.success) {
        setMessage(response.data.message || 'Account verified successfully');
        setIsVerified(true);
        setStudentId(response.data.studentId);
        setStudentName(response.data.studentName || 'Student');
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Verification error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to verify account. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Please fill in both password fields');
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/reset-password', {
        studentId: studentId,
        newPassword: passwordData.newPassword
      });
      
      if (response.data && response.data.success) {
        setMessage(response.data.message || 'Password reset successfully');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to reset password. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <img src={loginbackground} alt="background" className='loginBg' />
      <section className='loginSection'>
        <div className='loginBox'>
          <div className='loginWrap mt-5 card border'>
            <div className='logo text-center'>
              <img src={olshcoLogo} alt="OLSHCO Logo" width="60px" className='pb-1' />
              <h5 className='loginHeader'>Reset Your Password</h5>
              <p style={{ color: '#6c757d', fontSize: '14px', marginTop: '10px' }}>
                {!isVerified 
                  ? "Enter your account details to verify your identity"
                  : `Welcome back, ${studentName}! Set your new password`
                }
              </p>
            </div>

            {!isVerified ? (
              <form onSubmit={handleVerify}>
                {error && (
                  <div className='alert alert-danger'>
                    {error}
                  </div>
                )}
                
                <div className='form-group position-relative mt-4'>
                  <span className='icon'><FaRegUserCircle /></span>
                  <input 
                    type='text' 
                    className='form-control' 
                    placeholder='Username' 
                    name='username'
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    autoFocus
                  />
                </div>

                <div className='form-group position-relative mt-3'>
                  <span className='icon'><FaPhone /></span>
                  <input 
                    type='tel' 
                    className='form-control' 
                    placeholder='Contact Number (09xxxxxxxxx)' 
                    name='contactNumber'
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className='form-group position-relative mt-3'>
                  <span className='icon'><FaRegEnvelope /></span>
                  <input 
                    type='email' 
                    className='form-control' 
                    placeholder='Email Address' 
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className='form-group mt-4'>
                  <Button 
                    className="btn-blue btn-lg w-100 btn-big" 
                    type="submit" 
                    disabled={isLoading}
                    sx={{ 
                      display: 'flex', 
                      gap: '10px',
                      alignItems: 'center',
                      justifyContent: 'center' 
                    }}
                  >
                    {isLoading && <CircularProgress size={20} color="inherit" />}
                    {isLoading ? 'Verifying...' : 'Verify Account'}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                {error && (
                  <div className='alert alert-danger'>
                    {error}
                  </div>
                )}
                
                {message && (
                  <div className='alert alert-success'>
                    {message}
                  </div>
                )}

                 <div className='form-group position-relative mt-4'>
                   <span className='icon'><FaRegUserCircle /></span>
                   <input 
                     type='password' 
                     className='form-control' 
                     placeholder='New Password' 
                     name='newPassword'
                     value={passwordData.newPassword}
                     onChange={handlePasswordChange}
                     required
                     autoFocus
                   />
                 </div>

                 <div className='form-group position-relative mt-3'>
                   <span className='icon'><FaRegUserCircle /></span>
                   <input 
                     type='password' 
                     className='form-control' 
                     placeholder='Confirm New Password' 
                     name='confirmPassword'
                     value={passwordData.confirmPassword}
                     onChange={handlePasswordChange}
                     required
                   />
                 </div>

                <div className='form-group mt-4'>
                  <Button 
                    className="btn-blue btn-lg w-100 btn-big" 
                    type="submit" 
                    disabled={isLoading}
                    sx={{ 
                      display: 'flex', 
                      gap: '10px',
                      alignItems: 'center',
                      justifyContent: 'center' 
                    }}
                  >
                    {isLoading && <CircularProgress size={20} color="inherit" />}
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </div>
              </form>
            )}

            <div className='form-group text-center mt-4'>
              <Link to={'/login'} className='link'>Back to Login</Link>
            </div>
          </div>

          <div className='loginWrap mt-3 card border footer p-3'>
            <span className='text-center'>
              Remember your password?
              <Link to={'/login'} className='link'> Sign In</Link>
            </span>
          </div>
        </div>
      </section>
    </>
  );
};

export default ForgotPassword;
