import jwt from "jsonwebtoken";
import { appConfig } from "./appConfig";
import { UnauthorizedError } from "../models/exceptions";
import UserModel from "../models/UsersModel";
import bcrypt from "bcrypt"

export function verifyToken(token: string, adminRequired: boolean = false) {
  
    if (!token) {
        throw new UnauthorizedError(JSON.stringify({ error: "Missing Credentials!" }));
    }
    let decoded;
    try {
        decoded = jwt.verify(token, appConfig.jwtSecret) as { userWithoutPassword: UserModel };

    } catch (error) {
        throw new UnauthorizedError(JSON.stringify({ error: "wrong Credentials!" }));
    }

    const { password, ...userWithoutPassword } = decoded.userWithoutPassword;
    
    const userInfo = {
        ...userWithoutPassword,
        firstName: decoded.userWithoutPassword.firstName,
        lastName: decoded.userWithoutPassword.lastName
    };
    if (adminRequired && !userWithoutPassword.isAdmin) {
        throw new UnauthorizedError(JSON.stringify({ error: "Only admin users have access!" }));
    }

    return userInfo;
}


export function createToken(user: UserModel): string {
    const userWithoutPassword = {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        firstName: user.firstName,
        lastName: user.lastName,
        // Remove the token field if it's not needed
    };

    const token = jwt.sign({ userWithoutPassword }, appConfig.jwtSecret);
    return token;
}


export async function encryptPassword(password: string): Promise<string> {
    const epw = await bcrypt.hash(password, 10);
    return epw
}

export async function validatePassword(password: string, hashedPassword: string): Promise<boolean> { 
    const res = await bcrypt.compare(String(password), hashedPassword);
    
    return res
}