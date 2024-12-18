import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserModel } from '../../model/UserModel';

interface AuthState {
    token: string | null;
  user: UserModel | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  loginTimestamp: number | null; // Add timestamp to track login

}

const initialState: AuthState = {
    token: null,
  user: null,
  status: 'idle',
  error: null,
  loginTimestamp: null,

};
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
      loginSuccess(state, action: PayloadAction<{ user: UserModel, timestamp: number }>) {
          state.user = action.payload.user;
          state.status = 'succeeded';
          state.error = null;
          state.loginTimestamp = action.payload.timestamp;
          localStorage.setItem('user', JSON.stringify(action.payload.user));
          localStorage.setItem('loginTimestamp', action.payload.timestamp.toString());
      },
      loginFailure(state, action: PayloadAction<string>) {
          state.error = action.payload;
          state.status = 'failed';
      },
      logout(state) {
          state.user = null;
          state.status = 'idle';
          state.loginTimestamp = null;
          localStorage.removeItem('user');
          localStorage.removeItem('loginTimestamp');
      },
      registerRequest(state) {
          state.status = 'loading';
          state.error = null;
      },
      registerSuccess(state, action: PayloadAction<UserModel>) {
          state.user = action.payload;
          state.status = 'succeeded';
          state.error = null;
      },
      registerFailure(state, action: PayloadAction<string>) {
          state.error = action.payload;
          state.status = 'failed';
      },
    },
  });
  
  

  export const {
    loginSuccess,
    loginFailure,
    logout,
    registerRequest,
    registerSuccess,
    registerFailure,
  } = authSlice.actions;
  
  export default authSlice.reducer;
