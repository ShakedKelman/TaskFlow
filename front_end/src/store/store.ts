import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import vacationReducer from './slices/vacationslice';
import followersReducer from './slices/followersSlice'; // Import followersReducer
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vacation: vacationReducer, 
    followers: followersReducer, 


  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
