import { appConfig } from "../src/utils/appConfig";

// Log the configuration to verify the settings
console.log("Port:", appConfig.port);
console.log("Route Prefix:", appConfig.routePrefix);
console.log("JWT Secret:", appConfig.jwtSecret);
console.log("Error Log File:", appConfig.errorLogFile);
console.log("Access Log File:", appConfig.accessLogFile);
console.log("Database Configuration:", appConfig.dbConfig);
