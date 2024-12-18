import { appConfig } from "../utils/appConfig";
import { NextFunction, Request, Response, Router } from "express";
import { StatusCode } from "../models/statusEnum";
import { addFollower, getFollowersForVacation, getVacationsPerUser, removeFollower } from "../services/followersService";
import { verifyToeknMW } from "../middlewares/authMiddlewares";

export const followerRoutes = Router();



// Route to get followers for a specific vacation
followerRoutes.get(appConfig.routePrefix + "/vacations/:id/followers", verifyToeknMW,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const vacationId = parseInt(req.params.id, 10);

            // Validate if vacationId is a valid number
            if (isNaN(vacationId)) {
                return res.status(StatusCode.BadRequest).json({ message: "Invalid vacation ID" });
            }

            const followers = await getFollowersForVacation(vacationId);
            res.status(StatusCode.Ok).json(followers);
        } catch (error) {
            console.error("Error in getFollowersForVacation route:", error);
            next(error);
        }
    }
);

// Route to get all vacations for a spesific user
followerRoutes.get(appConfig.routePrefix + "/followers/:id/vacations", verifyToeknMW,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = parseInt(req.params.id, 10);

            // Validate if vacationId is a valid number
            if (isNaN(userId)) {
                return res.status(StatusCode.BadRequest).json({ message: "Invalid vacation ID" });
            }

            const vacations = await getVacationsPerUser(userId);
            res.status(StatusCode.Ok).json(vacations);
        } catch (error) {
            console.error("Error in getVacationsPerUser route:", error);
            next(error);
        }
    }
);



// Route to add a follower to a specific vacation
followerRoutes.post(appConfig.routePrefix + "/vacations/:id/followers", verifyToeknMW,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const vacationId = parseInt(req.params.id, 10);
            const userId = req.body.userId;

            if (isNaN(vacationId)) {
                return res.status(StatusCode.BadRequest).json({ message: "Invalid vacation ID" });
            }

            if (!userId) {
                return res.status(StatusCode.BadRequest).json({ message: "User ID is required" });
            }

            await addFollower(vacationId, userId);
            res.status(StatusCode.Created).json({ message: "Follower added successfully" });
        } catch (error) {
            if (error.message === "Follower already exists") {
                return res.status(StatusCode.ServerError).json({ message: "Follower already exists" });
            }
            console.error("Error in addFollower route:", error);
            next(error);
        }
    }
);



// Route to remove a follower from a specific vacation
followerRoutes.delete(appConfig.routePrefix + "/vacations/:id/followers", verifyToeknMW,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const vacationId = parseInt(req.params.id, 10);
            const userId = req.body.userId;

            if (isNaN(vacationId)) {
                return res.status(StatusCode.BadRequest).json({ message: "Invalid vacation ID" });
            }

            if (!userId) {
                return res.status(StatusCode.BadRequest).json({ message: "User ID is required" });
            }

            await removeFollower(vacationId, userId);
            res.status(StatusCode.Ok).json({ message: "Follower removed successfully" });
        } catch (error) {
            if (error.message === "Follower does not exist") {
                return res.status(StatusCode.NotFound).json({ message: "Follower does not exist" });
            }
            console.error("Error in removeFollower route:", error);
            next(error);
        }
    }
);