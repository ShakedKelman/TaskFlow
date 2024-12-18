
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

// Base configuration class
class BaseAppConfig {
    readonly routePrefix = "/api/v1";
    readonly errorLogFile = path.join(__dirname, '..', 'logs', 'error.log');
    readonly accessLogFile = path.join(__dirname, '..', 'logs', 'access.log');
    readonly jwtSecret = process.env.JWT_SECRET || 'default_secret_key'; // Changed from jwtSecrete to jwtSecret
    readonly vacationsImagesPrefix = path.resolve(__dirname, '..', 'assets', 'images');// Ensure the path is correct in appConfig

    readonly dbConfig = {               
        user: process.env.DB_USER || 'root',   // Default user
        password: process.env.DB_PASSWORD || '',  // Default password
    };
}

// Development configuration
class DevAppconfig extends BaseAppConfig {
    readonly port: number = 4000;       
    readonly dbConfig = {
        ...this.dbConfig,
        host: 'localhost',
        port: 3306,
        database: 'task_flow',                
    };
}

// Production configuration
class ProdAppconfig extends BaseAppConfig {
    readonly port: number = 443;    
    readonly dbConfig = {
        ...this.dbConfig,
        host: 'aws://db:/localZone-use123123', // Update with your actual host
        port: 3309,
        database: 'store_prod',                
    };
}


// Export the appropriate configuration based on environment
export const appConfig = process.env.IS_PRODUCTION === "true"
    ? new ProdAppconfig()
    : new DevAppconfig();

