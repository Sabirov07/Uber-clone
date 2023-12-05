import { NextFunction, Request, Response } from "express"

export const logURL = async (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} request to the route '${req.protocol}://${req.get('host')}${req.originalUrl}'`);
    next();
} 