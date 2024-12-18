// In SiteRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import VacationCard from './VacationCard';
import LoginComponent from './Login';
import RegisterComponent from './Register';
import AddVacationForm from './AddVactionForm';
import Logout from './Logout';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const SiteRoutes: React.FC = () => {
  const { status, loginTimestamp, user } = useSelector((state: RootState) => state.auth);
  const FIVE_MINUTES = 5 * 60 * 1000;
  const isAuthenticated = status === 'succeeded' && loginTimestamp && Date.now() - loginTimestamp <= FIVE_MINUTES;
  const isAdmin = isAuthenticated && user?.isAdmin;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/vacations" /> : <LoginComponent />} />
      <Route path="/register" element={<RegisterComponent />} />
      
      {/* Home Redirect */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/vacations" /> : <Navigate to="/login" />} 
      />
      
      {/* Protected Routes */}
      <Route
        path="/vacations"
        element={isAuthenticated ? <VacationCard /> : <Navigate to="/login" />}
      />
      <Route
        path="/add-vacation"
        element={isAdmin ? <AddVacationForm /> : <Navigate to="/vacations" />}
      />
      <Route
        path="/logout"
        element={isAuthenticated ? <Logout /> : <Navigate to="/login" />}
      />
    </Routes>
  );
};

export default SiteRoutes;