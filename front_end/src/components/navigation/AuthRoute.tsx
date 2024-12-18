import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const authStatus = useSelector((state: RootState) => state.auth.status);

  if (authStatus !== 'succeeded') {
    return <Navigate to="/login" />; // Corrected to redirect to login if not authenticated
  }

  return element;
};

export default ProtectedRoute;
