// routes/vacationRoutes.ts
import { NextFunction, Request, Response, Router } from "express";
import { appConfig } from "../utils/appConfig";
import { StatusCode } from "../models/statusEnum";
import VacationModel from "../models/VacationsModel";
import { addVacation, deleteVacation, editVacation, getVacations, getVacationsPaginated } from "../services/vacationsService";
import { UploadedFile } from "express-fileupload";
import { getFollowersForVacation } from "../services/followersService";
import runQuery from "../db/dal";
import { AppExcption, ValidationError } from "../models/exceptions";
import { deleteImage } from "../utils/helpers";
import { getImageByVacation } from "../services/imagesService";
import { verifyToeknAdminMW, verifyToeknMW } from "../middlewares/authMiddlewares";

export const vacationRoutes = Router();

// Route to get all vacations or a specific vacation by ID
vacationRoutes.get(appConfig.routePrefix + "/vacations/:id?", verifyToeknMW,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id ? parseInt(req.params.id, 10) : undefined;
            const vacations = await getVacations(id);
            res.status(StatusCode.Ok).json(vacations);
        } catch (error) {
            console.error("Error in getVacations route:", error); // Debugging
            next(error);
        }
    }
);



vacationRoutes.post(
    appConfig.routePrefix + "/vacations", verifyToeknAdminMW,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
   
            const vacationData = {
                destination: req.body.destination,
                description: req.body.description,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                price: parseFloat(req.body.price),
            };

            const vacation = new VacationModel(vacationData);
            const image = req.files?.image as UploadedFile | undefined;

            if (!image) {
                return res.status(StatusCode.BadRequest).json({ message: "Image file is required" });
            }

            const vacationId = await addVacation(vacation, image);
            res.status(StatusCode.Created).json({ message: "Vacation added successfully", vacationId });
        } catch (error) {
            console.error("Detailed error in addVacation route:", error);

            if (error instanceof ValidationError) {
                // Send the validation error details to the client
                return res.status(StatusCode.BadRequest).json({
                    message: error.message,
                });
            }

            if (error instanceof Error) {
                return res.status(StatusCode.ServerError).json({
                    message: "Error adding vacation",
                    error: error.message,
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                });
            } else {
                return res.status(StatusCode.ServerError).json({
                    message: "Unknown error occurred while adding vacation"
                });
            }
        }
    }
);



vacationRoutes.put(appConfig.routePrefix + "/vacation/:id", verifyToeknAdminMW,
async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id, 10);
        
        // Handle file upload if present
        let image = req.files?.image as UploadedFile;

        // Assuming req.body contains the update fields
        const updates: Partial<VacationModel> = req.body;
 
        const vacationUpdated= await editVacation(id, updates, image);

        res.status(StatusCode.Ok).json(vacationUpdated);
    } catch (error) {
        
        console.error("Error in editVacationController:", error);
        if (error instanceof ValidationError) {
            res.status(StatusCode.BadRequest).json({
                error: "Validation Error",
                message: error.message
            });
        } else {
            next(error); // Pass the error to the next middleware (for other error types)
        }    }
});




// Route to get followers for a specific vacation
vacationRoutes.get(appConfig.routePrefix + "/vacations/:id/followers", verifyToeknMW,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const vacationId = parseInt(req.params.id, 10);
            const followers = await getFollowersForVacation(vacationId);
            res.status(StatusCode.Ok).json(followers);
        } catch (error) {
            console.error("Error in getFollowersForVacation route:", error);
            next(error);
        }
    }
);


vacationRoutes.delete(appConfig.routePrefix + "/vacations/:id", verifyToeknAdminMW,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id, 10);

            const vacationImagePaths = await getImageByVacation(id);
            
            if (!vacationImagePaths || vacationImagePaths.length === 0) {
                console.warn(`No images found for vacation ID ${id}`);
            }

            await deleteVacation(id);
            res.status(StatusCode.Ok).send(); // No content to return after successful deletion
        } catch (error) {
            console.error("Error in deleteVacation route:", error);
            next(error);
        }
    }
);

// routes/vacationRoutes.ts

vacationRoutes.get(appConfig.routePrefix + "/vacations-pg",verifyToeknMW, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const vacations = await getVacationsPaginated(Number(page), Number(limit));
        res.status(StatusCode.Ok).json(vacations);
    } catch (error) {
        next(error)
    }
});


