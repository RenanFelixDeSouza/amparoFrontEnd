import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Cookies from 'js-cookie';

import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Sidebar from './components/SideBar/SideBar';
import Header from './components/Header/Header';

import ProtectedRoute from './services/ProtectedRoute';

import ListCategories from './components/Category/ListCategories/ListCategories';
import AddCategory from './components/Category/AddCategory/AddCategory';

import AddCourse from './components/Course/AddCourse/AddCourse';
import ListCourses from './components/Course/ListCourses/ListCourses';

import ListStudent from './components/Student/ListStudent/ListStudent';
import AddStudent from './components/Student/AddStudent/AddStudent';
import AddPet from './components/Pet/AddPet/AddPet';

import UserManager from './components/User/UserManager/UserManager';
import ListUsers from './components/User/ListUser/ListUsers';

import Attendance from './components/Attendance/AttendanceList/AttendanceList';
import ListRequest from './components/Requests/ListRequest/ListRequest';
import ReportPage from './components/Reports/ReportPage';
import Register from './components/Register/Register';
import EditUser from './components/User/EditUser/EditUser';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userName, setUserName] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hasRequests, setHasRequests] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = Cookies.get('token');
    const storedUserType = Cookies.get('userType');
    const storedUserName = Cookies.get('userName');
    
    if (token) {
      setIsLoggedIn(true);
      setUserType(storedUserType);
      setUserName(storedUserName);
    }
  }, []);

  useEffect(() => {
    const handleRequestsStatusUpdate = (event) => {
      setHasRequests(event.detail);
    };

    window.addEventListener('requestsStatusUpdate', handleRequestsStatusUpdate);

    return () => {
      window.removeEventListener('requestsStatusUpdate', handleRequestsStatusUpdate);
    };
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(prevState => !prevState);

  const handleMouseEnter = () => !isMobile && setIsSidebarOpen(true);
  const handleMouseLeave = () => !isMobile && setIsSidebarOpen(false);

  const handleLoginSuccess = (token, user) => {
    setIsLoggedIn(true);
    setUserType(user.type);
    setUserName(user.name);
    Cookies.set('token', token, { secure: true, sameSite: 'strict' });
    Cookies.set('userType', user.type, { secure: true, sameSite: 'strict' });
    Cookies.set('userName', user.name, { secure: true, sameSite: 'strict' });
  };

  const handleProfilePhotoUpdate = (newPhotoUrl) => {
    setProfilePhoto(newPhotoUrl);
  };

  const renderProtectedRoute = (path, Component, requiredUserType = "master") => (
    <Route
      path={path}
      element={
        <ProtectedRoute
          isLoggedIn={isLoggedIn}
          userType={userType}
          requiredUserType={requiredUserType}
          element={Component}
        />
      }
    />
  );

  return (
    <Router>
      <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {isLoggedIn && (
          <>
            <Sidebar
              isOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              setIsLoggedIn={setIsLoggedIn}
              userType={userType}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              hasRequests={hasRequests}
            />
            <Header
              userName={userName}
              userType={userType}
              profilePhoto={profilePhoto}
            />
          </>
        )}

        <div className="main-content">
          <Routes>
            <Route
              path="/"
              element={isLoggedIn ? <Navigate to={isMobile || userType === 'professor' ? "/chamadas" : "/dashboard"} /> : <Login setIsLoggedIn={handleLoginSuccess} />}
            />
            <Route
              path="/register"
              element={<Register setIsLoggedIn={handleLoginSuccess} />}
            />

            {renderProtectedRoute("/chamadas", <Attendance />, ['master', 'professor'])}
            {renderProtectedRoute("/dashboard", <Dashboard />)}
            {renderProtectedRoute("/listar-oficinas", <ListCategories />)}
            {renderProtectedRoute("/criar-oficina", <AddCategory />)}
            {renderProtectedRoute("/criar-aula", <AddCourse />)}
            {renderProtectedRoute("/adicionar-turma", <AddCourse />)}
            {renderProtectedRoute("/listar-turmas", <ListCourses />)}

            {renderProtectedRoute("/adicionar-pet", <AddPet />)}
            {renderProtectedRoute("/alunos", <ListStudent />)}

            {renderProtectedRoute("/adicionar-usuario", <UserManager />)}
            {renderProtectedRoute("/listar-usuarios", <ListUsers />)}
            {renderProtectedRoute("/solicitacoes", <ListRequest />)}
            {renderProtectedRoute("/configuracao-usuario", <EditUser onProfilePhotoUpdate={handleProfilePhotoUpdate} />)}
            {renderProtectedRoute("/relatorios", <ReportPage />, 'master')}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;