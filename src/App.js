import './App.css';
import './responsive.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import "bootstrap/dist/css/bootstrap.min.css";
import { createContext, useEffect, useState, useContext } from 'react';
import Login from './pages/Login';
import FakeLogin from './pages/FakeLogin';
import Signup from './pages/Signup';
import StudentList from './pages/StudentList';
import Homepage from './pages/Homepage/Homepage';
import Homeheader from './components/Homeheader';
import Staff from './pages/Staff';
import StudentSidebar from './components/Studentsidebar';
import StuDashboard from './pages/Studashboard/studentdash';
import StudentProfile from './pages/Studentprofile';
import AcademicRecords from './pages/Academicrecords';
import DocumentRequests from './pages/Documentrequest';
import RequestDocument from './pages/Requestdocument';
import RegistrarDashboard from './pages/Registrardashboard';
import RegistrarSidebar from './components/Regsidebar';
import FinanceDashboard from './pages/Financedashboard';
import FinanceSidebar from './components/Finsidebar';
import Enrollment from './pages/Enrollment';
import StudentCourses from './pages/StudentCourse';
import NotFound from './pages/NotFound';
import ProgramHeadSidebar from './components/Phsidebar';
import ProgramHeadDashboard from './pages/Phdashboard';
import AssignCourses from './pages/Phcourses';
import StudentBalance from './components/Finstudentbalance';
import InstructorSidebar from './components/Inssidebar';
import InstructorDashboard from './pages/Instructordashboard';
import InstructorSchedule from './pages/Insschedule';
import ClassManagement from './pages/Insclassmanage';
import InstructorGrades from './pages/Insgrading';
import RegistrarEnrollment from './pages/Regenrollment';
import StudentPayment from './pages/Studentpayment';
import TuitionManagement from './pages/Tuitionfeemanage';
import PaymentVerification from './pages/Paymentverification';
import CounterPayment from './pages/CounterPayment';
import PaymentHistory from './pages/PaymentHistory';
import ProgramStudentList from './pages/ProgramStudentList';
import ProgramManagement from './pages/ProgramManagement';

// Add CSS for loading spinner animation
const loadingStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = loadingStyles;
  document.head.appendChild(style);
}

const MyContext = createContext();

// Custom hook for authentication
const useAuth = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useAuth must be used within a MyContext.Provider');
  }
  return context;
};

