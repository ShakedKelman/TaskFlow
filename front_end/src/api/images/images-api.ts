import axios from "axios";
import { siteConfig } from "../../utils/SiteConfig";

export const getImageForVacation = async (vacationId: number): Promise<string[]> => {
    try {
        const response = await axios.get(`${siteConfig.BASE_URL}images/${vacationId}`);
          // Check if the response contains image objects or just image paths
          const imagePaths = [response.data].map((item: any) => 
          typeof item === 'string' ? item : item.image_path
      );
      return imagePaths;
    } catch (error) {
        console.error("Error fetching images:", error);
        return [];
    }
};

export const deleteImage = async (vacationId: number, imageName: string, token: string): Promise<void> => {
    try {
        await axios.delete(`${siteConfig.BASE_URL}/image/${vacationId}/${imageName}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        console.log('Image deleted successfully');
    } catch (error) {
        console.error("Error deleting image:", error);
        throw error;
    }
};