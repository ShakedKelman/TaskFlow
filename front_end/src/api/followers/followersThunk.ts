import { createAsyncThunk } from '@reduxjs/toolkit';
import { addFollower, getFollowersForVacation, getVacationsPerUser, removeFollower } from './follower-api';
import { VacationModel } from '../../model/VacationModel';
import { AppDispatch } from '../../store/store';

// Fetch followers for a specific vacation
export const fetchFollowers = createAsyncThunk(
    'followers/fetchFollowers',
    async (vacationId: number, thunkAPI) => {
        try {
            const followers = await getFollowersForVacation(vacationId);
            return followers;
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to fetch followers');
        }
    }
);

// Fetch vacations for a specific user
export const fetchVacationsPerUser = createAsyncThunk(
    'vacations/fetchVacationsPerUser',
    async ({ userId, token }: { userId: number; token?: string }, thunkAPI) => {
        try {
            const vacations = await getVacationsPerUser(userId, token);
            return vacations as VacationModel[]; // Ensure this is typed correctly
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to fetch vacations');
        }
    }

);


// Clear followed vacations
export const clearVacationsPerUser = createAsyncThunk(
    'vacations/clearVacationsPerUser',
    async (_, thunkAPI) => {
        try {
            return [];
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to clear followers');
        }
    }

);



// Add a follower to a vacation
export const addVacationFollower = createAsyncThunk(
    'followers/addFollower',
    async ({ userId, vacationId, token }: { userId: number, vacationId: number, token: string }, thunkAPI) => {
        try {
            await addFollower(userId, vacationId, token);
            return { userId, vacationId };
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to add follower');
        }
    }
);

// Remove a follower from a vacation
export const removeVacationFollower = createAsyncThunk(
    'followers/removeFollower',
    async ({ userId, vacationId, token }: { userId: number, vacationId: number, token: string }, thunkAPI) => {
        try {
            await removeFollower(userId, vacationId, token);
            return { userId, vacationId };
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to remove follower');
        }
    }
);


