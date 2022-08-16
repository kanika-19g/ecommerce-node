import jwt from 'jsonwebtoken';
import {Request, Response, NextFunction} from "express";

const authGuard = async (request: Request, response: Response, next: NextFunction) => {
    try {
        let requestHeaderTokenKey: string | undefined = process.env.AUTH_TOKEN_KEY;
        let secretKey: string | undefined = process.env.JWT_SECRET_KEY;
        if (requestHeaderTokenKey && secretKey) {
            let token = request.headers[requestHeaderTokenKey];
            if (!token) {
                return response.status(401).json({
                    msg: 'No Token Provided!'
                });
            }
            if (typeof token === "string" && secretKey) {
                let decodeObj: any = await jwt.verify(token, secretKey);
                request.headers['user'] = decodeObj.user;
                console.log("USER ==> ", request.headers['user']);
                next(); // passing to actual URL
            } else {
                return response.status(401).json({
                    msg: 'An Invalid Token!'
                });
            }
        }
    } catch (error) {
        return response.status(500).json({
            msg: 'Unauthorized!, its an invalid token'
        });
    }
};
export default authGuard;