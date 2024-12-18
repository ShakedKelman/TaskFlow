import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/authUtils";


export function verifyToeknMW(req: Request, res: Response, next: NextFunction) {
    try {
        
        let token = req.header("Authorization")?.substring(7) || null;
        if (!token) token = req.query.token as string || req.body.token; // Check query params or body


        if (!token) {
            console.error('Token not found'); // Log error if no token
            throw new Error('Token not found');
        }

        const userWithoutPassword = verifyToken(token,false); // Verify the token

        res.locals.user = userWithoutPassword; // Attach user to res.locals
        console.log('User sent to FE:', userWithoutPassword); // Log user info

        next();
    } catch (error) {
        console.error('Error in verifyToeknMW:', error.message); // Log the error
        next(error); // Pass error to the next middleware
    }
}


export function verifyToeknAdminMW(req: Request, res: Response, next: NextFunction) {
    try {
        let token = req.header("Authorization")?.substring(7) || null;
        if (token === null) token = req.param('token');
        if (token === null || token === undefined ) throw new Error('token not found');      
        const user = verifyToken(token, true);
        res.locals.user = user;
        next()
    } catch (error) {
        next(error);
    }
}