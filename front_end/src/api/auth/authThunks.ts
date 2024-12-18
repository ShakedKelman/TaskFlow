import { createAsyncThunk } from '@reduxjs/toolkit';
import { apicallsFailure, apicallsRequest, apicallsSuccess, loginFailure, loginSuccess, logout, registerFailure, registerSuccess } from '../../store/slices/authSlice';
import { login, register, getApiCalls } from './auth-api';
import { UserModel } from '../../model/UserModel';
import { AppDispatch } from '../../store/store';
import { count } from 'console';
import { clearVacationsState } from '../../store/slices/followersSlice';

interface LoginUserArgs {
  email: string;
  password: string;
}


export const loginUser = createAsyncThunk<void, LoginUserArgs>(
    'auth/loginUser',
    async ({ email, password }: LoginUserArgs, { dispatch }) => {
      try {
        const token = await login(email, password);
        dispatch(loginSuccess({ token }));
      } catch (error: any) {
        console.error('Login error in thunk:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Login failed';
        dispatch(loginFailure(errorMessage));
        throw new Error(errorMessage);
      }
    }
  );

export const registerUser = createAsyncThunk<void, UserModel>(
    'auth/registerUser',
    async (user: UserModel, { dispatch }) => {
      try {
        const token = await register(user);
        dispatch(registerSuccess({ token }));
      } catch (error: any) {
        console.error('Registration error in thunk:', error);
        dispatch(registerFailure(error.message));
        throw error;
      }
    }
  );
export const logoutUser = () => (dispatch: AppDispatch) => {
    console.log('LOGOUT USER')
    dispatch(clearVacationsState());
    dispatch(logout());
};

  interface CountModel {
    count: number;
  }
  
  export const fetchApiCalls = createAsyncThunk<CountModel, void>(
    'auth/fetchApiCalls',
    async (_, { dispatch }) => {
      try {
        dispatch(apicallsRequest());
        const apiCallCount = await getApiCalls();
        dispatch(apicallsSuccess(apiCallCount));

        return apiCallCount;
      } catch (error: any) {
        console.error('Fetch API calls error:', error);
        dispatch(apicallsFailure(error.message));
        throw error;
      }
    }
  );