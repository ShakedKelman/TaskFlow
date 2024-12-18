import { createToken, encryptPassword, validatePassword } from "../utils/authUtils";
import { UnauthorizedError, ValidationError } from "../models/exceptions";
import runQuery from "../db/dal";
import UserModel from "../models/UsersModel";
import { ResultSetHeader } from "mysql2";

// Register a new user
export async function register(user: UserModel): Promise<string> {
    // Validate user input
    user.validate();

    // Check if the email already exists in the database
   // Check if the email already exists in the database
   const emailCheckQuery = "SELECT 1 FROM users WHERE email = ? LIMIT 1";
   const emailCheckResult = await runQuery(emailCheckQuery, [user.email]);
    if (emailCheckResult[0].count > 0) {
        throw new ValidationError("Email already exists");
    }

    // Hash the user's password before storing it
    const hashedPassword = await encryptPassword(user.password);

    // Insert the new user into the database
    const insertQuery = `
    INSERT INTO users (firstName, lastName, hashedPassword, email, isAdmin)
    VALUES (?, ?, ?, ?, ?)
`;

    const insertParams = [
        user.firstName,
        user.lastName,
        hashedPassword, 
        user.email,
        user.isAdmin || false 
    ];

    // Execute the insert query
    const insertedInfo = (await runQuery(insertQuery, insertParams)) as ResultSetHeader | any;
    const userId = insertedInfo.insertId;

    // Assign the inserted ID to the user object
    user.id = userId;

    // Generate a token for the user
    user.token = createToken(user);

    // Update the user record with the generated token
    const updateTokenQuery = "UPDATE users SET token = ? WHERE id = ?";
    const updateTokenParams = [user.token, user.id];
    await runQuery(updateTokenQuery, updateTokenParams);

    // Return the generated token
    return user.token;
}

// User login function

export async function login(email: string, password: string) {
    let q = `SELECT id, hashedPassword, token FROM users WHERE email = ?;`;
    const res = await runQuery(q, [email]);
    console.log('login user query', res);
    
    if (res.length === 0 || !(await validatePassword(password, res[0].hashedPassword))) {
        throw new UnauthorizedError("Wrong credentials");
    }
    
    const user = new UserModel(res[0]);
    
    // Always generate a new token
    const newToken = createToken(user);
    console.log('New token generated:', newToken);
    
    // Update the user's token in the database
    q = `UPDATE users SET token=? WHERE id=?;`;
    await runQuery(q, [newToken, user.id]);
    
    return newToken;
}

// Get all users

export async function getAllUsers() {
    const q = `SELECT * FROM users;`;
    const res = await runQuery(q);
    const users = res.map((u: any) => new UserModel({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        password: u.hashedPassword,
        email: u.email,
        isAdmin: u.isAdmin,
        token: u.token
    }));
    return users;
}


