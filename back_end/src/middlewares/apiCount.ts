import { NextFunction, Request, Response } from "express";
import runQuery from "../db/dal";

export async function updateApiCount(req: Request, res: Response, next: NextFunction) {
    let q = `SELECT * FROM counts`;
    res = await runQuery(q);
    const { apicall: currentI } = res[0]
    const nextI = +currentI + 1;
    
    q = `UPDATE counts SET apicall=${nextI} WHERE apicall=${currentI}`;
    await runQuery(q);

    next();
}

