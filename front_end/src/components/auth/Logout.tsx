import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../api/auth/authThunks'; // Adjust import path as needed
import { AppDispatch } from '../../store/store';
import { clearVacationsState } from '../../store/slices/followersSlice';

const Logout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (window.confirm('Are you sure you want to logout?')) {
        
    dispatch(clearVacationsState());
    
      dispatch(logoutUser()); // Log the user out
      navigate('/login'); // Redirect to login page after logout
    } else {
      navigate('/'); // Redirect to home if user cancels
    }
  }, [dispatch, navigate]);

  return <div>Logging out...</div>;
};

export default Logout;
