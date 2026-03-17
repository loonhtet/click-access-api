import { Router } from "express";

import validate from "../utils/validate.js";
import {
  createAdmin,
  deleteAdmin,
  getAdmins,
  getSingleAdmin,
  updateAdmin,
} from "../controllers/admin.controller.js";
import { adminSchema } from "../schemas/admin.schema.js";

const adminRouter = Router();

adminRouter.get("/", getAdmins);

adminRouter.get("/:id", getSingleAdmin);

adminRouter.post("/", validate(adminSchema), createAdmin);

adminRouter.put("/:id", updateAdmin);

adminRouter.delete("/:id", deleteAdmin);

export default adminRouter;
