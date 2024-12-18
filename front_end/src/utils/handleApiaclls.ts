// src/utils/apiCallsHandler.ts
import { AppDispatch } from '../store/store';
import { fetchApiCalls } from '../api/auth/authThunks';
import { checkAuthStatus } from './checkStatus';

export const handleApiCalls = (dispatch: AppDispatch) => {
  // Dispatch the fetchApiCalls thunk
  dispatch(fetchApiCalls());
};

export const setupAuthCheck = (dispatch: AppDispatch) => {
  const performAuthCheck = () => {
    try {
      checkAuthStatus(dispatch);
    } catch (error) {
      console.error('Error performing auth check:', error);
    }
  };

  // Initial check
  performAuthCheck();

  // Set up an interval to check auth status regularly
  const intervalId = setInterval(performAuthCheck, 60000); // Check every minute

  // Return the cleanup function to clear the interval
  return () => clearInterval(intervalId);
};
