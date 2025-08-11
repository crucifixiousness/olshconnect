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
  }, []);

  useEffect(() => {
    document.title = "OLSHCOnnect";
  }, []);

  const openNav = () => {
    setIsOpenNav(true);
  };

  const logout = () => {
    // Clear all authentication data
    localStorage.clear();
    setToken(null);
    setRole(null);
    setUser(null);
    setIsLogin(false);
    
    // Redirect to homepage
    window.location.href = '/homepage';
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
    setUser,
    token,
    setToken,
    role,
    setRole,
    useAuth,
    logout,
  };

  const ProtectedRoute = ({ element, requiredRole, redirectTo }) => {
    // Check if user is authenticated
    if (!token) {
      return <Navigate to={redirectTo} replace />;
    }

    // Check if user has required role
    if (requiredRole) {
      let hasAccess = false;
      
      if (Array.isArray(requiredRole)) {
        hasAccess = requiredRole.includes(role);
      } else {
        hasAccess = requiredRole === role;
      }
      
      if (!hasAccess) {
        return <Navigate to={redirectTo} replace />;
      }
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
              {token && role === 'student' ? (
                  <StudentSidebar />
                ) : token && role === 'registrar' ? (
                  <RegistrarSidebar />
                ) : token && role === 'finance' ? (
                  <FinanceSidebar />
                ) : token && role === 'program head' ? (
                  <ProgramHeadSidebar />
                ) : token && role === 'instructor' ? (
                  <InstructorSidebar />
                ) : token && role === 'admin' ? (
                  <Sidebar />
                ) : token ? (
                  // Fallback for authenticated users with unknown role
                  <Sidebar />
                ) : null}
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
                token && role === 'student' ? (
                  (() => {
                    // Check enrollment status to determine redirect
                    try {
                      const userData = JSON.parse(localStorage.getItem('user') || '{}');
                      const redirectPath = userData.enrollment_status === 'Officially Enrolled' 
                        ? '/student-dashboard' 
                        : '/student-profile';
                      return <Navigate to={redirectPath} replace />;
                    } catch (error) {
                      // If parsing fails, redirect to profile as fallback
                      return <Navigate to="/student-profile" replace />;
                    }
                  })()
                ) : (
                  <Login />
                )
              } />
              <Route path="/logIn" exact={true} element={<FakeLogin />} />
              <Route path="/stafflogin" exact={true} element={
                token && role && role !== 'student' ? (
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
