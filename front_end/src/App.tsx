
import React, { useEffect } from 'react';
import NavbarWeb from './components/navigation/NavbarWeb';
import SiteRoutes from './components/navigation/SiteRoutes';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store/store';
import { handleApiCalls, setupAuthCheck } from './utils/handleApiaclls';
import { logoutUser } from './api/auth/authThunks';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { count: apiCallCount, status } = useSelector((state: RootState) => state.auth);
//   const { auth } = useSelector((state: RootState) => state);


  useEffect(() => {

    // Handle API calls
    handleApiCalls(dispatch);

  }, [dispatch]);

  useEffect(() => {
    // Set up the authentication check
    const cleanupAuthCheck = setupAuthCheck(dispatch);

    // Cleanup function when the component unmounts
    return () => cleanupAuthCheck();

  }, [dispatch]);
      
  useEffect(() => {
    if (apiCallCount === 0) {
      dispatch(logoutUser());
    }
  }, [apiCallCount]);

  return (
    <div>
        <NavbarWeb />
        <SiteRoutes />
    </div>
  );
};

export default App;
