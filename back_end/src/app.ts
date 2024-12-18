import express, { NextFunction, Request, Response } from "express"
import cors from "cors"
import { appConfig } from "./utils/appConfig";
import { isDbServerUp, serveImage } from "./utils/helpers";
import catchAll from "./middlewares/catchAll";
import { logMW } from "./middlewares/logMW";
import { vacationRoutes } from "./controllers/vacationsController";
import fileUpload from "express-fileupload";
import { followerRoutes } from "./controllers/followerController";
import { imagesRoute } from "./controllers/imagesController";
import { userRoutes } from "./controllers/userControllers";
import { updateApiCount } from "./middlewares/apiCount";


// create server
const server = express();


server.use(cors({ origin: "http://localhost:3000" }));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}));


// log
server.use(logMW);
server.use(updateApiCount);

// load body
server.use(express.json());

server.options('*', cors()); // Enable pre-flight for all routes

// register controllers
server.use("/", userRoutes);
server.use("/", vacationRoutes);
server.use("/", imagesRoute);
server.use("/", followerRoutes);


// Error handling
server.use(catchAll);

// run server only if DB-server is active
isDbServerUp().then((isUp) => {
    if (isUp) {
        server.listen(appConfig.port, () => {
            console.log(`Listening on http://localhost:${appConfig.port}`);
        })
    } else {
        console.error("\n\n****\nDB server is not up!!!\n****\n");
    }

})
