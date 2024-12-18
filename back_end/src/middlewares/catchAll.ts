import { NextFunction, Request, Response } from "express";
import { AppExcption } from "../models/exceptions";
import { StatusCode } from "../models/statusEnum";
import { writeErrorLog } from "../utils/helpers";

function catchAll(err: any, req: Request, res: Response, next: NextFunction) {
    console.log('Caught error:', err.message);

    writeErrorLog(err.message).then(() => {
        if (err instanceof AppExcption) {
            res.status(err.status).send(err.message);
        } else {
            res.status(StatusCode.ServerError).send("Internal Server Error");
        }
    }) 
}

export default catchAll;