import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserModel } from '../../model/UserModel';
import { RootState } from '../store';
import { jwtDecode } from 'jwt-decode';
import { useSelector } from 'react-redux';

interface AuthState {
    user: UserModel | null;
    token: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed' | 'requesting';
    count: number | null;
    error: string | null;
}
const decodeTokenAndGetUser = (token: string): UserModel | null => {
    try {
        const decodedToken: any = jwtDecode(token);
        const userInfo = decodedToken.userWithoutPassword || decodedToken;

        return {
            id: userInfo.id,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            email: userInfo.email,
            isAdmin: userInfo.isAdmin,
            password: '', // Never store password
            token: token
        };
    } catch (error) {
        console.error('Token decode error:', error);
        return null;
    }
};

// Update the initial state to decode token and set user only once
const initialState: AuthState = {
    user: localStorage.getItem('token')
        ? decodeTokenAndGetUser(localStorage.getItem('token') as string)
        : null,
    token: localStorage.getItem('token') || null,
    status: 'idle',
    count: -1,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {

        loginSuccess(state, action: PayloadAction<{ token: string }>) {
            state.token = action.payload.token;
            state.user = decodeTokenAndGetUser(action.payload.token);
            state.status = 'succeeded';
            state.error = null;
            localStorage.setItem('token', action.payload.token);
        },
    
        loginFailure(state, action: PayloadAction<string>) {
            state.error = action.payload;
            state.status = 'failed';
            state.token = null;
            localStorage.removeItem('token');

        },
 
        logout(state) {
            state.user = null;
            state.token = null;
            state.status = 'idle';
            localStorage.removeItem('token');

        },
        registerRequest(state) {
            state.status = 'loading';
            state.error = null;
        },
        // Update the registerSuccess action to only accept token
        registerSuccess(state, action: PayloadAction<{ token: string }>) {
            state.token = action.payload.token;
            state.user = decodeTokenAndGetUser(action.payload.token);
            state.status = 'succeeded';
            state.error = null;
            localStorage.setItem('token', action.payload.token);
        },
   
        registerFailure(state, action: PayloadAction<string>) {
            state.error = action.payload;
            state.status = 'failed';
            state.token = null;
        },
        apicallsRequest(state) {
            state.status = 'requesting';
            state.error = null;
        },
        apicallsSuccess(state, action: PayloadAction<{ count: number }>) {
            state.status = 'succeeded';
            state.count = action.payload.count;
            state.error = null;
        },
        apicallsFailure(state, action: PayloadAction<{ message: string }>) {
            state.status = 'failed';
            state.error = action.payload.message;
        },

    },
});

export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;

export const useAuth = () => {
    return useSelector((state: RootState) => state.auth);
};
export const {
    loginSuccess,
    loginFailure,
    logout,
    registerRequest,
    registerSuccess,
    registerFailure,
    apicallsRequest,
    apicallsSuccess,
    apicallsFailure
} = authSlice.actions;

export default authSlice.reducer;
