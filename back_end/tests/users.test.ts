import express from "express";
import request from "supertest";
import { appConfig } from "../src/utils/appConfig";
import { StatusCode } from "../src/models/statusEnum";
import { closeDB } from "../src/db/dal";
import { userRoutes } from "../src/controllers/userControllers";
import jwt from "jsonwebtoken";  // Ensure JWT is used to validate tokens

const app = express();
app.use(express.json());
app.use(userRoutes);

describe("User Login", () => {
    const uniqueEmail = `loginTest${Date.now()}@example.com`; // unique email for registration
    const password = "password123";
    const firstNameUnique= `firstName${Date.now()}`
    const lastNameUnique= `lastName${Date.now()}`


    beforeAll(async () => {
        console.log("beforeAll: Registering a user before login test");

        // Register a user before testing login
        await request(app)
            .post(appConfig.routePrefix + "/register")
            .send({
                firstName: firstNameUnique,
                lastName: lastNameUnique,
                email: uniqueEmail,
                password,
                isAdmin: false
            });
    });


//Should login a registered user
    it("Should login a registered user", async () => {
        const response = await request(app)
            .post(appConfig.routePrefix + "/login")
            .send({
                email: uniqueEmail,
                password
            });

        console.log("Login response body:", response.body);

        expect(response.status).toBe(StatusCode.Ok);
        expect(response.body).toHaveProperty("token");

        // Decode and verify the JWT token
        const decodedToken = jwt.decode(response.body.token);
        console.log(decodedToken,"%%%%%%%%%%%5");
        
        expect(decodedToken).toBeTruthy();

        if (decodedToken && typeof decodedToken !== "string") {
            expect(decodedToken).toHaveProperty("userWithoutPassword");
            expect(decodedToken.userWithoutPassword).toHaveProperty("email", uniqueEmail);
            expect(decodedToken.userWithoutPassword).not.toHaveProperty("password");
        } else {
            throw new Error("Token is not in the expected format");
        }
    });
//Should return an error for invalid credentials
    it("Should return an error for invalid credentials", async () => {
        const response = await request(app)
            .post(appConfig.routePrefix + "/login")
            .send({
                email: uniqueEmail,
                password: "wrongPassword"
            });

        expect(response.status).toBe(StatusCode.Unauthorized);
        expect(response.body).toHaveProperty("message", "Invalid email or password");
    });

//Should return an error for missing email or password

    it("Should return an error for missing email or password", async () => {
        const response = await request(app)
            .post(appConfig.routePrefix + "/login")
            .send({
                email: "",
                password
            });

        expect(response.status).toBe(StatusCode.BadRequest);
        expect(response.body).toHaveProperty("message", "Email and password are required");
    });
//checking route get all users 
    it("Should return list of users", async () => {
        const response = await request(app)
            .get(appConfig.routePrefix + "/allUsers")

        expect(response.status).toBe(StatusCode.Ok);
        expect(Array.isArray(response.body)).toBe(true);        
    })

});
afterAll(async () => {
    console.log("afterAll: Closing DB");
    await closeDB();
});