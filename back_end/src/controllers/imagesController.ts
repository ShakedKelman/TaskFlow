// routes/vacationRoutes.ts
import { NextFunction, Request, Response, Router } from "express";
import {  getAllImages, getImageByVacation, saveVacationImage } from "../services/imagesService";
import { appConfig } from "../utils/appConfig";
import { StatusCode } from "../models/statusEnum";
import multer from "multer";
import { UploadedFile } from "express-fileupload";
import { deleteImage, serveImage } from "../utils/helpers"; // Adjust the import path if necessary
import path from 'path';

export const imagesRoute = Router();

const upload = multer({ dest: 'uploads/' }); // Configure multer as needed


// Route to get images by vacation ID
imagesRoute.get(appConfig.routePrefix + "/images/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vacationId = parseInt(req.params.id, 10);
        
        // Fetch image path from the database
        const imagePath = await getImageByVacation(vacationId);
        if (!imagePath) {
            // No image found for the given vacation ID
            return res.status(StatusCode.Ok).json([]);
        }
        
        return res.status(StatusCode.Ok).sendFile(imagePath, { root: appConfig.vacationsImagesPrefix });
    } catch (error) {
        console.error("Error in getImagesByVacation route:", error);
        return res.status(StatusCode.ServerError).json({ error: "An error occurred while fetching images" });
    }
});

export default imagesRoute;


// Route to get all images
imagesRoute.get(appConfig.routePrefix + "/images",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const images = await getAllImages();
            res.status(StatusCode.Ok).json(images);
        } catch (error) {
            console.error("Error in getAllImages route:", error);
            next(error);
        }
    }
);




imagesRoute.delete(appConfig.routePrefix + "/image/:vacationId/:imageName",
  async (req: Request, res: Response, next: NextFunction) => {
      try {
          const { vacationId, imageName } = req.params;
      
          const imageUUID=await getImageByVacation(Number(vacationId));
          // Construct the full path using the imageName
          const imageFullPath = path.join(appConfig.vacationsImagesPrefix, imageUUID);
          
          // Call deleteImage with the full path
          await deleteImage(imageFullPath);
          
          res.status(StatusCode.Ok).json({ message: "Image deleted successfully" });
      } catch (error) {
          console.error("Error in delete image route:", error);
          if (error.code === 'ENOENT') {
              res.status(StatusCode.NotFound).json({ message: "Image not found" });
          } else {
              next(error);
          }
      }
  });