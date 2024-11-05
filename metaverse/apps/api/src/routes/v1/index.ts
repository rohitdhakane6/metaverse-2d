import { Router } from "express";
import userRoutes from "./user";

const routes: Router = Router();

routes.use("/user", userRoutes);

export default routes;                
