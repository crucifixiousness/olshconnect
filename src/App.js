import './App.css';
import './responsive.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import "bootstrap/dist/css/bootstrap.min.css";
import { createContext, useEffect, useState } from 'react';
import Login from './pages/Login';
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

const MyContext = createContext();

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
    setRole(localStorage.getItem('role'));
    setUser(JSON.parse(localStorage.getItem('user')));
  }, [token]);

  useEffect(() => {
    document.title = "OLSHCOnnect";
  }, []);


  const openNav = () => {
    setIsOpenNav(true);
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
  };

  useEffect(() => {
    console.log('App State Update:', { token, role, user });
  }, [token, role, user]);

  const ProtectedRoute = ({ element, requiredRole, redirectTo }) => {
    if (!token) {
      return <Navigate to={redirectTo} />;
    }

    if (requiredRole && !requiredRole.includes(role)) {
      return <Navigate to={redirectTo} />;
    }

    return element;
  };

  return (
    <BrowserRouter>
    <Route path="*" element={<NotFound />} />
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
                ) : (
                  <Sidebar />
                )}
              </div>
            </>
          )}

          <div className={`content ${isHideComponents === true && 'full'} ${isToggleSidebar === true ? 'toggle' : ''}`} onClick={() => { if (isOpenNav) { setIsOpenNav(false); } }}>
            <Routes>
              
              <Route path="/" element={<Navigate to="/homepage" />} />
              <Route path="/homepage" exact={true} element={<Homepage />} />
              <Route path="/dashboard" exact={true} element={token ? <Dashboard /> : <Navigate to="/stafflogin" />} />
              <Route path="/login" exact={true} element={<Login />} />
              <Route path="/stafflogin" exact={true} element={<Signup />} />
              <Route path="/studentlist" exact={true} element={<ProtectedRoute element={<StudentList />} requiredRole={['registrar', 'admin', 'finance', 'instructor']} redirectTo="/stafflogin" />} />
              <Route path="/staffs" exact={true} element={<ProtectedRoute element={<Staff />} requiredRole={['registrar', 'admin', 'finance', 'instructor']} redirectTo="/stafflogin" />} />
              <Route path="/document-request" exact={true} element={<ProtectedRoute element={<DocumentRequests />} requiredRole={['registrar', 'admin']} redirectTo="/stafflogin" />} />
              <Route path="/student-dashboard" exact={true} element={<ProtectedRoute element={<StuDashboard />} requiredRole="student" redirectTo="/login" />} />
              <Route path="/student-profile" exact={true} element={<ProtectedRoute element={<StudentProfile />} requiredRole="student" redirectTo="/login" />} />
              <Route path="/student-courses" exact={true} element={<ProtectedRoute element={<StudentCourses/>} requiredRole="student" redirectTo="/login" />} />
              <Route path="/academic-records" exact={true} element={<ProtectedRoute element={<AcademicRecords />} requiredRole="student" redirectTo="/login" />} />
              <Route path="/request-document" exact={true} element={<ProtectedRoute element={<RequestDocument />} requiredRole="student" redirectTo="/login" />} />
              <Route path="/registrar-dashboard" exact={true} element={<ProtectedRoute element={<RegistrarDashboard />} requiredRole="registrar" redirectTo="/stafflogin" />} />
              <Route path="/registrar-enrollment" exact={true} element={<ProtectedRoute element={<Enrollment />} requiredRole="registrar" redirectTo="/stafflogin" />} />
              <Route path="/finance-dashboard" exact={true} element={<ProtectedRoute element={<FinanceDashboard />} requiredRole="finance" redirectTo="/stafflogin" />} />
            </Routes>
          </div>
        </div>
      </MyContext.Provider>
    </BrowserRouter>
  );
}

export default App;
export { MyContext };
