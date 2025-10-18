import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const InitialAdminCreation = () => {
  const [formData, setFormData] = useState({
    staff_username: '',
    staff_password: '',
    confirm_password: '',
    full_name: '',
    role: 'admin'
  });
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingAvailability, setCheckingAvailability] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);
  
  const navigate = useNavigate();

  // Check if initial admin creation is available
  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      console.log('🔍 Frontend: Checking availability...');
      console.log('🌐 Frontend: Making request to:', '/api/initial-admin-check');
      
      const response = await fetch('/api/initial-admin-check');
      
      console.log('📡 Frontend: Response status:', response.status);
      console.log('📡 Frontend: Response headers:', response.headers);
      
      // Check if response is HTML (error page)
      const contentType = response.headers.get('content-type');
      console.log('📡 Frontend: Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.log('📄 Frontend: Non-JSON response:', textResponse.substring(0, 200) + '...');
        setError(`API returned non-JSON response. Status: ${response.status}. Content-Type: ${contentType}`);
        return;
      }
      
      const data = await response.json();
      console.log('📊 Frontend: API Response:', data);
      
      if (data.success) {
        setIsAvailable(data.isAvailable);
        setDebugInfo(data.debug); // Store debug info
        
        if (!data.isAvailable) {
          setError(`Admin accounts already exist. Initial admin creation is not available. (Count: ${data.adminCount})`);
        }
      } else {
        setError('Error checking initial admin availability');
      }
    } catch (error) {
      console.error('❌ Frontend: Network error:', error);
      setError(`Network error checking availability: ${error.message}`);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.staff_username || !formData.staff_password || !formData.full_name) {
      setError('All fields are required');
      return false;
    }
    
    if (formData.staff_password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.staff_password !== formData.confirm_password) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/initial-admin-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_username: formData.staff_username,
          staff_password: formData.staff_password,
          full_name: formData.full_name,
          role: formData.role
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Initial admin account created successfully!');
        
        // Store token and redirect to admin dashboard
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.admin));
          
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 2000);
        }
      } else {
        setError(data.message || 'Error creating initial admin account');
      }
    } catch (error) {
      setError('Network error creating initial admin account');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAvailability) {
    return (
      <div className="initial-admin-container">
        <div className="initial-admin-card">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Checking initial admin availability...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="initial-admin-container">
        <div className="initial-admin-card">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Initial Admin Creation Not Available</h2>
            <p>Admin accounts already exist in the system.</p>
            <p>Please contact an existing administrator for access.</p>
            
            {/* Debug Information */}
            {debugInfo && (
              <div className="debug-section">
                <h3>🔍 Debug Information:</h3>
                <div className="debug-content">
                  <p><strong>Admin Count:</strong> {debugInfo.queryResult?.[0]?.admin_count || 'N/A'}</p>
                  <p><strong>All Admins in Database:</strong></p>
                  <pre>{JSON.stringify(debugInfo.allAdmins, null, 2)}</pre>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="initial-admin-container">
      <div className="initial-admin-card">
        <div className="initial-header">
          <div className="initial-icon">🚀</div>
          <h1>Initial Admin Setup</h1>
          <p className="initial-subtitle">
            Welcome to OLSHCO Portal! Create your first admin account to get started.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">❌</span>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="initial-form">
          <div className="form-group">
            <label htmlFor="staff_username">Username *</label>
            <input
              type="text"
              id="staff_username"
              name="staff_username"
              value={formData.staff_username}
              onChange={handleInputChange}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="full_name">Full Name *</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="staff_password">Password *</label>
            <input
              type="password"
              id="staff_password"
              name="staff_password"
              value={formData.staff_password}
              onChange={handleInputChange}
              placeholder="Enter password (min 6 characters)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password">Confirm Password *</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleInputChange}
              placeholder="Confirm password"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-large"
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Creating Admin Account...
                </>
              ) : (
                'Create Initial Admin Account'
              )}
            </button>
          </div>
        </form>

        <div className="initial-footer">
          <p className="setup-notice">
            <strong>Setup Notice:</strong> This form is only available when no admin accounts exist. 
            Once created, this account will have full administrative access to the OLSHCO Portal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InitialAdminCreation;
