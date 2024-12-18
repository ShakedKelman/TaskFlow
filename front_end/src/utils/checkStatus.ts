import { UserModel } from '../model/UserModel';
import { jwtDecode } from 'jwt-decode';
import { AppDispatch } from '../store/store';
import { loginSuccess } from '../store/slices/authSlice';

export const checkAuthStatus = (dispatch: AppDispatch) => {
  try {
    const token = localStorage.getItem('token');

    if (!token ) {
      // If either token or user data is missing, clear the authentication state
      localStorage.removeItem('token');
      return;
    }
    // Dispatch loginSuccess to maintain the authenticated state
    dispatch(loginSuccess({ token }));
  } catch (error) {
    console.error('Error in checkAuthStatus:', error);
    // Clear potentially corrupted data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};