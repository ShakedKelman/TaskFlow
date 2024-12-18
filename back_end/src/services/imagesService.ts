// services/imagesService.ts

import runQuery from "../db/dal";
import { UploadedFile } from "express-fileupload";
import { saveImage } from "../utils/helpers";

export async function getAllImages(): Promise<any[]> {
    const query = `SELECT image_path,imageFileName FROM vacations`;
    const rows = await runQuery(query);
    // Ensure the result is an array
    return Array.isArray(rows) ? rows : [];
}



// Function to save an image and return the filename
export const saveVacationImage = async (vacationId: number, image: UploadedFile): Promise<string> => {
    const imagePath = await saveImage(image);  
    const imageFileName=image.name      
    // Update the vacations table with the image file name
    await runQuery(
        'UPDATE vacations SET imageFileName = ?,image_path=? WHERE id = ?',
        [imageFileName, imagePath, vacationId]
    );    
    return imagePath;
};



export async function getImageByVacation(vacationId: number):Promise<string> {
    try {

        // Assuming you're using a database to fetch image information
        const images = await runQuery("SELECT image_path FROM vacations WHERE id = ?", [vacationId]);

        if (!images || images.length === 0) {
            return null
        }
        // Process the images to ensure correct paths
        const image_path= images[0].image_path;

        return image_path;
    } catch (error) {
        console.error(`Error fetching images for vacation ${vacationId}:`, error);
        throw error;
    }
}