function App() {
  // eslint-disable-next-line
  const [isToggleSidebar, setIsToggleSidebar] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isHideComponents, setIsHideComponents] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isOpenNav, setIsOpenNav] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Add loading state

  // Add CSS animation for spinner
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
   
  useEffect(() => {
    // Restore authentication state from localStorage
    const restoreAuthState = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');
        const storedUser = localStorage.getItem('user');
        const storedIsLogin = localStorage.getItem('isLogin');

        if (storedToken && storedRole && storedUser && storedIsLogin === 'true') {
          setToken(storedToken);
          setRole(storedRole);
          setUser(JSON.parse(storedUser));
          setIsLogin(true);
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
        // Clear invalid data
        localStorage.clear();
      } finally {
        setIsAuthLoading(false); // Mark loading as complete
      }
    };

    restoreAuthState();
  }, []); // Only run once on mount

  useEffect(() => {
    document.title = "OLSHCOnnect";
  }, []);

  const openNav = () => {
    setIsOpenNav(true);
  };

  const logout = () => {
    console.log('🔒 [LOGOUT] Starting logout process...');
    
    // Set loading state to prevent route conflicts
    setIsAuthLoading(true);
    
    // Clear all authentication data
    localStorage.clear();
    setToken(null);
    setRole(null);
    setUser(null);
    setIsLogin(false);
    
    console.log('🔒 [LOGOUT] Authentication state cleared');
    
    // Use a small delay to ensure state updates complete before redirect
    setTimeout(() => {
      console.log('🔒 [LOGOUT] Redirecting to homepage...');
      // Force full page reload to clear any React Router state issues
      window.location.href = '/homepage';
    }, 100);
  };

  const values = {
    isToggleSidebar,
    setIsToggleSidebar,
    isLogin,
    setIsLogin,
    isHideComponents,
    setIsHideComponents,
    windowWidth,
    openNav,
    isOpenNav,
    setIsOpenNav,
    user,
    setUser,  // To set user data
    token,     // To store the token
    setToken,
    role,
    setRole,
    isAuthLoading, // Add loading state to context
    useAuth, // Add the hook to context
    logout, // Add logout function
  };

  useEffect(() => {
    console.log('App State Update:', { token, role, user, isAuthLoading });
  }, [token, role, user, isAuthLoading]);

  // Prevent backward navigation for authenticated users using React Router history
  useEffect(() => {
    if (token && role) {
      console.log('🔒 [BACK BUTTON] Setting up history listener for role:', role);
      
      // Determine the appropriate dashboard path for this role
      let dashboardPath = '/homepage';
      if (role === 'student') {
        dashboardPath = '/student-dashboard';
      } else if (role === 'admin') {
        dashboardPath = '/dashboard';
      } else if (role === 'registrar') {
        dashboardPath = '/registrar-dashboard';
      } else if (role === 'finance') {
        dashboardPath = '/finance-dashboard';
      } else if (role === 'program head') {
        dashboardPath = '/programhead-dashboard';
      } else if (role === 'instructor') {
        dashboardPath = '/instructor-dashboard';
      }
      
      console.log('🔒 [BACK BUTTON] Dashboard path set to:', dashboardPath);
      console.log('🔒 [BACK BUTTON] Current URL:', window.location.pathname);
      
      // Set initial history state to prevent going back further
      window.history.pushState({ role, dashboardPath }, '', dashboardPath);
      console.log('🔒 [BACK BUTTON] Initial history state set');
      
      const handlePopState = (event) => {
        console.log('🔒 [BACK BUTTON] Back navigation detected!');
        console.log('🔒 [BACK BUTTON] Current URL:', window.location.pathname);
        console.log('🔒 [BACK BUTTON] Target dashboard:', dashboardPath);
        
        // Immediately redirect back to the dashboard
        window.location.href = dashboardPath;
      };
      
      // Listen for browser back/forward button clicks
      window.addEventListener('popstate', handlePopState);
      console.log('🔒 [BACK BUTTON] Added popstate listener');
      
      // Also prevent going back with keyboard shortcuts
      const handleKeyDown = (event) => {
        if ((event.altKey && event.key === 'ArrowLeft') || 
            (event.metaKey && event.key === '[') ||
            (event.ctrlKey && event.key === '[')) {
          console.log('🔒 [BACK BUTTON] Blocked keyboard shortcut:', event.key);
          event.preventDefault();
          event.stopPropagation();
          
          // Redirect to dashboard
          window.location.href = dashboardPath;
          return false;
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      console.log('🔒 [BACK BUTTON] Added keyboard listener');
      
      return () => {
        console.log('🔒 [BACK BUTTON] Cleaning up event listeners');
        window.removeEventListener('popstate', handlePopState);
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      console.log('🔒 [BACK BUTTON] User not authenticated or no role, skipping back button prevention');
      console.log('🔒 [BACK BUTTON] Token:', !!token, 'Role:', role);
    }
  }, [token, role]);

  // Add route transition guard to prevent navigation issues during logout
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthLoading) {
        console.log('🔒 [ROUTE GUARD] Preventing navigation during auth loading');
        return 'Please wait for authentication to complete...';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthLoading]);

  // Add cleanup effect to reset loading state when navigating to login pages
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (['/login', '/stafflogin', '/logIn'].includes(currentPath)) {
      // Reset loading state when on login pages
      if (isAuthLoading) {
        console.log('🔒 [CLEANUP] Resetting loading state on login page');
        setIsAuthLoading(false);
      }
    }
  }, [window.location.pathname, isAuthLoading]);

  const ProtectedRoute = ({ element, requiredRole, redirectTo }) => {
    // Show loading while authentication state is being restored
    if (isAuthLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ fontSize: '24px', color: '#666' }}>Loading...</div>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #c70202', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      );
    }

    // Check if user is authenticated
    if (!token) {
      console.log('🔒 [PROTECTED ROUTE] No token, redirecting to:', redirectTo);
      return <Navigate to={redirectTo} replace />;
    }

    // Check if user has required role
    if (requiredRole) {
      console.log('🔒 [PROTECTED ROUTE] Checking role access:');
      console.log('  - User role:', role);
      console.log('  - Required role:', requiredRole);
      console.log('  - Required role type:', typeof requiredRole);
      console.log('  - Is array?', Array.isArray(requiredRole));
      
      let hasAccess = false;
      
      if (Array.isArray(requiredRole)) {
        hasAccess = requiredRole.includes(role);
        console.log('  - Array check result:', hasAccess);
      } else {
        hasAccess = requiredRole === role;
        console.log('  - String check result:', hasAccess);
      }
      
      if (!hasAccess) {
        console.log('🔒 [PROTECTED ROUTE] Access denied, redirecting to:', redirectTo);
        return <Navigate to={redirectTo} replace />;
      }
      
      console.log('🔒 [PROTECTED ROUTE] Access granted!');
    }

    return element;
  };

  return (
    <BrowserRouter>
      <MyContext.Provider value={values}>
        <Routes>
          <Route
            path="/homepage"
            element={<Homeheader />}
          />
          <Route
            path="*"
            element={isHideComponents !== true && <Header />}
          />
        </Routes>

        <div className='main d-flex'>
          {!["/stafflogin", "/login"].includes(window.location.pathname) && isHideComponents !== true && (
            <>
              <div className={`sidebarOverlay d-none ${isOpenNav === true && 'show'}`} onClick={() => setIsOpenNav(false)}></div>
              <div className={`sidebarWrapper ${isToggleSidebar === true ? 'toggle' : ''} ${isOpenNav === true ? 'open' : ''}`}>
              {role === 'student' ? (
                  <StudentSidebar />
                ) : role === 'registrar' ? (
                  <RegistrarSidebar />
                ) : role === 'finance' ? (
                  <FinanceSidebar />
                ) : role === 'program head' ? (
                  <ProgramHeadSidebar />
                ) : role === 'instructor' ? (
                  <InstructorSidebar />
                ) : role === 'admin' ? (
                  <Sidebar />
                ) : (
                  <Sidebar />
                )}
              </div>
            </>
          )}

          <div className={`content ${isHideComponents === true && 'full'} ${isToggleSidebar === true ? 'toggle' : ''}`} onClick={() => { if (isOpenNav) { setIsOpenNav(false); } }}>
            <Routes>
              <Route path="/notfound" element={<NotFound />} />
              <Route path="/" element={<Navigate to="/homepage" />} />
              <Route path="/homepage" exact={true} element={<Homepage />} />
              <Route path="/dashboard" exact={true} element={<ProtectedRoute element={<Dashboard />} requiredRole="admin" redirectTo="/stafflogin" />} />
        <Route path="/program-management" exact={true} element={<ProtectedRoute element={<ProgramManagement />} requiredRole="admin" redirectTo="/stafflogin" />} />
              <Route path="/login" exact={true} element={
                isAuthLoading ? (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    flexDirection: 'column',
                    gap: '20px'
                  }}>
                    <div style={{ fontSize: '24px', color: '#666' }}>Loading...</div>
                    <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #c70202', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  </div>
                ) : token && role === 'student' ? (
                  <Navigate to="/student-dashboard" replace />
                ) : (
                  <Login />
                )
              } />
              <Route path="/logIn" exact={true} element={<FakeLogin />} />
              <Route path="/stafflogin" exact={true} element={
                isAuthLoading ? (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    flexDirection: 'column',
                    gap: '20px'
                  }}>
                    <div style={{ fontSize: '24px', color: '#666' }}>Loading...</div>
                    <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #c70202', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  </div>
                ) : token && role && role !== 'student' ? (
                  (() => {
                    // Redirect staff to their specific dashboard based on role
                    if (role === 'admin') {
                      return <Navigate to="/dashboard" replace />;
                    } else if (role === 'registrar') {
                      return <Navigate to="/registrar-dashboard" replace />;
                    } else if (role === 'finance') {
                      return <Navigate to="/finance-dashboard" replace />;
                    } else if (role === 'program head') {
                      return <Navigate to="/programhead-dashboard" replace />;
                    } else if (role === 'instructor') {
                      return <Navigate to="/instructor-dashboard" replace />;
                    } else {
                      // Fallback to homepage for unknown roles
                      return <Navigate to="/homepage" replace />;
                    }
                  })()
                ) : (
                  <Signup />
                )
              } />
              <Route path="/studentlist" exact={true} element={<ProtectedRoute element={<StudentList />} requiredRole={['registrar', 'admin', 'finance', 'instructor']} redirectTo="/stafflogin" />} />
              <Route path="/staffs" exact={true} element={<ProtectedRoute element={<Staff />} requiredRole={['registrar', 'admin', 'finance', 'instructor', 'program head']} redirectTo="/stafflogin" />} />
              <Route path="/document-request" exact={true} element={<ProtectedRoute element={<DocumentRequests />} requiredRole={['registrar', 'admin']} redirectTo="/stafflogin" />} />
              <Route path="/student-dashboard" exact={true} element={<ProtectedRoute element={<StuDashboard />} requiredRole="student" redirectTo="/login" />} />
              <Route path="/student-profile" exact={true} element={<ProtectedRoute element={<StudentProfile />} requiredRole="student" redirectTo="/login" />} />
              <Route path="/student-courses" exact={true} element={<ProtectedRoute element={<StudentCourses/>} requiredRole="student" redirectTo="/login" />} />
              <Route path="/student-payment" exact={true} element={<ProtectedRoute element={<StudentPayment/>} requiredRole="student" redirectTo="/login" />} />
              <Route path="/academic-records" exact={true} element={<ProtectedRoute element={<AcademicRecords />} requiredRole="student" redirectTo="/login" />} />
              <Route path="/request-document" exact={true} element={<ProtectedRoute element={<RequestDocument />} requiredRole="student" redirectTo="/login" />} />
              <Route path="/registrar-dashboard" exact={true} element={<ProtectedRoute element={<RegistrarDashboard />} requiredRole="registrar" redirectTo="/stafflogin" />} />
              <Route path="/registrar-enrollment" exact={true} element={<ProtectedRoute element={<Enrollment />} requiredRole="registrar" redirectTo="/stafflogin" />} />
              <Route path="/registrar-enrollmentt" exact={true} element={<ProtectedRoute element={<RegistrarEnrollment />} requiredRole="registrar" redirectTo="/stafflogin" />} />
              <Route path="/finance-dashboard" exact={true} element={<ProtectedRoute element={<FinanceDashboard />} requiredRole="finance" redirectTo="/stafflogin" />} />
              <Route path="/student-balance" exact={true} element={<ProtectedRoute element={<StudentBalance />} requiredRole="finance" redirectTo="/stafflogin" />} />
              <Route path="/counter-payment" exact={true} element={<ProtectedRoute element={<CounterPayment />} requiredRole="finance" redirectTo="/stafflogin" />} />
              <Route path="/payment-history" exact={true} element={<ProtectedRoute element={<PaymentHistory />} requiredRole="finance" redirectTo="/stafflogin" />} />
              <Route path="/tuition-management" exact={true} element={<ProtectedRoute element={<TuitionManagement />} requiredRole="finance" redirectTo="/stafflogin" />} />
              <Route path="/payment-verification" exact={true} element={<ProtectedRoute element={<PaymentVerification />} requiredRole="finance" redirectTo="/stafflogin" />} />
              <Route path="/programhead-dashboard" exact={true} element={<ProtectedRoute element={<ProgramHeadDashboard />} requiredRole="program head" redirectTo="/stafflogin" />} />
              <Route path="/program-studentlist" exact={true} element={<ProtectedRoute element={<ProgramStudentList />} requiredRole="program head" redirectTo="/stafflogin" />} />
              <Route path="/course-assignments" exact={true} element={<ProtectedRoute element={<AssignCourses />} requiredRole="program head" redirectTo="/stafflogin" />} />
              <Route path="/instructor-dashboard" exact={true} element={<ProtectedRoute element={<InstructorDashboard />} requiredRole="instructor" redirectTo="/stafflogin" />} />
              <Route path="/instructor-schedule" exact={true} element={<ProtectedRoute element={<InstructorSchedule />} requiredRole="instructor" redirectTo="/stafflogin" />} />
              <Route path="/instructor-classes" exact={true} element={<ProtectedRoute element={<ClassManagement />} requiredRole="instructor" redirectTo="/stafflogin" />} />
              <Route path="/instructor-classes/grades" exact={true} element={<ProtectedRoute element={<InstructorGrades />} requiredRole="instructor" redirectTo="/stafflogin" />} />
              {/* Catch-all route for unmatched paths - should be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </MyContext.Provider>
    </BrowserRouter>
  );
}

export default App;
export { MyContext };
