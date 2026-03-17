import { Router } from "express";
import { userLogin, userLogout } from "../controllers/auth.user.controller.js";
import validate from "../utils/validate.js";
import { userAuthSchema } from "../schemas/auth.user.schema.js";

const userAuthRouter = Router();

userAuthRouter.post("/login", validate(userAuthSchema), userLogin);
userAuthRouter.post("/logout", userLogout);

export default userAuthRouter;
