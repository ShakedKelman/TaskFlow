import runQuery from "../db/dal";
import { appConfig } from "./appConfig";
import { promises as fs } from "fs";
import path from 'path';
import { UploadedFile } from "express-fileupload";
import { v4 as uuid } from "uuid";
import { Request, Response } from 'express';
import { extname } from 'path';
import { getImageByVacation } from "../services/imagesService";
import { NotDeletedError } from "../models/exceptions";


export async function isDbServerUp() {
  try {
    await runQuery("show databases;");
    return true;
  } catch (error) {
    return false;
  }
}

async function ensureLogFolderExists() {
    const logDir = path.join(__dirname, '..', 'logs');
    try {
        await fs.access(logDir);
    } catch (error) {
        // Directory does not exist, create it
        await fs.mkdir(logDir);
    }
}

ensureLogFolderExists();


async function writeToFile(filepath: string, content: string) {
    try {
        await fs.appendFile(filepath, content + "\n");
    } catch (error) {
        console.error('Failed to write to file:', error);
    }
}

export async function writeErrorLog(errMsg: string) {
    await writeToFile(appConfig.errorLogFile, errMsg);
}

export async function writeAccessLog(msg: string) {
    await writeToFile(appConfig.accessLogFile, msg);
}



// Save image function
export async function saveImage(image: UploadedFile): Promise<string> {

    const extension = path.extname(image.name);
    const filename = uuid() + extension;
    const fullPath = path.join(appConfig.vacationsImagesPrefix, filename);

    // Ensure the directory exists
    await fs.mkdir(appConfig.vacationsImagesPrefix, { recursive: true });
    
    await image.mv(fullPath);
    return filename;
}


/**
 * Deletes an image file from the file system.
 * @param imageName - The name of the image to be deleted (UUID or any other naming convention).
 */
export const deleteImage = async (imageUUID: string): Promise<void> => {
    // Construct the full path for the image
    const fullPath = path.join(appConfig.vacationsImagesPrefix, imageUUID);

    try {
        await fs.unlink(fullPath);
        console.log(`Successfully deleted image at ${fullPath}`);
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log(`File does not exist at ${fullPath}. It may have been already deleted.`);
        } else {
            console.error(`Failed to delete image at ${fullPath}:`, err);
            throw new NotDeletedError(`Failed to delete image at ${fullPath}: ${err.message}`);
        }
    }
};



// Function to serve image with response headers
export async function serveImage(req: Request, res: Response) {
    const vacationId = parseInt(req.params.vacationId, 10);

    try {
        // Fetch image path from the database
        const imagePath = await getImageByVacation(vacationId);

        if (!imagePath) {
            return res.status(404).send('Image not found');
        }

        // Set appropriate headers
        const extension = extname(imagePath).toLowerCase();
        const mimeType = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
        }[extension] || 'application/octet-stream';

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${path.basename(imagePath)}"`);

        // Send the image file
        res.sendFile(imagePath, { root: appConfig.vacationsImagesPrefix });
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).send('Internal Server Error');
    }
}
