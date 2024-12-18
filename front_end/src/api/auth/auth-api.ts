import axios from 'axios';
import { UserModel } from '../../model/UserModel';
import { jwtDecode } from 'jwt-decode';
import { siteConfig } from '../../utils/SiteConfig';


export const login = async (email: string, password: string): Promise<string> => {
    try {
      const response = await axios.post(`${siteConfig.BASE_URL}login`, { email, password });
      return response.data.token;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
};

export const register = async (user: UserModel): Promise<string> => {
    try {
      const response = await axios.post(`${siteConfig.BASE_URL}register`, user);
      return response.data.token;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

interface CountModel {
    count: number;
  }

// Fetch all vacations or a specific vacation by ID
export const getApiCalls = async (): Promise<CountModel> => {
    try {
        const url = `${siteConfig.BASE_URL}apiCall`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching apiCalls:", error);
        throw error;
    }
};



