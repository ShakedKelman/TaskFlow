import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VacationModel } from '../../model/VacationModel';
import { RootState } from '../store';

interface VacationState {
    vacations: VacationModel[];
    paginatedVacations: VacationModel[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: VacationState = {
    vacations: [],
    paginatedVacations: [],
    status: 'idle',
    error: null,
};

const vacationSlice = createSlice({
    name: 'vacation',
    initialState,
    reducers: {
        // Core vacation CRUD operations
        addVacation(state, action: PayloadAction<VacationModel>) {
            state.vacations.push(action.payload);
            state.paginatedVacations.push(action.payload);
            state.status = 'succeeded';
        },
        updateVacation(state, action: PayloadAction<VacationModel>) {
            const index = state.vacations.findIndex(v => v.id === action.payload.id);
            if (index !== -1) {
                state.vacations[index] = action.payload;
            }
            const paginatedIndex = state.paginatedVacations.findIndex(v => v.id === action.payload.id);
            if (paginatedIndex !== -1) {
                state.paginatedVacations[paginatedIndex] = action.payload;
            }
        },
        deleteVacationAction(state, action: PayloadAction<number>) {
            state.vacations = state.vacations.filter(v => v.id !== action.payload);
            state.paginatedVacations = state.paginatedVacations.filter(v => v.id !== action.payload);
        },

        // Status management
        setLoadingStatus: (state) => {
            state.status = 'loading';
            state.error = null;
        },
        setErrorStatus: (state, action: PayloadAction<string>) => {
            state.status = 'failed';
            state.error = action.payload;
        },
        setSuccessStatus: (state) => {
            state.status = 'succeeded';
            state.error = null;
        },

        // Pagination handlers
        setPaginatedVacations(state, action: PayloadAction<VacationModel[]>) {
            state.paginatedVacations = action.payload;
        },
        setAllVacations(state, action: PayloadAction<VacationModel[]>) {
            state.vacations = action.payload;
            state.status = 'succeeded';
            state.paginatedVacations = action.payload.slice(0, 10);

        },
  // Follower-related updates
  updateVacationFollowerInfo(state, action: PayloadAction<{ 
    vacationId: number, 
    followerCount: number,
    isFollowing: boolean 
}>) {
    const vacation = state.vacations.find(v => v.id === action.payload.vacationId);
    if (vacation) {
        vacation.followerCount = action.payload.followerCount;
        vacation.isFollowing = action.payload.isFollowing;
    }
    
    const paginatedVacation = state.paginatedVacations.find(v => v.id === action.payload.vacationId);
    if (paginatedVacation) {
        paginatedVacation.followerCount = action.payload.followerCount;
        paginatedVacation.isFollowing = action.payload.isFollowing;
    }
},

// Batch updates
updateMultipleVacations(state, action: PayloadAction<VacationModel[]>) {
    action.payload.forEach(updatedVacation => {
        const index = state.vacations.findIndex(v => v.id === updatedVacation.id);
        if (index !== -1) {
            state.vacations[index] = updatedVacation;
        }
        
        const paginatedIndex = state.paginatedVacations.findIndex(v => v.id === updatedVacation.id);
        if (paginatedIndex !== -1) {
            state.paginatedVacations[paginatedIndex] = updatedVacation;
        }
    });
}
}
});

export const {
    addVacation,
    updateVacation,
    deleteVacationAction,
    setLoadingStatus,
    setErrorStatus,
    setSuccessStatus,
    setPaginatedVacations,
    setAllVacations,
    updateVacationFollowerInfo,
    updateMultipleVacations
} = vacationSlice.actions;

export const selectAllVacations = (state: RootState) => state.vacation.vacations;
export const selectPaginatedVacations = (state: RootState) => state.vacation.paginatedVacations;
export const selectVacationStatus = (state: RootState) => state.vacation.status;
export const selectVacationError = (state: RootState) => state.vacation.error;

export default vacationSlice.reducer;