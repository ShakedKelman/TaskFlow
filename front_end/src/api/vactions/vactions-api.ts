import axios from 'axios';
import { VacationModel } from '../../model/VacationModel';
import { siteConfig } from '../../utils/SiteConfig';
import { store } from '../../store/store';




// Fetch all vacations or a specific vacation by ID
export const getVacations = async (id?: number, token?: string): Promise<VacationModel[]> => {
    try {
        if (token === undefined || token === '' || token === null) throw new Error('no token provided');

        const url = id ? `${siteConfig.BASE_URL}vacations/${id}?token=${token}` : `${siteConfig.BASE_URL}vacations?token=${token}`;
        const response = await axios.get(url);
        // console.log('got vacations successfully', response.data);
        return response.data; // Ensure this matches `VacationModel[]`
    } catch (error) {
        console.error("Error fetching vacations:", error);
        throw error;
    }
};



// function to add vacation
export const apiAddVacation = async (formData: FormData): Promise<VacationModel> => {
    // let token = localStorage.getItem('token') || null;
    const token = store.getState().auth.token;
    if (!token) throw new Error('No token available');

    try {
        const response = await axios.post(`${siteConfig.BASE_URL}vacations`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log('Vacation added successfully', response.data);
        return response.data;
    } catch (error) {
        console.error("Error adding vacation:", error);
        throw error;
    }
};

// Edit an existing vacation and replace the old image with a new one
export const editVacation = async (id: number, formData: FormData, token: string): Promise<void> => {

    try {
        const entries = Array.from(formData.entries());
        // console.log(entries); // Should log array of key-value pairs           
        const response = await fetch(`${siteConfig.BASE_URL}vacation/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });
        // Check if the response is not successful
        if (!response.ok) {
            // Try to parse the error response as JSON
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update vacation');
        }
        console.log('Vacation updated successfully');
    } catch (error) {
        console.error("Error editing vacation:", error);
        throw error;
    }
};



// api/vactions-api.ts
export const uploadVacationImage = async (vacationId: number, image: File, token: string): Promise<void> => {

    const formData = new FormData();
    formData.append('image', image);

    const response = await fetch(`${siteConfig.BASE_URL}image/${vacationId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload image');
    }
};



// api/vacations-api.ts

// Delete a vacation by ID
export const deleteVacationAPI = async (id: number, token: string): Promise<void> => {
    try {
        await axios.delete(`${siteConfig.BASE_URL}vacations/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log('Vacation deleted successfully');
    } catch (error) {
        console.error("Error deleting vacation:", error);
        throw error;
    }
};



