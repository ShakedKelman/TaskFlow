import { createAsyncThunk } from '@reduxjs/toolkit';
import jwtDecode from 'jwt-decode';
import { loginFailure, loginSuccess, logout } from '../store/slices/authSlice';
import { login, register } from './auth-api';
import { UserModel } from '../model/UserModel';
import { AppDispatch } from '../store/store';

interface DecodedToken {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
}

export const decodeToken = (token: string): UserModel => {
  try {
    const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
    return new UserModel({
      id: decoded.id,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
      token,
    });
  } catch (error) {
    console.error('Error decoding JWT:', error);
    throw new Error('Invalid token');
  }
};

interface LoginUserArgs {
  email: string;
  password: string;
}

export const loginUser = createAsyncThunk<void, LoginUserArgs>(
  'auth/loginUser',
  async ({ email, password }: LoginUserArgs, { dispatch }) => {
    try {
      const token: string = await login(email, password);
      console.log('Received token:', token);

      // Decode token to get user information
      const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token);
      const timestamp = Date.now();

      // Create a UserModel instance from decodedToken
      const user = new UserModel({
        id: decodedToken.id,
        firstName: decodedToken.firstName,
        lastName: decodedToken.lastName,
        email: decodedToken.email,
        isAdmin: decodedToken.isAdmin,
        token,
      });

      // Adjusted dispatch to match action creator expectations
      dispatch(loginSuccess({ user, timestamp }));
    } catch (error: any) {
      dispatch(loginFailure(error.message));
      throw error;
    }
  }
);

export const registerUser = createAsyncThunk<UserModel, UserModel>(
  'auth/registerUser',
  async (user: UserModel, { dispatch }) => {
    try {
      const registeredUser: UserModel = await register(user);
      const timestamp = Date.now();
      dispatch(loginSuccess({ user: registeredUser, timestamp }));
      return registeredUser;
    } catch (error: any) {
      dispatch(loginFailure(error.message));
      throw error;
    }
  }
);

export const logoutUser = () => (dispatch: AppDispatch) => {
  dispatch(logout());
};
