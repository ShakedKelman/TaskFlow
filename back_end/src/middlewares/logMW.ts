import { NextFunction, Request, Response } from "express";
import { writeAccessLog } from "../utils/helpers";

export async function logMW(req: Request, res: Response, next: NextFunction) {    
    await writeAccessLog(`New ${req.method} to: ${req.url}`);
    next();
}


