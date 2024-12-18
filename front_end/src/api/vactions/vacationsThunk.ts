// api/vacationsThunk.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { VacationModel } from '../../model/VacationModel';
import { getVacations } from './vactions-api';
import { getPaginatedVacations } from './paginated-vacations-api';
import { RootState } from '../../store/store';


export const fetchVacations = createAsyncThunk(
    'vacation/fetchVacations',
    async ({ token } : {token?: string; }, thunkAPI) => {
        try {
            const vacations = await getVacations(undefined, token);
            // console.log('Fetched vacations:', vacations); // Add this log

            return vacations;
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to fetch vacations');
        }
    }
);

export const fetchPaginatedVacations = createAsyncThunk(
    'vacation/fetchPaginatedVacations',
    async ({ page, limit, token }: { page: number; limit: number; token?: string; }, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const { token: reduxToken, count } = state.auth;

        try {
            const vacations = await getPaginatedVacations(page, limit ,token);
            return vacations;
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to fetch vacations');
        }
    }
);



export const deleteVacation = createAsyncThunk(
    'vacation/deleteVacation',
    async (id: number, thunkAPI) => {
        try {
            await deleteVacation(id);
            return id;
        } catch (error) {
            return thunkAPI.rejectWithValue('Failed to delete vacation');
        }
    }
);
