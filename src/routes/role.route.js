import { Router } from "express";

import { roleSchema } from "../schemas/role.schema.js";
import validateRequest from "../utils/validateRequest.js";
import {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
} from "../controllers/role.controller.js";

const roleRouter = Router();

roleRouter.get("/", getRoles);

roleRouter.post("/", validateRequest(roleSchema), createRole);

roleRouter.put("/:id", updateRole);

roleRouter.delete("/:id", deleteRole);

export default roleRouter;
